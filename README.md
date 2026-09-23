# VisionConnect

Marketing site for Vision Connect — cross-border logistics across Southern
Africa (dangerous goods, abnormal loads, bulk commodities, containerised
freight across eight SADC countries).

Static, zero-dependency multi-page front end: semantic HTML, layered CSS
modules, and ES-module JavaScript. No build step required.

## Run locally

```bash
python3 -m http.server 8080
# open http://localhost:8080
```

(Any static file server works. Serve over HTTP — the page uses ES modules.)

## Pages

| Page | Role |
|---|---|
| `index.html` | Landing: hero, capabilities strip, corridor map, fleet, case study, leadership, contact/order form |
| `capabilities.html` | Five service detail sections (DG, abnormal, cross-border, bulk, containers) |
| `corridors.html` | Interactive map + corridor group cards for eight SADC countries |
| `fleet.html` | Full fleet configuration + compliance card grid |
| `about.html` | Company story, number counters, leadership, values |
| `case-studies.html` | Four full case study articles |
| `contact.html` | Multi-step quote form + contact details sidebar |

All pages share one stylesheet entry (`assets/css/main.css`) and one script
entry (`assets/js/main.js`). Navigation, pre-header and footer are uniform
across every page.

## Project layout

```
*.html                   Seven page documents (no inline CSS/JS)
assets/css/main.css      Stylesheet composition root (@import pipeline)
assets/css/core/         Tokens, reset, layout primitives
assets/css/components/   Reusable UI (wordmark, CTA link, buttons, order form)
assets/css/sections/     One module per page section + its breakpoints
assets/css/accessibility.css   Focus + reduced-motion (loads last)
assets/js/main.js        JS composition root
assets/js/core/          Stateless utilities
assets/js/features/      One module per interactive feature (page-safe guards)
docs/ARCHITECTURE.md     Full architectural breakdown & scaling playbook
```

## Documentation

See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) for the layered dependency
rule, the cascade contract, behavior-parity verification results (including
the documented navigation exception), and the playbook for adding
sections/pages/features.
