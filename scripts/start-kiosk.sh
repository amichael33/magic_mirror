#!/bin/bash
# Chromium kiosk — run AFTER "npm start" is running (or use systemd mirror.service).
set -e

PORT="${PORT:-8080}"
URL="http://127.0.0.1:${PORT}/"

command -v unclutter >/dev/null && unclutter -idle 0 &

CHROMIUM=""
for bin in chromium-browser chromium google-chrome; do
  if command -v "$bin" >/dev/null; then
    CHROMIUM="$bin"
    break
  fi
done

if [ -z "$CHROMIUM" ]; then
  echo "No chromium browser found. Install: sudo apt install chromium-browser"
  exit 1
fi

exec "$CHROMIUM" \
  --kiosk \
  --noerrdialogs \
  --disable-infobars \
  --disable-session-crashed-bubble \
  --check-for-update-interval=31536000 \
  "$URL"
