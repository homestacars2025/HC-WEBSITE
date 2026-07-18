# Kuveyt Türk POS — static-IP proxy (Easypanel + Caddy)

Forwards `https://pay-proxy-caddy.gdsddq.easypanel.host/*` →
`https://boatest.kuveytturk.com.tr/*` from the Easypanel server's IP
(`185.170.196.106`), so bank calls come from a whitelistable address instead of
Vercel's egress.

Files: `Caddyfile` (the proxy rule), `Dockerfile` (Caddy image + Caddyfile).

---

## Option A — no build, pure paste (fastest)

Use the official Caddy image and mount the Caddyfile.

1. **Easypanel → your project → + Service → App.** Name it e.g. `pay-proxy-caddy`.
2. **Source → Docker Image:** `caddy:2-alpine`.
3. **Mounts → Add Mount → File:**
   - Content: paste the entire `Caddyfile` from this folder.
   - Mount path: `/etc/caddy/Caddyfile`
4. **Ports/Proxy:** set the exposed **port to `80`**.
5. **Domains → Add Domain:** `pay-proxy-caddy.gdsddq.easypanel.host`, target
   **port 80**, **HTTPS on** (Easypanel issues the Let's Encrypt cert — this is
   the "valid TLS" requirement).
6. **Deploy.**

## Option B — build from this Dockerfile (Git)

1. Commit this `deploy/kuveyt-proxy/` folder to a repo Easypanel can read.
2. **Easypanel → App → Source → GitHub**, pick the repo/branch, set **Build
   path** = `deploy/kuveyt-proxy`, **Builder = Dockerfile**.
3. Port `80`, Domain as in Option A step 5, **Deploy.**

---

## Verify (in order)

1. **Proxy is up (local, doesn't touch the bank):**
   ```
   curl https://pay-proxy-caddy.gdsddq.easypanel.host/healthz
   # → ok
   ```
2. **Proxy reaches the bank from the Easypanel IP** — the decisive test:
   ```
   curl -X POST \
     https://pay-proxy-caddy.gdsddq.easypanel.host/boa.virtualpos.services/Home/ThreeDModelPayGate \
     -H "Content-Type: text/xml; charset=UTF-8" -d "<test/>"
   ```
   - **Expected (good):** a Turkish XML error like
     `Gönderilen İsteğin Formatı Hatalıdır…` → the bank received the request, so
     `185.170.196.106` can reach boatest. You may not even need an explicit
     whitelist for TEST.
   - **If it times out:** the Easypanel IP is blocked too → ask Kuveyt Türk to
     whitelist `185.170.196.106`.

---

## After it verifies

Tell me, and I'll switch the app to the proxy (in `.env.local` + Vercel
Production/Preview) and redeploy:

```
KUVEYT_PAYGATE_URL=https://pay-proxy-caddy.gdsddq.easypanel.host/boa.virtualpos.services/Home/ThreeDModelPayGate
KUVEYT_PROVISION_URL=https://pay-proxy-caddy.gdsddq.easypanel.host/boa.virtualpos.services/Home/ThreeDModelProvisionGate
```

## Going to production later

Change the upstream in `Caddyfile` from `boatest.kuveytturk.com.tr` to the
production host and redeploy the proxy, then point the two env vars at the
production path. Confirm the exact production URL/path with Kuveyt Türk before
switching.
