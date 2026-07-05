#!/usr/bin/env bash
# One-time bootstrap for Let's Encrypt certs. Run this ONCE before the first
# `docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d`.
#
# Usage: ./nginx/init-letsencrypt.sh
# Requires: DOMAIN_NAME and CERTBOT_EMAIL set in .env, DNS already pointed at this host.

set -euo pipefail
cd "$(dirname "$0")/.."
source .env

if [ -z "${DOMAIN_NAME:-}" ] || [ -z "${CERTBOT_EMAIL:-}" ]; then
  echo "Set DOMAIN_NAME and CERTBOT_EMAIL in .env first." >&2
  exit 1
fi

echo "Injecting domain into nginx.conf..."
sed -i "s/DOMAIN_NAME_PLACEHOLDER/${DOMAIN_NAME}/g" nginx/nginx.conf

echo "Requesting a temporary self-signed cert so nginx can start..."
mkdir -p "nginx/certbot/conf/live/${DOMAIN_NAME}"
openssl req -x509 -nodes -newkey rsa:2048 -days 1 \
  -keyout "nginx/certbot/conf/live/${DOMAIN_NAME}/privkey.pem" \
  -out "nginx/certbot/conf/live/${DOMAIN_NAME}/fullchain.pem" \
  -subj "/CN=localhost"

echo "Starting nginx with temporary cert..."
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d nginx

echo "Deleting temporary cert and requesting the real one from Let's Encrypt..."
rm -rf "nginx/certbot/conf/live/${DOMAIN_NAME}"
docker compose -f docker-compose.yml -f docker-compose.prod.yml run --rm certbot \
  certonly --webroot -w /var/www/certbot \
  -d "${DOMAIN_NAME}" --email "${CERTBOT_EMAIL}" --agree-tos --no-eff-email

echo "Reloading nginx with the real certificate..."
docker compose -f docker-compose.yml -f docker-compose.prod.yml exec nginx nginx -s reload

echo "Done. HTTPS is live at https://${DOMAIN_NAME}"
