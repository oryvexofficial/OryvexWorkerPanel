# Oryvex Deployer

Paste one Cloudflare API token. The deployer creates the **D1 database**, uploads **Oryvex Worker Panel**, binds the database as `DB`, turns on the `workers.dev` route and prints your panel link. Tables are created by the panel on first load.

| Desktop | Mobile |
|---|---|
| ![Oryvex Deployer](docs/preview/deployer.png) | <img src="docs/preview/deployer-mobile.png" width="260" alt="Oryvex Deployer on mobile"> |

## Demo
![Panel dark](docs/screenshots/05-dashboard-dark.png)

Full gallery: all 34 screens of 1.0.4 in **Screenshots** below.

## Files
| File | Purpose |
|---|---|
| `worker.js` | The deployer Worker (UI + API). The panel source is embedded inside. |
| `panel/` | Full panel project: `Source.js` (the Worker that gets deployed), flags, fonts, data files, docs. |
| `core.js`, `worker_main.js`, `build.mjs` | Deployer source. `node build.mjs` rebuilds `worker.js`. |
| `deploy.mjs` | Command line deploy, no UI needed. |

## 1. Get a token (template)
Open the link printed by `node deploy.mjs --token-url`, or press **Create token (template)** in the deployer, or call `GET /api/token-template`. It pre-fills:
- Workers Scripts : Edit (account)
- D1 : Edit (account)
- Account Settings : Read (account)

Press Continue, then Create Token. Cloudflare always makes you confirm this step.

## 2a. Host the deployer UI
Cloudflare dashboard: Workers & Pages, Create, Worker, paste `worker.js`, Deploy. Open its URL, paste the token, press **Deploy panel**.
Or with Wrangler: `npx wrangler deploy`.

## 2b. Or deploy straight from a terminal
```bash
CF_API_TOKEN=xxxx node deploy.mjs --name oryvex-panel
# options: --db NAME  --repo user/repo (default oryvexofficial/OryvexWorkerPanel)  --account ACCOUNT_ID  --store-token
```
Needs Node 18+.

## API
| Route | What it does |
|---|---|
| `GET /api/token-template` | Token template URL, permission list, steps |
| `GET /api/token-template/redirect` | Redirects to the template page |
| `POST /api/accounts` `{token}` | Accounts the token can see |
| `POST /api/deploy` `{token, workerName?, dbName?, accountId?, repoSlug?, storeToken?}` | Streams progress lines (NDJSON), ends with the panel URL |

## Notes
- Re-running with the same names updates the panel and **reuses the existing D1 database**, so users are kept.
- The token is used for the run only. It is saved inside the panel only if you tick "Keep this token" (`--store-token`).
- A first-time account without a workers.dev subdomain gets one registered automatically.

## Repository
https://github.com/oryvexofficial/OryvexWorkerPanel · maintained by @themuvixo

## What is new in 1.0.4
- **Footer fix:** the footer now sits right at the bottom of every page. No more empty band under it on the dashboard, login, setup, landing and status pages.
- Sign-in, setup and landing pages: the footer moved out of the narrow card to a full-width footer at the bottom of the screen.
- Tablet header: the icon bar no longer wraps the sign-out button onto a second line (768 to 1023 px).
- Status page footer lines up with the page edges on phones.
- Announcement (`panel/message.txt`) bumped to 1.0.4.
- Real deployer screenshots (`docs/preview/deployer.png`, `deployer-mobile.png`) replace the missing image, and all 34 panel screenshots were retaken.

## What is new in 1.0.4
- **Footer fix:** the footer now sits right at the bottom of every page, with no empty band under it (dashboard, login, setup, landing, status page).
- Sign-in, setup and landing pages: footer moved out of the narrow card to a full-width footer at the bottom of the screen.
- Tablet header (768 to 1023 px): the icon bar no longer wraps the sign-out button onto a second line.
- Status page footer lines up with the page edges on phones.
- Announcement (`panel/message.txt`) bumped to 1.0.4.
- Real deployer screenshots replace the missing image, and all 34 panel screenshots were retaken.

## What is new in 1.0.3
- **New font:** Geist (UI) + Geist Mono (numbers, code). Bundled in `panel/fonts/`, served from the worker, no Google Fonts call.
- **One motion vocabulary:** `fadein` `fadeout` `scalein` `scaleout` `slidein` `slideout` `colorin` `colorout`. Nothing else.
- **No X/Y movement** on buttons, cards, modals or toasts. Modals: scrim fades, card scales. Slides are clip-path wipes, never translate.
- **Hover = colour in / colour out:** quick 140 ms in when the pointer touches a button, slow 420 ms out when it leaves. No lift, no jump.
- **Fixed the + (Add user) button** going dark/transparent on hover; it now brightens and gets a soft ring.
- **Suspended header:** floating glass capsule, colours in once you scroll. **Suspended footer:** floating capsule with brand, version, credit, links.
- **Responsive fix:** VIP / public proxy flag pickers no longer squash into one column with a giant Fetch pill; full-width grid + normal button.
- Modals no longer flash on page load; deployer and local scanner use the same font and motion rules.
- Real screenshots of every section, taken from a live run of the panel.

