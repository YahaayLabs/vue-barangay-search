# Product Requirements Document — vue-barangay-search

| | |
| --- | --- |
| **Product** | Vue Barangay Search (`vue-barangay-search`) |
| **Owner** | Yahaay Labs / Spectrum GIS |
| **Version (code)** | `0.2.0` (`package.json`) |
| **Document status** | Living PRD derived from codebase inspection |
| **Package** | [npm: vue-barangay-search](https://www.npmjs.com/package/vue-barangay-search) |
| **Repo** | [YahaayLabs/vue-barangay-search](https://github.com/YahaayLabs/vue-barangay-search) (cluster: `vue-barangay-search/`) |
| **Backend** | [api.gis.ph](https://api.gis.ph) via [gis.ph-sdk](https://www.npmjs.com/package/gis.ph-sdk) |
| **Related** | [README](../README.md), [CHANGELOG](../CHANGELOG.md), sibling [`laravel-barangay-search`](../../laravel-barangay-search), [`gis.ph-sdk-js`](../../gis.ph-sdk-js), cluster [README](../../README.md) |

---

## 1. Product overview

### 1.1 One-liner

**vue-barangay-search** is a drop-in Vue 3 autocomplete component that lets applications search Philippine barangays against the official GIS.ph API, with v-model selection and scoped default styling.

### 1.2 Problem statement

Philippine web apps (forms, KYC, delivery, government, mapping) repeatedly need users to pick a **barangay**. Doing that well requires:

1. Authoritative, up-to-date PSGC-style place data (not a hand-maintained JSON dump)
2. Fast typeahead UX (debounce, loading, empty/error states)
3. A structured selection object (name + municipality + province + codes when available), not free text alone
4. Minimal integration cost for Vue 3 teams already on GIS.ph

Without a packaged component, every app reimplements autocomplete, auth headers, and result formatting against `api.gis.ph`.

### 1.3 Product goals

| Goal | How the codebase supports it today |
| --- | --- |
| **Drop-in Vue 3 component** | Named export `BarangaySearch` + optional plugin `install` in `src/index.ts` |
| **Official API, not raw fetch** | `GisPh` client from `gis.ph-sdk` → `client.barangays.search({ q })` |
| **Auth flexibility** | Props `accessToken` and/or `apiKey` passed into SDK constructor |
| **Typeahead UX** | Debounced search (300 ms), min length 2, loading text, dropdown, empty state, error line |
| **v-model selection** | Emits `update:modelValue` + `select` with full result object |
| **Ship as library** | Vite lib mode (ESM + UMD), `vite-plugin-dts` types, CSS export path |
| **DX playground** | `bun dev` → `playground/` sample Vue checkout form (realistic integration demo) |

### 1.4 Non-goals (current product scope)

- Full cascading address UI (region → province → city/municipality → barangay as a multi-step form)
- Map / GeoJSON rendering of selected barangay geometry
- Server-side rendering of search results (this is a browser component; API key exposure is the integrator’s concern)
- Offline / local PSGC database
- Frameworks other than Vue 3 (Laravel Livewire is a separate package)
- Billing, key issuance, or dashboard UX (lives on `gis.ph` / `dashboard.gis.ph`)

### 1.5 Product positioning in the GIS.ph stack

```
Integrator's Vue 3 app
  └── vue-barangay-search  (<BarangaySearch />)
        └── gis.ph-sdk  (GisPh client)
              └── GET https://api.gis.ph/v1/barangays/search?q=…
```

Sibling for Laravel:

| Package | Runtime | Role |
| --- | --- | --- |
| `vue-barangay-search` | Vue 3 SPA / Nuxt client | Client-side autocomplete |
| `laravel-barangay-search` | Laravel + Livewire 3 | Server-driven autocomplete + optional Mary UI + cache |

Both target the same API product surface and similar UX; feature parity is intentional but not yet complete (see §7).

---

## 2. Users & use cases

| Persona | Needs | How they use the package |
| --- | --- | --- |
| **Vue / Nuxt app developer** | Embed barangay picker in a form with minimal code | `npm i vue-barangay-search` + `v-model` |
| **Product engineer (PH logistics, govtech, proptech)** | Structured address for downstream validation / shipping | `@select` payload into form state / API body |
| **GIS.ph customer** | Use their API key in customer-facing apps | Pass `apiKey` or `accessToken` prop |
| **Package maintainer (Yahaay)** | Ship npm releases, keep SDK alignment | Playground + Vite lib build |

### 2.1 Core user journeys

1. **Install & first render** → install package → import CSS → pass API credentials → type 2+ characters → see dropdown of matches with municipality/province context.  
2. **Select barangay** → click result → input shows barangay name → parent receives object via `v-model` / `@select`.  
3. **Handle failure** → invalid key / network error → error UI + `@error` event for toast/logging.  
4. **Scoped search (intended)** → parent sets province/municipality → results limited to that admin unit. **Declared in props/playground; not wired into API call today** (gap).  
5. **Plugin registration (optional)** → `app.use(VueBarangaySearch)` → use `<BarangaySearch>` without local import.

---

## 3. System architecture (as implemented)

### 3.1 Runtime & stack

| Layer | Choice |
| --- | --- |
| Component framework | Vue 3.5+ (peer dependency) |
| Language | TypeScript |
| Build | Vite 6 library mode (`ESM` + `UMD`) |
| Types | `vite-plugin-dts` → `dist/index.d.ts` |
| Utilities | `@vueuse/core` (`useDebounceFn`) |
| API client | `gis.ph-sdk` `^1.0.2` |
| Styling | Scoped CSS in component (Tailwind present for playground only) |
| Package manager (dev) | Bun (`bun.lock`); consumers may use npm/pnpm/yarn |
| Dev entry | `playground/index.html` + `App.vue` |

### 3.2 Source layout

| Path | Role |
| --- | --- |
| `src/components/BarangaySearch.vue` | Single product component (logic + template + scoped CSS) |
| `src/index.ts` | Public API: named `BarangaySearch` + default plugin |
| `src/style.css` | Extra stylesheet entry (if used); primary styles are scoped in SFC |
| `playground/*` | Sample Vue “checkout” page: form integration, selection preview, code snippet, optional API key |
| `vite.config.ts` | Lib build + playground server |
| `dist/*` | Published artifacts (not committed in all workflows) |

### 3.3 Public package surface (`package.json`)

| Field | Value |
| --- | --- |
| `name` | `vue-barangay-search` |
| `main` | `./dist/vue-barangay-search.umd.cjs` |
| `module` | `./dist/vue-barangay-search.js` |
| `types` | `./dist/index.d.ts` |
| CSS exports | `./dist/style.css`, `./dist/vue-barangay-search.css` |
| Peer | `vue` `^3.5.0` |
| Deps | `@vueuse/core`, `gis.ph-sdk` |

### 3.4 Data flow

```
User types in <input>
  → watch(searchQuery) → useDebounceFn(300ms)
  → if query.length < 2: clear results; return
  → new GisPh({ accessToken, apiKey })
  → client.barangays.search({ q: query })
  → results[] → dropdown
  → click item → emit update:modelValue + select; set input to item.name
```

Upstream API (via SDK):

| SDK method | HTTP (conceptual) | Used by component? |
| --- | --- | --- |
| `barangays.search({ q, limit? })` | `GET /v1/barangays/search` | **Yes** |
| `barangays.list({ province, municipality?, … })` | `GET /v1/barangays` | No |
| `barangays.get(id)` | `GET /v1/barangays/{id}` | No |

### 3.5 Selected object shape

The component does not normalize the API payload. It re-emits whatever `gis.ph-sdk` returns as `Barangay` (SDK type is intentionally open: `id`, `name`, plus index signature).

UI currently displays:

| Field | UI usage |
| --- | --- |
| `item.id` or `item.code` | List key |
| `item.name` | Primary label + input value after select |
| `item.municipality` | Secondary context line |
| `item.province` | Secondary context line |

Integrators should treat additional fields (codes, region, geometry) as **API-version dependent** until a documented stable selection DTO is defined (see §7.3).

---

## 4. Functional requirements

### 4.1 Component API

#### Props

| Prop | Type | Default | Required | Status |
| --- | --- | --- | --- | --- |
| `accessToken` | `string` | — | One of token/key recommended | **Implemented** — passed to SDK |
| `apiKey` | `string` | — | One of token/key recommended | **Implemented** — passed to SDK |
| `placeholder` | `string` | `Search for a barangay...` | No | **Implemented** |
| `modelValue` | object | — | No | **Accepted**; selection is driven by emits (no full controlled re-sync of query from external model updates) |
| `province` | `string` | — | No | **Declared only** — not applied to search request |
| `municipality` | `string` | — | No | **Declared only** — not applied to search request |

#### Events

| Event | Payload | Status |
| --- | --- | --- |
| `update:modelValue` | Selected barangay object | **Implemented** |
| `select` | Selected barangay object | **Implemented** |
| `error` | Error message string (from catch) | **Implemented** (typed loosely; README says `Error`) |

#### Plugin

```ts
import VueBarangaySearch from 'vue-barangay-search'
app.use(VueBarangaySearch) // registers global <BarangaySearch>
```

### 4.2 Search behavior

| Behavior | Spec (product intent) | Implementation notes |
| --- | --- | --- |
| Minimum query length | 2 characters | Enforced client-side |
| Debounce | 300 ms | `useDebounceFn` |
| Loading indicator | Visible while request in flight | Text “Loading...” inside input wrapper |
| Empty results | Message when query ≥ 2 and no hits | “No results found.” |
| Error | Surface message + emit | `error` ref + `@error` |
| Dropdown open | On results / focus | Focus sets `showDropdown = true`; no click-outside close (comment notes VueUse `onClickOutside` as TODO) |
| Keyboard navigation | Arrow keys / Enter / Escape | **Not implemented** |
| Clear selection | Explicit clear control | **Not implemented** (Laravel sibling has `clearable`) |
| Result limit | Configurable max results | **Not implemented** (SDK supports `limit`) |
| Abort in-flight requests | Cancel stale responses on new keystrokes | **Not implemented** (risk of race: older response may overwrite newer) |

### 4.3 Filtering (product intent)

| Filter | Intent | Status |
| --- | --- | --- |
| Global text search | Search all barangays by name-ish query | **Works** via `barangays.search` |
| Province filter | Narrow results to a province | Prop exists; **not sent** to API |
| Municipality filter | Narrow within province/city | Prop exists; **not sent** to API |
| Code-based filters | PSGC municipality/city/province codes | Laravel sibling has codes; Vue package **does not** |

**Decision needed for next release:** either wire filters into `search` (if API supports them) or switch scoped mode to `barangays.list({ province, municipality, name })`, and document the contract.

### 4.4 Styling

| Requirement | Status |
| --- | --- |
| Usable defaults without consumer CSS | Scoped styles on container, input, dropdown, items |
| Importable CSS path for library builds that strip SFC CSS | Package exports CSS paths under `dist/` |
| Theme tokens / dark mode | **Not implemented** |
| Class override props (`inputClass`, `containerClass`) | **Not implemented** (Laravel has them) |
| Headless / slot-based UI | **Not implemented** |

### 4.5 Accessibility

| Requirement | Status |
| --- | --- |
| Combobox pattern (`role="combobox"`, listbox, aria-activedescendant) | **Not implemented** — plain `<input>` + `<ul>` |
| Keyboard support | **Not implemented** |
| Announce loading / no results | **Not implemented** |
| Label association | Consumer must wrap; no `label` prop |

Target for production forms: WAI-ARIA combobox pattern + keyboard parity with native select where practical.

### 4.6 Security & credentials

| Topic | Guidance |
| --- | --- |
| API key in browser | Expected for pure client widgets; keys should be **restricted** (domain / rate limits) in GIS.ph dashboard |
| Prefer BFF | Apps that already have a backend should proxy search and pass a short-lived token, or use `laravel-barangay-search` server-side |
| Secret handling | Component must never log full tokens; playground uses password-type input for demo token |

---

## 5. Non-functional requirements

| Area | Requirement | Today |
| --- | --- | --- |
| Bundle size | Prefer tree-shakeable ESM; avoid shipping playground Tailwind into lib CSS | Lib build externalizes `vue`; SDK is a runtime dependency |
| Performance | Debounce + min length to protect API quota | Debounce/min length yes; no request abort / cache |
| Browser support | Modern evergreen browsers | No explicit browserslist |
| TypeScript | Publish accurate component props/emits types | Partial — props use `modelValue?: any`; emits untyped string array |
| Docs | README install + props table | README exists; this PRD is deeper product source of truth |
| Tests | Unit + component tests for search/select/error | **None** in package |
| CI / release | Automated publish on tag | Not defined in-repo (cluster-level process) |
| License | MIT (README badge) | Confirm LICENSE file in publish repo |

---

## 6. Integration examples (target DX)

### 6.1 Minimal

```vue
<script setup>
import { ref } from 'vue'
import { BarangaySearch } from 'vue-barangay-search'
import 'vue-barangay-search/dist/vue-barangay-search.css'

const barangay = ref(null)
</script>

<template>
  <BarangaySearch
    v-model="barangay"
    :api-key="import.meta.env.VITE_GISPH_API_KEY"
    @select="onSelect"
  />
</template>
```

### 6.2 Cascading form (target after filters work)

```vue
<BarangaySearch
  v-model="form.barangay"
  :province="form.province"
  :municipality="form.municipality"
  :api-key="apiKey"
/>
```

### 6.3 Error handling

```vue
<BarangaySearch
  v-model="barangay"
  :api-key="apiKey"
  @error="(msg) => toast.error(String(msg))"
/>
```

---

## 7. Gaps, risks & parity with Laravel package

### 7.1 Feature parity matrix

| Capability | `vue-barangay-search` | `laravel-barangay-search` |
| --- | --- | --- |
| Debounced search | Yes (300 ms) | Yes (config) |
| Min query length | Hardcoded 2 | Config |
| v-model / wire:model | Yes | Yes |
| Select event | `@select` | `barangay-selected` |
| Error event | `@error` | `barangay-search-error` |
| Clear selection | No | Yes (`clearable`) |
| Province/municipality filter | Props only (unwired) | Code-based filters wired |
| Caching | No | Yes (config TTL) |
| UI variants | Single scoped style | Mary UI + vanilla |
| Label / hint / required | No | Yes |
| Service API for non-UI use | No (use SDK directly) | `BarangayService` |
| Automated tests | No | Pest unit tests |

### 7.2 Implementation gaps (P0/P1)

| ID | Gap | Severity | Notes |
| --- | --- | --- | --- |
| G1 | `province` / `municipality` props ignored | **High** | Playground advertises filters; README documents `municipality`; misleading API |
| G2 | No click-outside to close dropdown | Medium | Comment in SFC already calls this out |
| G3 | No keyboard navigation / a11y combobox | High for forms | Blocker for many enterprise UIs |
| G4 | Race conditions on fast typing | Medium | Last response should win; prefer AbortController |
| G5 | Creates new `GisPh` client every keystroke | Low–Med | Prefer single client, recreate only when credentials change |
| G6 | `modelValue` not synced into input when set externally | Medium | Breaking for edit forms prefilled with a barangay |
| G7 | README vs code: `error` payload type; `www` vs bare URLs | Low | Docs accuracy |
| G8 | No tests | Medium | Regressions likely when wiring filters |
| G9 | CSS import path inconsistency | Low | README says `vue-barangay-search/dist/vue-barangay-search.css`; exports also list `./dist/style.css` |

### 7.3 Risks

1. **Credential leakage** — default integration pattern puts API keys in the browser.  
2. **API contract drift** — open `Barangay` type + no normalized selection DTO.  
3. **SDK version pin** — `gis.ph-sdk` ^1.0.2; search params may grow (filters, limit) without component updates.  
4. **False feature claims** — documented filters that do not work harm trust.

---

## 8. Roadmap

### 8.1 P0 — Correctness & honesty

- [ ] **Wire filters** — apply `province` / `municipality` (or code-based props) to the correct SDK method; update README once behavior matches.  
- [ ] **Stable selection typing** — export a `BarangaySelection` (or re-export SDK type) and type props/emits.  
- [ ] **External model sync** — when `modelValue` is set/cleared from parent, reflect name (or clear) in the input.  
- [ ] **Request lifecycle** — AbortController or generation counter so stale results cannot win.  
- [ ] **Reuse GisPh client** — memoize by credentials.

### 8.2 P1 — UX & accessibility

- [ ] Click-outside + Escape to close dropdown (`onClickOutside`).  
- [ ] Keyboard: ArrowUp/Down, Enter, Escape; highlight active option.  
- [ ] ARIA combobox attributes.  
- [ ] Clear button (`clearable` prop, default true).  
- [ ] Configurable `minQueryLength`, `debounceMs`, `limit`.  
- [ ] Loading spinner affordance (not only text).  
- [ ] Empty / error copy props for i18n.

### 8.3 P2 — Customization & DX

- [ ] `inputClass` / `containerClass` / `dropdownClass` overrides.  
- [ ] Slots: `#item`, `#empty`, `#error`, `#prefix`, `#suffix`.  
- [ ] Optional headless mode (logic composable `useBarangaySearch`).  
- [ ] Dark mode–friendly CSS variables.  
- [ ] Playground polish: load token from env, show live request params, document filter behavior.  
- [ ] Component tests (Vitest + Vue Test Utils) for debounce, select, error, filters.  
- [ ] Storybook or docs site snippet on `docs.gis.ph`.

### 8.4 P3 — Ecosystem

- [ ] Nuxt module convenience (`nuxt-barangay-search` or `@gis.ph/nuxt` plugin).  
- [ ] Cascading suite: `ProvinceSelect` / `MunicipalitySelect` / `BarangaySearch` as a set.  
- [ ] Align selection DTO and event names with Laravel package for cross-stack mental model.  
- [ ] Optional client-side result cache (session) with TTL to reduce quota burn.

---

## 9. Success metrics

| Metric | Target (directional) |
| --- | --- |
| Time to first successful select in a new Vue app | &lt; 15 minutes with docs + API key |
| npm weekly downloads / GitHub stars | Track over time; grow with GIS.ph GTM |
| Support tickets: “filters don’t work” | → 0 after P0 filter wiring |
| a11y audit (keyboard-only select) | Pass basic combobox flow after P1 |
| Bundle size (ESM, gzip) | Monitor; avoid large UI kits as hard deps |

---

## 10. Acceptance criteria (definition of done for v1.0)

A release may be called **1.0.0** when:

1. Documented props match runtime behavior (including filters).  
2. `v-model` works for both select and external prefill/clear.  
3. Keyboard + basic ARIA combobox supported.  
4. Stale search responses cannot overwrite newer queries.  
5. TypeScript consumers get typed props, emits, and selection object.  
6. At least smoke/component tests cover search success, empty, error, and select.  
7. README + this PRD agree on auth, CSS import, and API dependency.  
8. CSS export path is single, documented, and works in Vite/Webpack/Nuxt.

---

## 11. Out-of-scope follow-ups (explicit)

- Replacing `gis.ph-sdk` with raw `fetch`  
- Embedding map geometry of barangay boundaries inside this package  
- Shipping barangay data offline inside the npm tarball  
- Multi-language barangay name localization beyond API fields  

---

## 12. Open questions

1. Should scoped search use **name filters** (`province` / `municipality` strings) or **PSGC codes** (Laravel-style) — or both?  
2. Should browser integrations require a **restricted public key** product tier, with docs discouraging secret server keys in SPAs?  
3. Prefer **monolithic component** vs **composable + headless UI** for 1.0?  
4. Normalize selection to a fixed DTO (codes + names + `full_address`) even if API returns extra fields?  
5. Keep UMD build long-term, or ESM-only for modern tooling?

---

## 13. Changelog alignment

| Version | Date | Relevance to PRD |
| --- | --- | --- |
| `0.2.0` | 2026-02-15 | Adopted `gis.ph-sdk`; added `apiKey`; removed raw `fetch` |
| Pre-0.2 | — | Manual fetch-based implementation |

Current codebase state is **0.2.x MVP**: usable global search autocomplete with auth props and basic dropdown UI; filters, a11y, and form-hardening remain roadmap items.

---

## 14. Document history

| Date | Change |
| --- | --- |
| 2026-07-10 | Initial living PRD from codebase inspection (`BarangaySearch.vue`, package exports, playground, SDK, Laravel parity). |
