import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import dts from 'vite-plugin-dts'
import { resolve } from 'path'

export default defineConfig({
    plugins: [
        vue(),
        dts({ rollupTypes: true })
    ],
    // server: {
    //   open: '/playground/index.html'
    // },
    build: {
        lib: {
            entry: resolve(__dirname, 'src/index.ts'),
            name: 'VueBarangaySearch',
            fileName: 'vue-barangay-search',
        },
        rollupOptions: {
            external: ['vue'],
            output: {
                exports: 'named',
                globals: {
                    vue: 'Vue',
                },
            },
        },
    },
})
