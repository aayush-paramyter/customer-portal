#!/bin/sh
set -e

if [ -n "$PORTAL_API_UPSTREAM" ]; then
  sed -i "s|127.0.0.1:8011|${PORTAL_API_UPSTREAM}|g" /etc/nginx/conf.d/default.conf
fi

exec "$@"