## Screenshots (1.0.4)
Taken from a live run of the 1.0.4 panel: desktop 1440 px, tablet 820 px, phone 390 px.

| | |
|---|---|
| **Setup** | **Login** |
| ![Setup](docs/screenshots/01-setup.png) | ![Login](docs/screenshots/02-login.png) |
| **Landing** | **Rules notice** |
| ![Landing](docs/screenshots/03-landing.png) | ![Rules notice](docs/screenshots/04-rules-notice.png) |
| **Dashboard (dark)** | **Dashboard (light)** |
| ![Dashboard (dark)](docs/screenshots/05-dashboard-dark.png) | ![Dashboard (light)](docs/screenshots/06-dashboard-light.png) |
| **Create user: details** | **Create user: ports & IP** |
| ![Create user: details](docs/screenshots/07-create-user-details.png) | ![Create user: ports & IP](docs/screenshots/08-create-user-network.png) |
| **Create user: proxy** | **Edit user** |
| ![Create user: proxy](docs/screenshots/09-create-user-proxy.png) | ![Edit user](docs/screenshots/10-edit-user.png) |
| **Settings** | **Telegram proxy users** |
| ![Settings](docs/screenshots/11-settings.png) | ![Telegram proxy users](docs/screenshots/12-telegram.png) |
| **Telegram limits** | **Rocket (single-location config)** |
| ![Telegram limits](docs/screenshots/13-telegram-limits.png) | ![Rocket (single-location config)](docs/screenshots/14-rocket.png) |
| **Region** | **Proxy selector (VIP)** |
| ![Region](docs/screenshots/15-region.png) | ![Proxy selector (VIP)](docs/screenshots/16-proxy-selector-vip.png) |
| **Clean IP selector** | **IP scanner** |
| ![Clean IP selector](docs/screenshots/17-ip-selector.png) | ![IP scanner](docs/screenshots/18-ip-scanner.png) |
| **Subscription QR** | **About** |
| ![Subscription QR](docs/screenshots/19-sub-qr.png) | ![About](docs/screenshots/20-about.png) |
| **Update token** | **Confirm delete** |
| ![Update token](docs/screenshots/21-update-token.png) | ![Confirm delete](docs/screenshots/22-confirm-delete.png) |
| **Toasts** | **User status page** |
| ![Toasts](docs/screenshots/23-toasts.png) | ![User status page](docs/screenshots/24-status-page.png) |
| **Create user (light)** | **Telegram (light)** |
| ![Create user (light)](docs/screenshots/25-create-user-light.png) | ![Telegram (light)](docs/screenshots/26-telegram-light.png) |
| **Mobile dashboard** | **Mobile menu** |
| ![Mobile dashboard](docs/screenshots/27-mobile-dashboard.png) | ![Mobile menu](docs/screenshots/28-mobile-menu.png) |
| **Mobile users** | **Mobile create user** |
| ![Mobile users](docs/screenshots/29-mobile-users.png) | ![Mobile create user](docs/screenshots/30-mobile-create-user.png) |
| **Mobile proxy (VIP)** | **Mobile footer** |
| ![Mobile proxy (VIP)](docs/screenshots/31-mobile-proxy-vip.png) | ![Mobile footer](docs/screenshots/32-mobile-footer.png) |
| **Tablet dashboard** | **Announcement** |
| ![Tablet dashboard](docs/screenshots/33-tablet-dashboard.png) | ![Announcement](docs/screenshots/34-announcement.png) |

## What is new in 1.0.2
- Version check now compares versions (cache-busted) and shows an "update available" state; the update dot and tooltip follow it.
- Germany is the default location and region.
- Data limit (GB, 0 = unlimited) in the user form and in a new Edit limits dialog for Telegram users.
- Country codes replaced by flag icons (pickers, rocket grid, status page).
- True circles everywhere (buttons, dots, radios, modal icons), new header, new Sub buttons.
- Dark/light switch with a circular reveal, smoother colour in/out transitions, reduced-motion support.
- Deployer: Your panels and Your DBs after a token is entered, restyled like the panel.
- Scanner restyled like the panel. Created by Muvixo.

## Telegram proxy (Oryvex Telegram core) — in 1.0.1
The panel now embeds **Oryvex Telegram core v1.0.1** (Telegram WEB Proxy for Cloudflare Workers, MIT, by Qorvhex). Open the **Telegram** button in the panel header to:
- create Telegram proxy users, each with its own secret, data limit (GB) and validity (days)
- copy `tg://webproxy` and `https://t.me/webproxy` links or show a QR code
- enable/disable, reset usage, rotate the secret, delete
- turn the Telegram core on/off and set max dials per session

Routes used by Telegram: `/?bridge=…`, `/api/v1/session`, `/api/v1/ws` (same Worker, same D1 database, table `tg_proxies`).
Works with official Telegram apps that support WEB proxies (Desktop 7.1+, Android 12.10+). License: `panel/TG-CORE-LICENSE`.

## Icons
All UI emojis were replaced with inline SVG icons. Emojis inside subscription/config names (country flags in client apps) are kept on purpose, since VPN apps can only show text there.
