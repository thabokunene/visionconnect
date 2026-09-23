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
| `capabilities.html` | Six service detail sections (DG, abnormal, cross-border, bulk, containers, driver supply) |
| `corridors.html` | Interactive map + corridor group cards for eight SADC countries |
| `fleet.html` | Full fleet configuration + compliance card grid |
| `about.html` | Company story, number counters, leadership, values |
| `case-studies.html` | Four full case study articles |
| `contact.html` | Multi-step quote form + contact details sidebar |
| `drivers.html` | Driver recruitment + temporary driver supply (application & hire forms) |
| `ui.html` | Living style guide for the `vc-*` Web Component library (UI Kit) |

All product pages share one stylesheet entry (`assets/css/main.css`). Product pages
add one script entry (`assets/js/main.js`); pages that use `<vc-*>` tags also
load `assets/js/ui.js` (component registration only). Navigation, pre-header
and footer are uniform across every page.

## Project layout

```
*.html                   Page documents (no inline CSS/JS); ui.html = style guide
assets/css/main.css      Stylesheet composition root (@import pipeline)
assets/css/core/         Tokens, reset, layout primitives
assets/css/components/   Reusable UI (wordmark, CTA link, buttons, order form,
                         ui.css for all vc-* component styles)
assets/css/sections/     One module per page section + its breakpoints
                         (drivers.css = recruitment + temp supply page)
assets/css/accessibility.css   Focus + reduced-motion (loads last)
assets/js/main.js        JS composition root (page features)
assets/js/ui.js          Component composition root (opt-in, idempotent)
assets/js/core/          Stateless utilities (animate-count, a11y)
assets/js/features/      One module per interactive feature (page-safe guards;
                         order-form + driver-forms)
assets/js/components/    Web Components: button, counter, field, toast,
                         disclosure, skeleton, empty-state, badge
docs/ARCHITECTURE.md     Full architectural breakdown & scaling playbook
docs/COMPONENTS.md       Component architecture, props/API, examples, best practices
```

## UI component library

Zero-dependency Custom Elements (light DOM) sharing the site’s design tokens:

```html
<vc-button variant="primary" loading>Saving…</vc-button>
<vc-counter value="14280" format="grouped" aria-label="Loads"></vc-counter>
<vc-field label="Email" required>
  <input class="form-input" type="email" name="email">
</vc-field>
```

```html
<script type="module" src="assets/js/main.js"></script>
<script type="module" src="assets/js/ui.js"></script>
```

Load `ui.js` only on pages that use `<vc-*>` tags (the seven parity pages
intentionally do not). See [docs/COMPONENTS.md](docs/COMPONENTS.md) for the
full API and best practices; open `/ui.html` for the living style guide.

## Documentation

See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) for the layered dependency
rule, the cascade contract, behavior-parity verification results (including
the documented navigation exception), and the playbook for adding
sections/pages/features. See [docs/COMPONENTS.md](docs/COMPONENTS.md) for
component architecture, props/API tables, usage examples, and the
definition-of-done checklist.
