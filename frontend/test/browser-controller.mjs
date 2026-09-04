import { spawn } from 'node:child_process';
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';

const EDGE_PATH = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const DEBUG_PORT = 9222;

export class BrowserController {
  constructor(port = DEBUG_PORT) {
    this.port = port;
    this.process = null;
    this.ws = null;
    this.msgId = 1;
    this.callbacks = new Map();
  }

  async start() {
    // Launch headless Edge with debugging port
    this.process = spawn(EDGE_PATH, [
      '--headless=new',
      '--disable-gpu',
      `--remote-debugging-port=${this.port}`,
      '--window-size=1920,1080',
      '--hide-scrollbars',
      '--disable-background-timer-throttling',
      '--disable-backgrounding-occluded-windows',
      '--disable-renderer-backgrounding',
      'about:blank'
    ], { stdio: 'ignore' });

    // Poll until debugging port is available
    let connected = false;
    for (let i = 0; i < 30; i++) {
      try {
        const list = await this._httpGet(`http://127.0.0.1:${this.port}/json/list`);
        if (list && list.length > 0) {
          const wsUrl = list[0].webSocketDebuggerUrl;
          await this._connectWs(wsUrl);
          connected = true;
          break;
        }
      } catch (err) {
        await new Promise(r => setTimeout(r, 200));
      }
    }

    if (!connected) {
      throw new Error('Failed to connect to browser CDP port');
    }

    // Enable Page, Runtime, DOM
    await this.send('Page.enable');
    await this.send('Runtime.enable');
    await this.send('DOM.enable');
  }

  _httpGet(url) {
    return new Promise((resolve, reject) => {
      http.get(url, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          try {
            resolve(JSON.parse(data));
          } catch (e) {
            reject(e);
          }
        });
      }).on('error', reject);
    });
  }

  _connectWs(url) {
    return new Promise((resolve, reject) => {
      this.ws = new WebSocket(url);
      this.ws.onopen = () => resolve();
      this.ws.onerror = (e) => reject(e);
      this.ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (data.id && this.callbacks.has(data.id)) {
          const { resolve, reject } = this.callbacks.get(data.id);
          this.callbacks.delete(data.id);
          if (data.error) reject(data.error);
          else resolve(data.result);
        }
      };
    });
  }

  send(method, params = {}) {
    return new Promise((resolve, reject) => {
      const id = this.msgId++;
      this.callbacks.set(id, { resolve, reject });
      this.ws.send(JSON.stringify({ id, method, params }));
    });
  }

  async navigate(url) {
    await this.send('Page.navigate', { url });
    await new Promise(r => setTimeout(r, 2000));
  }

  async setViewport(width, height, dpr = 1) {
    await this.send('Emulation.setDeviceMetricsOverride', {
      width,
      height,
      deviceScaleFactor: dpr,
      mobile: width < 600,
      screenWidth: width,
      screenHeight: height
    });
  }

  async evaluate(expression) {
    const res = await this.send('Runtime.evaluate', {
      expression,
      returnByValue: true,
      awaitPromise: true
    });
    return res.result?.value;
  }

  async screenshot(filePath) {
    const res = await this.send('Page.captureScreenshot', { format: 'png' });
    const buffer = Buffer.from(res.data, 'base64');
    fs.mkdirSync(path.dirname(filePath), { recursive: true });
    fs.writeFileSync(filePath, buffer);
    return filePath;
  }

  async click(x, y) {
    await this.send('Input.dispatchMouseEvent', {
      type: 'mousePressed',
      x,
      y,
      button: 'left',
      clickCount: 1
    });
    await new Promise(r => setTimeout(r, 50));
    await this.send('Input.dispatchMouseEvent', {
      type: 'mouseReleased',
      x,
      y,
      button: 'left',
      clickCount: 1
    });
  }

  async mouseMove(x, y) {
    await this.send('Input.dispatchMouseEvent', {
      type: 'mouseMoved',
      x,
      y
    });
  }

  async wait(ms) {
    return new Promise(r => setTimeout(r, ms));
  }

  async close() {
    if (this.ws) {
      try { this.ws.close(); } catch (e) {}
    }
    if (this.process) {
      try { this.process.kill(); } catch (e) {}
    }
  }
}
