<div align="center">
<img src="assets/logo.svg" width="120" alt="Oryvex Worker Panel logo">

# Oryvex Worker Panel

**Self-hosted VLESS / Trojan / Shadowsocks control panel that runs entirely on Cloudflare Workers + D1.**
Created by Muvixo · Mint design system (light + dark) · English UI · bundled Geist fonts · MIT licensed
</div>

![Oryvex Worker Panel dashboard](../docs/preview/panel.png)

---

## Features
- VLESS, Trojan and Shadowsocks over WebSocket, multi-protocol subscriptions (text + YAML/Clash)
- Up to 8 locations per user, outbound SOCKS5/HTTP proxy chains, automatic failover for broken proxies
- Clean Cloudflare IP rotation, IPv6 and domain support, built-in IP and proxy scanners
- TLS fragment, ClientHello fingerprints and per-ISP presets
- Quotas by traffic, days, requests and devices; start-on-first-connect; automatic resets
- Bulk actions, JSON backup/restore, per-user status pages with QR codes
- Ad and adult-content blocking over DNS-over-HTTPS
- Installable PWA, light and dark modes, live Cloudflare request and D1 quota meters
- In-panel self-update from **your own** GitHub repository

## Screenshots (1.0.4)
| | |
|---|---|
| **Setup** | **Login** |
| ![Setup](../docs/screenshots/01-setup.png) | ![Login](../docs/screenshots/02-login.png) |
| **Landing** | **Rules notice** |
| ![Landing](../docs/screenshots/03-landing.png) | ![Rules notice](../docs/screenshots/04-rules-notice.png) |
| **Dashboard (dark)** | **Dashboard (light)** |
| ![Dashboard (dark)](../docs/screenshots/05-dashboard-dark.png) | ![Dashboard (light)](../docs/screenshots/06-dashboard-light.png) |
| **Create user: details** | **Create user: ports & IP** |
| ![Create user: details](../docs/screenshots/07-create-user-details.png) | ![Create user: ports & IP](../docs/screenshots/08-create-user-network.png) |
| **Create user: proxy** | **Edit user** |
| ![Create user: proxy](../docs/screenshots/09-create-user-proxy.png) | ![Edit user](../docs/screenshots/10-edit-user.png) |
| **Settings** | **Telegram proxy users** |
| ![Settings](../docs/screenshots/11-settings.png) | ![Telegram proxy users](../docs/screenshots/12-telegram.png) |
| **Telegram limits** | **Rocket (single-location config)** |
| ![Telegram limits](../docs/screenshots/13-telegram-limits.png) | ![Rocket (single-location config)](../docs/screenshots/14-rocket.png) |
| **Region** | **Proxy selector (VIP)** |
| ![Region](../docs/screenshots/15-region.png) | ![Proxy selector (VIP)](../docs/screenshots/16-proxy-selector-vip.png) |
| **Clean IP selector** | **IP scanner** |
| ![Clean IP selector](../docs/screenshots/17-ip-selector.png) | ![IP scanner](../docs/screenshots/18-ip-scanner.png) |
| **Subscription QR** | **About** |
| ![Subscription QR](../docs/screenshots/19-sub-qr.png) | ![About](../docs/screenshots/20-about.png) |
| **Update token** | **Confirm delete** |
| ![Update token](../docs/screenshots/21-update-token.png) | ![Confirm delete](../docs/screenshots/22-confirm-delete.png) |
| **Toasts** | **User status page** |
| ![Toasts](../docs/screenshots/23-toasts.png) | ![User status page](../docs/screenshots/24-status-page.png) |
| **Create user (light)** | **Telegram (light)** |
| ![Create user (light)](../docs/screenshots/25-create-user-light.png) | ![Telegram (light)](../docs/screenshots/26-telegram-light.png) |
| **Mobile dashboard** | **Mobile menu** |
| ![Mobile dashboard](../docs/screenshots/27-mobile-dashboard.png) | ![Mobile menu](../docs/screenshots/28-mobile-menu.png) |
| **Mobile users** | **Mobile create user** |
| ![Mobile users](../docs/screenshots/29-mobile-users.png) | ![Mobile create user](../docs/screenshots/30-mobile-create-user.png) |
| **Mobile proxy (VIP)** | **Mobile footer** |
| ![Mobile proxy (VIP)](../docs/screenshots/31-mobile-proxy-vip.png) | ![Mobile footer](../docs/screenshots/32-mobile-footer.png) |
| **Tablet dashboard** | **Announcement** |
| ![Tablet dashboard](../docs/screenshots/33-tablet-dashboard.png) | ![Announcement](../docs/screenshots/34-announcement.png) |

### Deployer
| Desktop | Mobile |
|---|---|
| ![Oryvex Deployer](../docs/preview/deployer.png) | <img src="../docs/preview/deployer-mobile.png" width="260" alt="Oryvex Deployer on mobile"> |

## Deploy (Cloudflare dashboard)
1. Fork or upload this folder to your own GitHub repository.
2. In `Source.js`, set `ORYVEX_REPO_SLUG` to `oryvexofficial/OryvexWorkerPanel` (or add a `REPO_SLUG` variable in the Worker settings).
3. Cloudflare dashboard → **Storage & Databases → D1** → create a database.
4. **Workers & Pages → Create → Worker**, paste the contents of `Source.js`, then deploy.
5. Worker **Settings → Bindings** → add a D1 binding named **`DB`** pointing at your database.
6. Open `https://<your-worker>.workers.dev/panel` and set your admin password. Save it somewhere safe.

## Updating
The panel compares `version.txt` in your repository with its own version. To release an update, push a new `Source.js`, bump `version.txt`, and use the update button (it needs a Cloudflare API token with Worker edit permission).

## Relay proxy (optional)
Install a private SOCKS5 relay on a Linux VPS:
```bash
bash <(curl -Ls https://raw.githubusercontent.com/oryvexofficial/OryvexWorkerPanel/main/oryvex-relay.sh)
```

## Project layout
| Path | What it is |
|---|---|
| `Source.js` | The whole worker: API, proxy core and the UI |
| `fonts/` | Geist and Geist Mono (TTF + WOFF2) |
| `flags/` | 271 country flags (SVG, 4x3 + 1x1), served by the worker at `/assets/flags/` |
| `assets/` | Logo (SVG + PNG) |
| `ips.txt`, `ip6.txt`, `dom.txt`, `proxy/`, `proxy_vip/`, `vip-list` | Data files the panel reads from your repository |
| `oryvex-scanner.txt` | Local clean-IP scanner (Python and PowerShell); reads its data from your repository |
| `docs/preview/` | SVG previews (the PNG screenshots live in the repository root `docs/`) |
| `oryvex-relay.sh` | SOCKS5 relay installer |

## License &amp; credits
MIT. See `LICENSE`.

## Responsive
Every screen is verified at 1440, 820 and 390 px wide in light and dark mode. See the screenshots above.
