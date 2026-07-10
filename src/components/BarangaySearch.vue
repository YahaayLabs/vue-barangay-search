<script setup lang="ts">
import { computed, nextTick, onMounted, ref, watch } from 'vue'
import { onClickOutside, useDebounceFn } from '@vueuse/core'
import { GisPh } from 'gis.ph-sdk'
import type { Barangay } from 'gis.ph-sdk'

interface Props {
  province?: string
  municipality?: string
  placeholder?: string
  modelValue?: Barangay | null
  accessToken?: string
  apiKey?: string
}

const props = withDefaults(defineProps<Props>(), {
  placeholder: 'Search barangay, city, or province…',
})

const emit = defineEmits<{
  'update:modelValue': [value: Barangay | null]
  select: [value: Barangay]
  error: [message: string]
}>()

const rootEl = ref<HTMLElement | null>(null)
const inputEl = ref<HTMLInputElement | null>(null)

const searchQuery = ref('')
const results = ref<Barangay[]>([])
const isLoading = ref(false)
const showDropdown = ref(false)
const error = ref<string | null>(null)
/** When true, ignore the next searchQuery watch (programmatic label after select). */
const suppressSearch = ref(false)
/** True after a pick until the user edits the input. */
const isCommitted = ref(false)
/** Ignore stale responses from earlier keystrokes. */
let searchSeq = 0

function labelFor(item: Barangay | null | undefined): string {
  if (!item) return ''
  return String(item.name ?? '')
}

function applyExternalValue(value: Barangay | null | undefined) {
  if (!value) {
    if (isCommitted.value) {
      suppressSearch.value = true
      searchQuery.value = ''
      isCommitted.value = false
    }
    results.value = []
    showDropdown.value = false
    return
  }
  suppressSearch.value = true
  searchQuery.value = labelFor(value)
  isCommitted.value = true
  results.value = []
  showDropdown.value = false
  error.value = null
}

onMounted(() => {
  if (props.modelValue) applyExternalValue(props.modelValue)
})

watch(
  () => props.modelValue,
  (value) => {
    // Keep input in sync when parent sets/clears v-model
    if (!value) {
      if (isCommitted.value || searchQuery.value) applyExternalValue(null)
      return
    }
    if (labelFor(value) !== searchQuery.value || !isCommitted.value) {
      applyExternalValue(value)
    }
  },
)

const canShowResults = computed(
  () => showDropdown.value && !isCommitted.value && results.value.length > 0,
)
const canShowEmpty = computed(
  () =>
    showDropdown.value
    && !isCommitted.value
    && !isLoading.value
    && searchQuery.value.trim().length >= 2
    && results.value.length === 0
    && !error.value,
)

function closeDropdown() {
  showDropdown.value = false
}

function openDropdownIfNeeded() {
  if (isCommitted.value) return
  if (results.value.length > 0 || (searchQuery.value.trim().length >= 2 && !isLoading.value)) {
    showDropdown.value = true
  }
}

const runSearch = useDebounceFn(async (query: string) => {
  const trimmed = query.trim()
  if (!trimmed || trimmed.length < 2 || isCommitted.value) {
    results.value = []
    isLoading.value = false
    return
  }

  const seq = ++searchSeq
  isLoading.value = true
  error.value = null

  try {
    // Bearer only — X-API-Key is blocked by api.gis.ph browser CORS.
    const token = props.accessToken || props.apiKey
    const client = new GisPh(token ? { accessToken: token } : {})
    const { data } = await client.barangays.search({ q: trimmed })

    if (seq !== searchSeq || isCommitted.value) return

    results.value = data || []
    showDropdown.value = true
  } catch (err: any) {
    if (seq !== searchSeq) return
    console.error('Barangay search error:', err)
    const message =
      err?.message === 'Failed to fetch'
        ? 'Network/CORS error talking to api.gis.ph. Check the browser console and that your API key is valid.'
        : (err.message || 'Failed to fetch barangays')
    error.value = message
    emit('error', message)
    results.value = []
  } finally {
    if (seq === searchSeq) isLoading.value = false
  }
}, 300)

watch(searchQuery, (newQuery) => {
  if (suppressSearch.value) {
    suppressSearch.value = false
    return
  }

  // User is editing after a selection — clear v-model and search again
  if (isCommitted.value) {
    isCommitted.value = false
    emit('update:modelValue', null)
  }

  error.value = null
  const trimmed = newQuery.trim()
  if (trimmed.length < 2) {
    searchSeq++ // invalidate in-flight
    results.value = []
    showDropdown.value = false
    isLoading.value = false
    return
  }

  runSearch(newQuery)
})

function selectItem(item: Barangay) {
  searchSeq++ // cancel any in-flight search
  isLoading.value = false
  isCommitted.value = true
  suppressSearch.value = true
  searchQuery.value = labelFor(item)
  results.value = []
  showDropdown.value = false
  error.value = null
  emit('update:modelValue', item)
  emit('select', item)
  // Blur so focus doesn't immediately re-open an empty menu
  nextTick(() => inputEl.value?.blur())
}

