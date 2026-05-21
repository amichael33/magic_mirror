# Magic Mirror (Vilros V4, vertical)

Web dashboard for a **vertically mounted** Vilros Magic Mirror V4. Assumes the Pi is already wired (HDMI + power) and **Node.js** is installed.

Display after rotation: **1080×1920** (portrait). Set `orientation: "portrait"` in `config.js` (default).

## Pi display rotation (required for vertical)

On the Pi, rotate the framebuffer so the tall mirror fills the screen:

**Raspberry Pi OS Bookworm** — edit `/boot/firmware/config.txt`:

```ini
# Portrait, clockwise (try 3 if the image is upside-down)
display_hdmi_rotate=1
```

**Older Pi OS** — same file may use:

```ini
display_rotate=1
```

Reboot: `sudo reboot`

## Deploy to your Pi (fresh copy)

From your Windows PC (adjust host/user/path):

```powershell
scp -r c:\Users\adolp\code\magic_mirror pi@YOUR_PI_HOST:~/magic_mirror
```

On the Pi:

```bash
cd ~/magic_mirror
npm start
```

Open `http://YOUR_PI_IP:8080` from another device to verify, or on the Pi:

```bash
chromium-browser http://127.0.0.1:8080
```

## Run on every boot

### 1. Node server (systemd)

```bash
sudo cp ~/magic_mirror/scripts/mirror.service /etc/systemd/system/magic-mirror.service
sudo nano /etc/systemd/system/magic-mirror.service
# Set User= and WorkingDirectory= to your actual user/folder

sudo systemctl daemon-reload
sudo systemctl enable --now magic-mirror.service
sudo systemctl status magic-mirror.service
```

### 2. Chromium kiosk (desktop autostart)

```bash
mkdir -p ~/.config/autostart
cp ~/magic_mirror/scripts/autostart-magic-mirror.desktop ~/.config/autostart/
nano ~/.config/autostart/autostart-magic-mirror.desktop
# Fix the path in Exec= if not /home/pi/magic_mirror

chmod +x ~/magic_mirror/scripts/start-kiosk.sh
```

Reboot. The server starts first; kiosk opens after a short delay.

### Alternative: PM2 (if you already use it)

```bash
cd ~/magic_mirror
pm2 start server.js --name magic-mirror
pm2 save
```

## Configure

Edit `~/magic_mirror/config.js` on the Pi:

| Setting | Notes |
|---------|--------|
| `orientation` | `"portrait"` (vertical) or `"landscape"` |
| `timezone` | e.g. `America/Chicago` |
| `weather` | Houston defaults; no API key |
| `greeting.name` | Optional |
| `calendar.events` | Until you add a calendar API |

After edits: `sudo systemctl restart magic-mirror` (or refresh the browser).

## Portrait layout

```
┌──────────────┐
│ TIME    ☀️ ° │
│ DATE         │
│ Good morning │
│              │
│  reflection  │
│              │
│ calendar     │
│  compliment  │
└──────────────┘
```

Use the mirror’s **brightness buttons** so white text shows through the glass.

## Local dev on Windows

```powershell
cd c:\Users\adolp\code\magic_mirror
npm start
```

Preview portrait: open `http://localhost:8080`, narrow the window or use DevTools device mode with 1080×1920.

## Not MagicMirror²

This is a small custom UI (HTML + `config.js`), not the [MagicMirror²](https://docs.magicmirror.builders/) project. If you were on MM² before, you can either keep using this stack or reinstall MM² separately — this repo does not conflict with Node on the Pi.

## Files

| File | Purpose |
|------|---------|
| `server.js` | Node static server (port 8080) |
| `config.js` | Mirror settings |
| `scripts/start-kiosk.sh` | Fullscreen Chromium |
| `scripts/mirror.service` | systemd template |
