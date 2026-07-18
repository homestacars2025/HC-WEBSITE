# Minimal Caddy reverse proxy for the Kuveyt Türk POS gateway.
# The base image's default command runs:
#   caddy run --config /etc/caddy/Caddyfile --adapter caddyfile
FROM caddy:2-alpine
COPY Caddyfile /etc/caddy/Caddyfile

EXPOSE 80

# Optional container-level healthcheck hitting the local /healthz route.
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
	CMD wget -qO- http://127.0.0.1:80/healthz || exit 1
