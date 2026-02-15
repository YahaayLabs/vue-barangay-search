# Vue Barangay Search

<p align="center">
  <a href="https://www.npmjs.com/package/vue-barangay-search"><img src="https://img.shields.io/npm/v/vue-barangay-search.svg?style=flat-square" alt="npm version"/></a>
  <img src="https://img.shields.io/npm/dw/vue-barangay-search?style=flat-square" alt="npm downloads"/>
  <a href="https://opensource.org/licenses/MIT"><img src="https://img.shields.io/badge/License-MIT-yellow.svg" alt="License: MIT"/></a>
</p>

A Vue 3 component for searching Philippine Barangays using the [api.gis.ph](https://api.gis.ph) service.

## Features

-   Autocomplete search for barangays.
-   Debounced API calls.
-   Scoped styling (easy to override or use as is).
-   TypeScript support.

## API Source

This component uses the official [**gis.ph-sdk**](https://www.npmjs.com/package/gis.ph-sdk) to interact with the [**GIS.PH API**](https://api.gis.ph/v1). It is optimized for Philippine geographical data and ensures type safety and performance.

## Installation

Install via your preferred package manager:

```bash
# Using bun (recommended)
bun add vue-barangay-search

# Using npm
npm install vue-barangay-search

# Using pnpm
pnpm add vue-barangay-search
```

## Usage

```vue
<script setup>
import { ref } from 'vue'
import { BarangaySearch } from 'vue-barangay-search'
import 'vue-barangay-search/dist/vue-barangay-search.css'

const selectedBarangay = ref(null)
const accessToken = 'YOUR_GIS_PH_API_KEY' // Get one at https://gis.ph
</script>

<template>
  <BarangaySearch
    v-model="selectedBarangay"
    :accessToken="accessToken"
    placeholder="Search for a barangay..."
    @select="(b) => console.log('Selected:', b)"
  />
</template>
```

## Props

| Prop | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `accessToken` | `String` | `undefined` | **Required**. Your API Key or Token from [gis.ph](https://gis.ph). |
| `municipality` | `String` | `undefined` | Optional: filter results to a specific municipality. |
| `placeholder` | `String` | `Search for a barangay...` | Input placeholder text. |
| `modelValue` | `Object` | `undefined` | v-model binding for the selected barangay. |

## Events

| Event | Payload | Description |
| :--- | :--- | :--- |
| `update:modelValue` | `Object` | Emitted when a selection is made. |
| `select` | `Object` | Emitted with the full barangay object on selection. |
| `error` | `Error` | Emitted when an API or network error occurs. |

## Development

This project uses **[Bun](https://bun.sh)** for development.

1.  **Install dependencies**:
    ```bash
    bun install
    ```

2.  **Run Playground**:
    ```bash
    bun dev
    ```

3.  **Build Library**:
    ```bash
    bun run build
    ```

Users can still install this package using `npm`, `pnpm`, or `yarn`. The development choice of Bun does not affect the end-user's installation method.
