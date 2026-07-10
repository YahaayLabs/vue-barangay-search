<script setup lang="ts">
import { computed, ref } from 'vue'
import { BarangaySearch } from '../src'
import './tokens.css'

/** GIF / README demo — set VITE_GISPH_API_KEY in .env.local */
const apiKey = ref(import.meta.env.VITE_GISPH_API_KEY as string | undefined)

const form = ref({
  fullName: 'Maria Santos',
  phone: '+63 917 555 0142',
  street: '123 Mabini Street',
  barangay: null as Record<string, unknown> | null,
})

const selectionLabel = computed(() => {
  const b = form.value.barangay
  if (!b) return null
  return [b.name, b.municipality ?? b.city, b.province].filter(Boolean).join(', ')
})
</script>

<template>
  <div class="gis-demo">
    <div class="gis-demo-page">
      <header class="gis-demo-header">
        <h1 class="gis-demo-title">
          vue-barangay-search
        </h1>
        <p class="gis-demo-tagline">
          Philippine barangay autocomplete — Vue 3 demo
        </p>
        <a
          class="gis-demo-repo"
          href="https://github.com/YahaayLabs/vue-barangay-search"
          target="_blank"
          rel="noopener noreferrer"
        >https://github.com/YahaayLabs/vue-barangay-search</a>
      </header>

      <div class="gis-demo-card">
        <header>
          <p class="gis-demo-eyebrow">
            Checkout
          </p>
          <h2 class="gis-demo-card-title">
            Delivery address
          </h2>
          <p class="gis-demo-sub">
            Powered by <code>&lt;BarangaySearch /&gt;</code>
          </p>
        </header>

        <form
          class="gis-demo-fields"
          @submit.prevent
        >
          <div class="gis-demo-row-2">
            <label class="gis-demo-field">
              <span>Full name</span>
              <input
                v-model="form.fullName"
                type="text"
                autocomplete="name"
              >
            </label>
            <label class="gis-demo-field">
              <span>Mobile</span>
              <input
                v-model="form.phone"
                type="tel"
                autocomplete="tel"
              >
            </label>
          </div>

          <label class="gis-demo-field">
            <span>Street</span>
            <input
              v-model="form.street"
              type="text"
              placeholder="House no., street, subdivision"
              autocomplete="street-address"
            >
          </label>

          <label class="gis-demo-field gis-demo-field-highlight">
            <span>Barangay — package component</span>
            <BarangaySearch
              v-model="form.barangay"
              :api-key="apiKey"
              placeholder="e.g. Poblacion Batangas"
            />
          </label>

          <div
            v-if="selectionLabel"
            class="gis-demo-selection"
          >
            <span class="gis-demo-selection-dot" />
            <span>{{ selectionLabel }}</span>
          </div>

          <button
            type="submit"
            class="gis-demo-btn"
          >
            Continue
          </button>
        </form>
      </div>

      <p class="gis-demo-footer">
        <a
          href="https://github.com/YahaayLabs/vue-barangay-search"
          target="_blank"
          rel="noopener noreferrer"
        >GitHub</a>
        ·
        <a
          href="https://gis.ph"
          target="_blank"
          rel="noopener noreferrer"
        >gis.ph</a>
        ·
        <a
          href="https://www.npmjs.com/package/vue-barangay-search"
          target="_blank"
          rel="noopener noreferrer"
        >npm</a>
      </p>
    </div>
  </div>
</template>