function onFocus() {
  openDropdownIfNeeded()
}

function onKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape') {
    event.preventDefault()
    closeDropdown()
    inputEl.value?.blur()
  }
}

onClickOutside(rootEl, () => {
  closeDropdown()
})
</script>

<template>
  <div ref="rootEl" class="barangay-search-container">
    <div class="input-wrapper">
      <input
        ref="inputEl"
        v-model="searchQuery"
        type="text"
        :placeholder="placeholder"
        class="search-input"
        :class="{ 'is-selected': isCommitted }"
        autocomplete="off"
        role="combobox"
        aria-autocomplete="list"
        :aria-expanded="canShowResults || canShowEmpty"
        @focus="onFocus"
        @keydown="onKeydown"
      >
      <div v-if="isLoading" class="loader" aria-hidden="true">
        Searching…
      </div>
      <div
        v-else-if="isCommitted"
        class="selected-check"
        title="Selected"
        aria-hidden="true"
      >
        ✓
      </div>
    </div>

    <ul
      v-if="canShowResults"
      class="results-dropdown"
      role="listbox"
    >
      <li
        v-for="item in results"
        :key="item.id || item.code || item.name"
        class="result-item"
        role="option"
        @mousedown.prevent="selectItem(item)"
      >
        <span class="barangay-name">{{ item.name }}</span>
        <small class="location-context">
          {{ item.municipality || item.city }}{{ (item.municipality || item.city) && item.province ? ', ' : '' }}{{ item.province }}
        </small>
      </li>
    </ul>

    <div
      v-if="canShowEmpty"
      class="no-results"
    >
      No results found.
    </div>

    <div
      v-if="error"
      class="error-message"
      role="alert"
    >
      {{ error }}
    </div>
  </div>
</template>

<style scoped>
.barangay-search-container {
  position: relative;
  width: 100%;
  font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
  box-sizing: border-box;
}

.barangay-search-container * {
  box-sizing: border-box;
}

.input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.search-input {
  width: 100%;
  padding: 10px 36px 10px 14px;
  border: 1px solid var(--barangay-search-border, #e2e8f0);
  border-radius: var(--barangay-search-radius, 8px);
  font-size: 0.9rem;
  line-height: 1.5;
  color: var(--barangay-search-text, #0f172a);
  background-color: var(--barangay-search-bg, #fff);
  transition: all 0.2s ease-in-out;
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
}

.search-input:focus {
  outline: none;
  border-color: var(--barangay-search-focus, #10b981);
  box-shadow: 0 0 0 3px var(--barangay-search-focus-ring, rgba(16, 185, 129, 0.15));
}

.search-input.is-selected {
  border-color: var(--barangay-search-selected-border, #a7f3d0);
  background-color: var(--barangay-search-selected-bg, #ecfdf5);
}

.search-input.is-selected:focus {
  border-color: var(--barangay-search-check, #059669);
  box-shadow: 0 0 0 3px var(--barangay-search-focus-ring, rgba(16, 185, 129, 0.15));
}

.search-input::placeholder {
  color: #94a3b8;
}

.loader,
.selected-check {
  position: absolute;
  right: 12px;
  font-size: 0.875rem;
  pointer-events: none;
}

.loader {
  color: var(--barangay-search-muted, #64748b);
}

.selected-check {
  color: var(--barangay-search-check, #059669);
  font-weight: 700;
}

.results-dropdown {
  position: absolute;
  top: calc(100% + 4px);
  left: 0;
  right: 0;
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  list-style: none;
  padding: 4px;
  margin: 0;
  max-height: 250px;
  overflow-y: auto;
  z-index: 1000;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
}

.result-item {
  padding: 10px 12px;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  border-radius: 6px;
  transition: background-color 0.15s ease;
  color: #1e293b;
}

.result-item:hover {
  background-color: #f1f5f9;
}

.barangay-name {
  font-weight: 600;
  font-size: 0.95rem;
}

.location-context {
  font-size: 0.8rem;
  color: #64748b;
  margin-top: 2px;
}

.no-results {
  position: absolute;
  top: calc(100% + 4px);
  left: 0;
  right: 0;
  padding: 12px;
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  z-index: 1000;
  color: #64748b;
  font-size: 0.9rem;
  text-align: center;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

.error-message {
  color: var(--barangay-search-error, #dc2626);
  font-size: 0.875rem;
  margin-top: 6px;
}

.results-dropdown::-webkit-scrollbar {
  width: 6px;
}
.results-dropdown::-webkit-scrollbar-track {
  background: transparent;
}
.results-dropdown::-webkit-scrollbar-thumb {
  background-color: #cbd5e1;
  border-radius: 20px;
}
.results-dropdown::-webkit-scrollbar-thumb:hover {
  background-color: #94a3b8;
}
</style>
