<script setup lang="ts">
import { computed, ref } from 'vue'
import { BarangaySearch } from '../src'

/** GIF / README demo — set VITE_GISPH_API_KEY in .env.local for search to work. */
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
  <div class="demo">
    <div class="card">
      <header class="card-header">
        <p class="eyebrow">Checkout</p>
        <h1>Delivery address</h1>
      </header>

      <form class="fields" @submit.prevent>
        <div class="row two">
          <label class="field">
            <span>Full name</span>
            <input v-model="form.fullName" type="text" autocomplete="name">
          </label>
          <label class="field">
            <span>Mobile</span>
            <input v-model="form.phone" type="tel" autocomplete="tel">
          </label>
        </div>

        <label class="field">
          <span>Street</span>
          <input
            v-model="form.street"
            type="text"
            placeholder="House no., street, subdivision"
            autocomplete="street-address"
          >
        </label>

        <label class="field field-barangay">
          <span>Barangay</span>
          <BarangaySearch
            v-model="form.barangay"
            :api-key="apiKey"
            placeholder="e.g. Poblacion Batangas"
          />
        </label>

        <div
          v-if="selectionLabel"
          class="selection"
        >
          <span class="selection-dot" />
          <span>{{ selectionLabel }}</span>
        </div>

        <button type="submit" class="btn">
          Continue
        </button>
      </form>
    </div>
  </div>
</template>

<style scoped>
.demo {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem 1rem;
  background: #f1f5f9;
  font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  color: #0f172a;
  -webkit-font-smoothing: antialiased;
}

.card {
  width: 100%;
  max-width: 28rem;
  background: #fff;
  border-radius: 1rem;
  border: 1px solid #e2e8f0;
  box-shadow:
    0 1px 2px rgba(15, 23, 42, 0.04),
    0 12px 32px rgba(15, 23, 42, 0.06);
  padding: 1.75rem 1.5rem 1.5rem;
}

.card-header {
  margin-bottom: 1.5rem;
}

.eyebrow {
  margin: 0 0 0.25rem;
  font-size: 0.7rem;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #059669;
}

.card-header h1 {
  margin: 0;
  font-size: 1.35rem;
  font-weight: 700;
  letter-spacing: -0.02em;
  color: #0f172a;
}

.fields {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.row.two {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.75rem;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.field > span {
  font-size: 0.8rem;
  font-weight: 500;
  color: #475569;
}

.field input {
  width: 100%;
  box-sizing: border-box;
  border: 1px solid #e2e8f0;
  border-radius: 0.5rem;
  padding: 0.6rem 0.75rem;
  font-size: 0.9rem;
  line-height: 1.4;
  color: #0f172a;
  background: #fff;
  transition: border-color 0.15s ease, box-shadow 0.15s ease;
}

.field input::placeholder {
  color: #94a3b8;
}

.field input:focus {
  outline: none;
  border-color: #34d399;
  box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.15);
}

.field-barangay {
  /* Keep dropdown space in frame when recording GIFs */
  min-height: 4.5rem;
}

.selection {
  display: flex;
  align-items: flex-start;
  gap: 0.5rem;
  padding: 0.65rem 0.75rem;
  border-radius: 0.5rem;
  background: #ecfdf5;
  border: 1px solid #a7f3d0;
  font-size: 0.8rem;
  font-weight: 500;
  color: #065f46;
  line-height: 1.35;
}

.selection-dot {
  flex-shrink: 0;
  width: 0.45rem;
  height: 0.45rem;
  margin-top: 0.3rem;
  border-radius: 999px;
  background: #10b981;
}

.btn {
  margin-top: 0.25rem;
  width: 100%;
  border: none;
  border-radius: 0.5rem;
  padding: 0.7rem 1rem;
  font-size: 0.9rem;
  font-weight: 600;
  color: #fff;
  background: #059669;
  cursor: pointer;
  transition: background 0.15s ease;
}

.btn:hover {
  background: #047857;
}

@media (max-width: 420px) {
  .row.two {
    grid-template-columns: 1fr;
  }
}
</style>
