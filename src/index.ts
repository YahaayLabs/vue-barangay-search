import { App } from 'vue'
import BarangaySearch from './components/BarangaySearch.vue'

export { BarangaySearch }

export default {
    install: (app: App) => {
        app.component('BarangaySearch', BarangaySearch)
    }
}
