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

/** Prefer camelCase API fields; fall back to snake_case. */
function field(b: Record<string, unknown>, camel: string, snake?: string): string | null {
  const v = b[camel] ?? (snake ? b[snake] : undefined)
  if (v == null || v === '') return null
  return String(v)
}

const selection = computed(() => {
  const b = form.value.barangay
  if (!b) return null

  const name = field(b, 'name')
  const municipality = field(b, 'municipality') ?? field(b, 'city')
  const province = field(b, 'province')
  const region = field(b, 'region')

  // fullName from API may already include region; otherwise compose hierarchy
  const label =
    field(b, 'fullName', 'full_name')
    ?? [name, municipality, province, region].filter(Boolean).join(', ')

  // Expose names + PSGC codes so consumers can pick what they need
  const levels = [
    {
      key: 'region',
      label: 'Region',
      name: region,
      code: field(b, 'rCode', 'r_code'),
    },
    {
      key: 'province',
      label: 'Province',
      name: province,
      code: field(b, 'pCode', 'p_code'),
    },
    {
      key: 'municity',
      label: 'City / Mun.',
      name: municipality,
      code: field(b, 'lCode', 'l_code'),
    },
    {
      key: 'barangay',
      label: 'Barangay',
      name,
      code: field(b, 'code') ?? field(b, 'bCode', 'b_code'),
    },
  ].filter((row) => row.name || row.code)

  return { label, levels, raw: b }
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
            v-if="selection"
            class="gis-demo-selection"
          >
            <span class="gis-demo-selection-dot" />
            <div class="gis-demo-selection-body">
              <span class="gis-demo-selection-label">{{ selection.label }}</span>
              <dl
                v-if="selection.levels.length"
                class="gis-demo-selection-codes"
              >
                <div
                  v-for="row in selection.levels"
                  :key="row.key"
                  class="gis-demo-selection-code-row"
                >
                  <dt>{{ row.label }}</dt>
                  <dd>
                    <span
                      v-if="row.name"
                      class="gis-demo-selection-name"
                    >{{ row.name }}</span>
                    <code v-if="row.code">{{ row.code }}</code>
                  </dd>
                </div>
              </dl>
            </div>
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
