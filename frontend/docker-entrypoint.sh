#!/bin/sh
set -e

if [ -n "$PORTAL_API_UPSTREAM" ]; then
  case "$PORTAL_API_UPSTREAM" in
    http://*|https://*)
      API_UPSTREAM="$PORTAL_API_UPSTREAM"
      API_HOST="${PORTAL_API_UPSTREAM#*://}"
      ;;
    *)
      API_UPSTREAM="https://${PORTAL_API_UPSTREAM}"
      API_HOST="$PORTAL_API_UPSTREAM"
      ;;
  esac
  API_HOST="${API_HOST%%/*}"
  API_HOST="${API_HOST%%:*}"
else
  API_UPSTREAM="http://127.0.0.1:8011"
  API_HOST="127.0.0.1"
fi

sed -i "s|__PORTAL_API_UPSTREAM__|${API_UPSTREAM}|g" /etc/nginx/conf.d/default.conf
sed -i "s|__PORTAL_API_HOST__|${API_HOST}|g" /etc/nginx/conf.d/default.conf

exec "$@"
