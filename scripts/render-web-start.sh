#!/bin/sh
set -e

cd /app

# API must be up before nginx proxies /api — otherwise custom + default portal URLs return 502.
uvicorn app.main:app --host 127.0.0.1 --port 8011 &
API_PID=$!

i=0
while [ "$i" -lt 45 ]; do
  if curl -sf "http://127.0.0.1:8011/health" >/dev/null 2>&1; then
    echo "Portal API ready on :8011"
    break
  fi
  i=$((i + 1))
  sleep 1
done

if ! curl -sf "http://127.0.0.1:8011/health" >/dev/null 2>&1; then
  echo "ERROR: Portal API failed to start" >&2
  kill "$API_PID" 2>/dev/null || true
  exit 1
fi

exec nginx -g 'daemon off;'
