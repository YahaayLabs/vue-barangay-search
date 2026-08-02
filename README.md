# Vue Barangay Search

<p align="center">
  <a href="https://www.npmjs.com/package/vue-barangay-search"><img src="https://img.shields.io/npm/v/vue-barangay-search.svg?style=flat-square" alt="npm version"/></a>
  <img src="https://img.shields.io/npm/dw/vue-barangay-search?style=flat-square" alt="npm downloads"/>
  <a href="https://opensource.org/licenses/MIT"><img src="https://img.shields.io/badge/License-MIT-yellow.svg" alt="License: MIT"/></a>
  <a href="https://gis.ph"><img src="https://img.shields.io/badge/API-gis.ph-10b981?style=flat-square" alt="GIS.PH"/></a>
</p>

**Drop-in Vue 3 barangay search for Philippine address forms.**

Type free text like `Poblacion Batangas`, pick a result, and bind a structured place object with `v-model` — powered by the [GIS.PH API](https://api.gis.ph).

<p align="center">
  <img width="554" alt="vue-barangay-search demo" src="https://github.com/user-attachments/assets/4d68e7fb-1603-4c08-a2b8-d93c95bc1fd7" />
</p>

Built for **checkout, KYC, registration, and delivery** UIs where users need to select a real barangay — not free-type a misspelled place name.

Part of the [GIS.PH](https://gis.ph) developer platform · also available for [Laravel / Livewire](https://github.com/YahaayLabs/laravel-barangay-search).

---

## Features

- **Autocomplete** — debounced search against live Philippine barangay data
- **Natural queries** — multi-word free text (e.g. `san jose laguna`)
- **v-model ready** — selected barangay object for forms and APIs
- **Scoped styles** — sensible defaults; override with your CSS
- **TypeScript** — types from the official `gis.ph-sdk`
- **Lightweight** — Vue 3 peer dependency; no heavy UI framework required

## Get an API key

1. Sign up / request access at [gis.ph](https://gis.ph)
2. Create an API key in the [dashboard](https://dashboard.gis.ph) (`gis_sk_…`)
3. Prefer **restricted keys** for browser use (domain / rate limits)

## Installation

```bash
# bun (recommended for local dev)
bun add vue-barangay-search

# npm
npm install vue-barangay-search

# pnpm
pnpm add vue-barangay-search
```

## Quick start

```vue
<script setup>
import { ref } from 'vue'
import { BarangaySearch } from 'vue-barangay-search'
import 'vue-barangay-search/dist/vue-barangay-search.css'

const barangay = ref(null)
const apiKey = import.meta.env.VITE_GISPH_API_KEY
</script>

<template>
  <BarangaySearch
    v-model="barangay"
    :api-key="apiKey"
    placeholder="e.g. Poblacion Batangas"
    @select="(b) => console.log('Selected:', b)"
    @error="(msg) => console.error(msg)"
  />
</template>
```

## Props

| Prop | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `apiKey` | `string` | — | GIS.PH API key (`gis_sk_…`). Sent as `Authorization: Bearer`. |
| `accessToken` | `string` | — | Alternative auth (Bearer token). Used if `apiKey` is not set. |
| `placeholder` | `string` | `Search barangay, city, or province…` | Input placeholder. |
| `modelValue` | `object \| null` | — | `v-model` binding for the selected barangay. |
| `province` | `string` | — | Optional scope (see roadmap / API filters). |
| `municipality` | `string` | — | Optional scope (see roadmap / API filters). |

> One of `apiKey` or `accessToken` is required for authenticated API access.

## Events

| Event | Payload | Description |
| :--- | :--- | :--- |
| `update:modelValue` | `object \| null` | Selected barangay, or `null` when cleared by editing. |
| `select` | `object` | Full barangay object on pick. |
| `error` | `string` | API or network error message. |

## Selection shape

Fields depend on the API response (typically):

```json
{
  "name": "Poblacion",
  "municipality": "…",
  "province": "…",
  "fullName": "…",
  "lCode": "…",
  "pCode": "…"
}
```

Use the object as-is in form state, or map to your own DTO.

## Local demo

Checkout-style playground for demos and marketing GIFs:

```bash
bun install
cp .env.example .env.local   # VITE_GISPH_API_KEY=gis_sk_…
bun dev
# → /playground/index.html
```

## Links

| | |
| --- | --- |
| **Website** | [gis.ph](https://gis.ph) |
| **API** | [api.gis.ph](https://api.gis.ph) · [docs](https://docs.gis.ph) |
| **Dashboard** | [dashboard.gis.ph](https://dashboard.gis.ph) |
| **JS SDK** | [gis.ph-sdk](https://www.npmjs.com/package/gis.ph-sdk) |
| **Laravel sibling** | [laravel-barangay-search](https://github.com/YahaayLabs/laravel-barangay-search) |
## Development

```bash
bun install
bun dev          # playground
bun run build    # library → dist/
```

Install with npm, pnpm, or yarn in consuming apps — Bun is only the package’s preferred local toolchain.

## License

[MIT](./LICENSE) © [Yahaay Labs](https://github.com/YahaayLabs)
