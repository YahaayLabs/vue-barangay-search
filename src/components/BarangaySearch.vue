<script setup lang="ts">
import { ref, watch } from 'vue'
import { useDebounceFn } from '@vueuse/core'

interface Props {
  province?: string
  municipality?: string
  placeholder?: string
  modelValue?: any
  accessToken?: string
}

const props = withDefaults(defineProps<Props>(), {
  placeholder: 'Search for a barangay...',
})

const API_BASE_URL = 'https://api.gis.ph/v1'

const emit = defineEmits(['update:modelValue', 'select', 'error'])

const searchQuery = ref('')
const results = ref<any[]>([])
const isLoading = ref(false)
const showDropdown = ref(false)
const error = ref<string | null>(null)

const debouncedSearch = useDebounceFn(async (query: string) => {
  if (!query || query.length < 2) {
    results.value = []
    return
  }

  // Province is no longer strictly required if using global search, 
  // but we can still respect it if provided, or implementation can change.
  // For this update, we switched to global search which doesn't require province.
  
  isLoading.value = true
  error.value = null

  try {
    const url = new URL(`${API_BASE_URL}/barangays/search`)
    url.searchParams.append('q', query)
    
    // If province is provided, we could filter on client or ask API to support it.
    // The current search endpoint is global.
    
    // if (props.province) {
    //  url.searchParams.append('province', props.province)
    // }

    const headers: HeadersInit = {}
    if (props.accessToken) {
      headers['Authorization'] = `Bearer ${props.accessToken}`
    }

    const response = await fetch(url.toString(), { headers })
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.message || `API Error: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()
    results.value = data.data || []
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
  font-family: inherit;
}

.input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.search-input {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 1rem;
}

.loader {
  position: absolute;
  right: 10px;
  font-size: 0.8rem;
  color: #666;
}

.results-dropdown {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: white;
  border: 1px solid #ccc;
  border-radius: 0 0 4px 4px;
  list-style: none;
  padding: 0;
  margin: 0;
  max-height: 200px;
  overflow-y: auto;
  z-index: 1000;
  box-shadow: 0 4px 6px rgba(0,0,0,0.1);
}

.result-item {
  padding: 8px 12px;
  cursor: pointer;
  display: flex;
  flex-direction: column;
}

.result-item:hover {
  background-color: #f5f5f5;
}

.barangay-name {
    font-weight: 500;
}

.location-context {
    font-size: 0.8em;
    color: #666;
}

.no-results {
    position: absolute;
     top: 100%;
    left: 0;
    right: 0;
    padding: 8px;
    background: white;
    border: 1px solid #ccc;
     z-index: 1000;
}
.error-message {
    color: red;
    font-size: 0.8rem;
    margin-top: 4px;
}
</style>
