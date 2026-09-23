# VisionConnect

Marketing site for Vision Connect — cross-border logistics across Southern
Africa (dangerous goods, abnormal loads, bulk commodities, containerised
freight across eight SADC countries).

Static, zero-dependency front end: semantic HTML, layered CSS modules, and
ES-module JavaScript. No build step required.

## Run locally

```bash
python3 -m http.server 8080
# open http://localhost:8080
```

(Any static file server works. Serve over HTTP — the page uses ES modules.)

## Project layout

```
index.html              Document shell (no inline CSS/JS)
assets/css/main.css     Stylesheet composition root (@import pipeline)
assets/css/core/        Tokens, reset, layout primitives
assets/css/components/  Reusable UI (wordmark, CTA link, order form)
assets/css/sections/    One module per page section + its breakpoints
assets/css/accessibility.css   Focus + reduced-motion (loads last)
assets/js/main.js       JS composition root
assets/js/core/         Stateless utilities
assets/js/features/     One module per interactive feature
docs/ARCHITECTURE.md    Full architectural breakdown & scaling playbook
```

## Documentation

See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) for the layered dependency
rule, the cascade contract, behavior-parity verification results, and the
playbook for adding sections/pages/features.
