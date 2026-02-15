<script setup lang="ts">
import { ref, watch } from 'vue'
import { useDebounceFn } from '@vueuse/core'
import { GisPh } from 'gis.ph-sdk'
import type { Barangay } from 'gis.ph-sdk'

interface Props {
  province?: string
  municipality?: string
  placeholder?: string
  modelValue?: any
  accessToken?: string
  apiKey?: string
}

const props = withDefaults(defineProps<Props>(), {
  placeholder: 'Search for a barangay...',
})

const emit = defineEmits(['update:modelValue', 'select', 'error'])

const searchQuery = ref('')
const results = ref<Barangay[]>([])
const isLoading = ref(false)
const showDropdown = ref(false)
const error = ref<string | null>(null)

const debouncedSearch = useDebounceFn(async (query: string) => {
  if (!query || query.length < 2) {
    results.value = []
    return
  }

  isLoading.value = true
  error.value = null

  try {
    const client = new GisPh({
      accessToken: props.accessToken,
      apiKey: props.apiKey
    })

    const { data } = await client.barangays.search({ q: query })
    results.value = data || []
    showDropdown.value = true
  } catch (err: any) {
    console.error('Barangay search error:', err)
    error.value = err.message || 'Failed to fetch barangays'
    emit('error', error.value)
    results.value = []
  } finally {
    isLoading.value = false
  }
}, 300)

watch(searchQuery, (newQuery) => {
  debouncedSearch(newQuery)
})

const selectItem = (item: any) => {
  emit('update:modelValue', item)
  emit('select', item)
  searchQuery.value = item.name // or item.full_name if preferred
  showDropdown.value = false
}

// Close dropdown when clicking outside (rudimentary implementation)
// In a real lib, use onClickOutside from vueuse
</script>

<template>
  <div class="barangay-search-container">
    <div class="input-wrapper">
      <input
        type="text"
        v-model="searchQuery"
        :placeholder="placeholder"
        class="search-input"
        @focus="showDropdown = true"
      />
      <div v-if="isLoading" class="loader">Loading...</div>
    </div>
    
    <ul v-if="showDropdown && results.length > 0" class="results-dropdown">
      <li 
        v-for="item in results" 
        :key="item.id || item.code" 
        @click="selectItem(item)"
        class="result-item"
      >
        <span class="barangay-name">{{ item.name }}</span>
        <small class="location-context">
             {{ item.municipality }}, {{ item.province }}
        </small>
      </li>
    </ul>
    
    <div v-if="showDropdown && results.length === 0 && searchQuery.length >= 2 && !isLoading" class="no-results">
        No results found.
    </div>
     <div v-if="error" class="error-message">
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
  padding: 10px 14px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 1rem;
  line-height: 1.5;
  color: #1e293b;
  background-color: white;
  transition: all 0.2s ease-in-out;
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
}

.search-input:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.15);
}

.search-input::placeholder {
  color: #94a3b8;
}

.loader {
  position: absolute;
  right: 12px;
  font-size: 0.875rem;
  color: #64748b;
  pointer-events: none;
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
  color: #ef4444;
  font-size: 0.875rem;
  margin-top: 6px;
}

/* Scrollbar styling */
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
