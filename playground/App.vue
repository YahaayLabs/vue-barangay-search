<script setup lang="ts">
import { ref } from 'vue'
import { BarangaySearch } from '../src'
import { GisPh } from 'gis.ph-sdk'

const selectedBarangay = ref<any>(null)
const province = ref('Bohol')
const municipality = ref('')
const accessToken = ref('')

const sdkResult = ref<any>(null)

async function testSdk() {
  const client = new GisPh({
    accessToken: accessToken.value
  })
  try {
    const response = await client.provinces.list({ limit: 5 })
    sdkResult.value = response
  } catch (err) {
    sdkResult.value = err
  }
}
</script>

<template>
  <div class="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6 font-sans text-gray-800">
    <div class="w-full max-w-lg bg-white rounded-xl shadow-lg p-8">
      <h1 class="text-2xl font-bold text-center text-gray-900 mb-8">Vue Barangay Search</h1>
      
      <div class="mb-6 space-y-4">
        <div class="">
          <label class="block text-sm font-medium text-gray-700 mb-1">
            API Access Token <span class="text-xs text-gray-500 font-normal">(Optional)</span>
          </label>
          <input 
            v-model="accessToken" 
            type="password" 
            placeholder="Bearer token or API Key" 
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            Province <span class="text-xs text-gray-500 font-normal">(Optional - Global Search)</span>
          </label>
          <input 
            v-model="province" 
            type="text" 
            placeholder="e.g. Bohol" 
             class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
          />
        </div>
        
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            Municipality <span class="text-xs text-gray-500 font-normal">(Optional)</span>
          </label>
          <input 
            v-model="municipality" 
            type="text" 
            placeholder="e.g. Tagbilaran" 
             class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
          />
        </div>
      </div>

      <div class="mb-8">
        <label class="block text-sm font-medium text-gray-700 mb-1">
            Search Barangay
        </label>
        <BarangaySearch
          :province="province"
          :municipality="municipality"
          :access-token="accessToken"
          v-model="selectedBarangay"
          @select="(item) => console.log('Selected:', item)"
        />
        <p class="mt-2 text-xs text-gray-500">Start typing to search across all barangays.</p>
      </div>

      <div class="bg-blue-50 border border-blue-100 rounded-lg p-4">
        <h3 class="text-sm font-semibold text-blue-900 mb-2">Selected Object:</h3>
        <pre class="text-xs text-blue-800 overflow-x-auto whitespace-pre-wrap font-mono">{{ selectedBarangay }}</pre>
      </div>
    </div>
    
    <footer class="mt-8 text-center text-sm text-gray-400">
        Demo Playground for GIS.PH Utils
    </footer>

    <!-- SDK Direct Test Section -->
    <div class="mt-8 w-full max-w-lg bg-white rounded-xl shadow-lg p-8">
      <h2 class="text-xl font-bold text-gray-900 mb-4">SDK Direct Test</h2>
      <button 
        @click="testSdk"
        class="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition"
      >
        Fetch Provinces via SDK
      </button>
      <div v-if="sdkResult" class="mt-4 bg-gray-100 p-4 rounded text-xs font-mono overflow-auto max-h-40">
        {{ sdkResult }}
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Tailwind handles the styling now */
</style>
