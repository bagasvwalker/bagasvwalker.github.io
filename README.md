# Bagas Vitoro — Portfolio

Personal portfolio site for an Electrical & Automation Engineering student, styled as an industrial control-panel / equipment nameplate. Static HTML/CSS/JS — no build step, no framework, no dependencies.

**Live:** deployed locally via `python -m http.server` and exposed to the internet through [Cloudflare Tunnel](https://developers.cloudflare.com/cloudflare-one/connections/connect-networks/) (see [Deployment](#deployment) below). GitHub Pages preview: `https://<your-username>.github.io/<repo-name>/`.

![status](https://img.shields.io/badge/status-active-brightgreen) ![license](https://img.shields.io/badge/license-MIT-blue) ![stack](https://img.shields.io/badge/stack-HTML%20%2F%20CSS%20%2F%20JS-orange)

---

## Stack

| Layer      | Tech                              |
|------------|------------------------------------|
| Markup     | Semantic HTML5                     |
| Styling    | Vanilla CSS3 (custom properties, no framework) |
| Behavior   | Vanilla JavaScript (ES2020+, no dependencies) |
| Local host | Python 3 `http.server`             |
| Public URL | Cloudflare Tunnel + Cloudflare DNS |

No `node_modules`, no bundler, no runtime dependency. Clone it and it works.

## Project structure

```
.
├── index.html              # Single-page markup: hero, about, experience, projects, skills, contact
├── style.css                # Design system (tokens, components, responsive rules)
├── script.js                 # Mobile nav, scroll-spy, uptime clock, clipboard copy
├── server.sh                  # Local dev server manager (start/stop/restart/status/logs)
├── assets/
│   └── photo.jpg              # Profile photo
├── .github/workflows/deploy.yml   # Auto-deploy to GitHub Pages on push to main
├── LICENSE
└── README.md
```

## Run locally

Requires only Python 3 (already on most systems) — no `npm install`, nothing to build.

```bash
git clone https://github.com/<your-username>/<repo-name>.git
cd <repo-name>
chmod +x server.sh
./server.sh start      # serves on http://127.0.0.1:8080
```

Other commands:

```bash
./server.sh status    # is it running?
./server.sh logs       # tail the server log
./server.sh restart    # restart
./server.sh stop        # stop
```

Or skip the script entirely:

```bash
python3 -m http.server 8080
```

## Deployment

This site is designed to run two ways simultaneously:

### 1. GitHub Pages (static preview)
Enabled via the included workflow at [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml). On every push to `main`:
1. Checks out the repo
2. Uploads the repo root as a Pages artifact
3. Deploys it to GitHub Pages

**One-time setup:** In the repo → **Settings → Pages → Build and deployment → Source**, select **GitHub Actions**. No further config needed — the workflow handles the rest.

### 2. Cloudflare Tunnel (custom domain, runs from your own machine)
The "real" deployment target this project was built for — the site runs on your local machine and Cloudflare Tunnel exposes it under a custom domain, no port forwarding required:

```bash
cloudflared tunnel login
cloudflared tunnel create my-portfolio-tunnel
cloudflared tunnel route dns my-portfolio-tunnel yourdomain.com
cloudflared tunnel route dns my-portfolio-tunnel www.yourdomain.com
```

`~/.cloudflared/config.yml`:
```yaml
tunnel: my-portfolio-tunnel
credentials-file: /home/<user>/.cloudflared/<TUNNEL-UUID>.json

ingress:
  - hostname: yourdomain.com
    service: http://localhost:8080
  - hostname: www.yourdomain.com
    service: http://localhost:8080
  - service: http_status:404
```

```bash
./server.sh start
cloudflared tunnel run my-portfolio-tunnel
```

Then enable **Always Use HTTPS** in the Cloudflare dashboard (SSL/TLS tab), and optionally wrap both `server.sh start` and `cloudflared tunnel run` in `systemd --user` services for auto-start on boot.

## Editing content

All content lives directly in `index.html` — there's no CMS or data file. To update:
- **Bio / experience / education** → the `#about` and `#experience` sections
- **Projects** → `.project-card` blocks inside `#projects`
- **Skills** → `.skill-group` blocks inside `#skills`
- **Contact info** → `#contact`, and the `data-copy` attribute on the email copy button in `script.js`'s target element

## Browser support

Uses modern CSS (`color-mix()`, custom properties, `aspect-ratio`) and `IntersectionObserver`. Targets the last two versions of evergreen browsers (Chrome, Firefox, Safari, Edge). No polyfills included by design — this is a personal portfolio, not a product with a legacy-browser SLA.

## License

MIT — see [LICENSE](LICENSE). The code is free to reuse; the content (name, photo, work history) is not — please don't republish it as your own.
