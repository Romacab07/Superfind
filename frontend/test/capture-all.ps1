$edge = "C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"
$outDir = "F:\WWZ\docs\screenshots"
New-Item -ItemType Directory -Force -Path $outDir | Out-Null

# 1. Desktop Dark
Start-Process -FilePath $edge -ArgumentList "--headless", "--disable-gpu", "--window-size=1920,1080", "--virtual-time-budget=2500", "--screenshot=$outDir\final_desktop_dark.png", "http://127.0.0.1:5173/" -Wait

# 2. Desktop Light
# We can set light theme via query parameter or localStorage by opening
Start-Process -FilePath $edge -ArgumentList "--headless", "--disable-gpu", "--window-size=1920,1080", "--virtual-time-budget=2500", "--screenshot=$outDir\final_desktop_light.png", "http://127.0.0.1:5173/?theme=light" -Wait

# 3. Tablet
Start-Process -FilePath $edge -ArgumentList "--headless", "--disable-gpu", "--window-size=1024,768", "--virtual-time-budget=2500", "--screenshot=$outDir\final_tablet.png", "http://127.0.0.1:5173/" -Wait

# 4. Mobile
Start-Process -FilePath $edge -ArgumentList "--headless", "--disable-gpu", "--window-size=390,844", "--virtual-time-budget=2500", "--screenshot=$outDir\final_mobile.png", "http://127.0.0.1:5173/" -Wait

Get-ChildItem -Path $outDir
