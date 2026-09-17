# context-mode — routing rules

This repository ships the [context-mode](https://github.com/mksglu/context-mode) MCP server
(`.vscode/mcp.json`, `.mcp.json`). Its tools keep raw tool output out of the context window, so
long sessions on this repo don't lose the files they were editing. Rules below are adapted from
context-mode's own Copilot config.

Project conventions (modular monolith rules, GCP/local parity, Definition of Done) live in
[`AGENTS.md`](../AGENTS.md) — that file wins on anything about *what* to build; this one is only
about *where data goes*.

## Think in Code — MANDATORY

To analyze, count, filter, compare, search, parse or transform data: **write code** via
`ctx_execute(language, code)` and `console.log()` only the answer. Do not read raw data into
context. Program the analysis, don't compute it. Pure JavaScript — Node.js built-ins only
(`fs`, `path`, `child_process`). Wrap in `try/catch`, handle `null`/`undefined`.
One script replaces ten tool calls.

## BLOCKED — do not attempt

* **`curl` / `wget`** — intercepted and blocked. Use `ctx_fetch_and_index(url, source)` or
  `ctx_execute(language: "javascript", code: "const r = await fetch(...)")`.
* **Inline HTTP** — `fetch('http`, `requests.get(`, `http.get(` are intercepted.
  Use `ctx_execute`, where only stdout enters context.
* **WebFetch** — use `ctx_fetch_and_index(url, source)` then `ctx_search(queries)`.

## REDIRECTED — use the sandbox

* **Terminal output over ~20 lines** — the terminal is only for `git`, `mkdir`, `rm`, `mv`, `cd`,
  `ls`, `npm install`. Everything else goes through `ctx_batch_execute(commands, queries)` or
  `ctx_execute`. (This repo's `.\mvnw.cmd test` and `npm run build` produce huge logs — pipe them
  through the sandbox and report the summary, not the dump.)
* **`read_file` for analysis** — reading to *edit* is fine. Reading to *analyze, explore or
  summarize* goes through `ctx_execute_file(path, language, code)`.
* **`grep` / search with large results** — filter and count in the sandbox instead.

## Tool selection

0. **MEMORY** — `ctx_search(sort: "timeline")`: after a resume, check prior context before asking.
1. **GATHER** — `ctx_batch_execute(commands, queries)`: one call replaces 30+. Each command is
   `{label: "header", command: "..."}`.
2. **FOLLOW-UP** — `ctx_search(queries: ["q1", "q2", ...])`: all questions in one call.
3. **PROCESSING** — `ctx_execute(language, code)` / `ctx_execute_file(path, language, code)`.
4. **WEB** — `ctx_fetch_and_index(url, source)` then `ctx_search(queries)`.
5. **INDEX** — `ctx_index(content, source)` to store in FTS5 for later search.

Parallel I/O batches: pass `concurrency: 4-8` to `ctx_batch_execute` / `ctx_fetch_and_index`.
Keep `concurrency: 1` for CPU-bound work (test, build, lint).

## Output

Write artifacts to files — never inline. Return the file path plus a one-line description.
Use descriptive `source` labels so `ctx_search(source: "label")` stays useful.

## Memory

Session history is persistent and searchable. On resume, search before asking the user:

| Need | Command |
|------|---------|
| What were we working on? | `ctx_search(queries: ["summary"], source: "compaction", sort: "timeline")` |
| What did we decide? | `ctx_search(queries: ["decision"], source: "decision", sort: "timeline")` |
| What should we not repeat? | `ctx_search(queries: ["rejected"], source: "rejected-approach", sort: "timeline")` |
| What constraints exist? | `ctx_search(queries: ["constraint"], source: "constraint")` |

Do not ask "what were we working on?" — search first. If a search returns nothing, proceed as a
fresh session.

## ctx commands

| Command | Action |
|---------|--------|
| `ctx stats` | Call `ctx_stats`, display the full output verbatim |
| `ctx doctor` | Call `ctx_doctor`, run the returned shell command, display as a checklist |
| `ctx upgrade` | Call `ctx_upgrade`, run the returned shell command, display as a checklist |
| `ctx purge` | Call `ctx_purge` with `confirm: true` (warns before wiping the knowledge base) |

After `/clear` or `/compact` the knowledge base and session stats are preserved. Use `ctx purge`
to start fresh.
