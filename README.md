# Vue Barangay Search

<p align="center">
  <a href="https://www.npmjs.com/package/vue-barangay-search"><img src="https://img.shields.io/npm/v/vue-barangay-search.svg?style=flat-square" alt="npm version"/></a>
  <img src="https://img.shields.io/bundlephobia/min/vue-barangay-search?style=flat-square" alt="npm bundle size"/>
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
This component is hardcoded to use the **GIS.PH API** (`https://api.gis.ph/v1`). It cannot be configured to use another backend.

## Installation

```bash
pnpm add vue-barangay-search
```

## API Key

This component requires an API key for `api.gis.ph`. 
To request an API key, please visit [gis.ph](https://gis.ph).

## Installation

## Usage

```vue
<script setup>
import { ref } from 'vue'
import { BarangaySearch } from 'vue-barangay-search'
import 'vue-barangay-search/dist/vue-barangay-search.css'

const selectedBarangay = ref(null)
const accessToken = 'YOUR_GIS_PH_API_KEY'
</script>

<template>
  <BarangaySearch
    :accessToken="accessToken"
    v-model="selectedBarangay"
    placeholder="Search barangay..."
    @select="console.log"
  />
</template>
```

## Props

| Prop | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `accessToken` | `String` | `undefined` | **Required**. Your API Key or Token (without "Bearer " prefix). To request an API key, visit [gis.ph](https://gis.ph). |
| `municipality` | `String` | `undefined` | Optional municipality name to filter by. |
| `placeholder` | `String` | `Search for a barangay...` | Input placeholder text. |
| `modelValue` | `Object` | `undefined` | v-model binding for the selected barangay. |

## Events

-   `update:modelValue`: Emitted when a barangay is selected.
-   `select`: Emitted when a barangay is selected (payload: barangay object).
-   `error`: Emitted when an API error occurs.

## Development

1.  **Install dependencies**:
    ```bash
    npm install
    ```

2.  **Run Playground**:
    ```bash
    npm run dev
    ```

3.  **Build Library**:
    ```bash
    npm run build
    ```
