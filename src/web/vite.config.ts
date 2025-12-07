import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';


export default defineConfig({
    base: '/',
    publicDir: 'public',
    build: {
        outDir: '../../dist/web',
        emptyOutDir: true
    },
    server: {
        host: '0.0.0.0',
        port: 5173,
        strictPort: true,
        open: false,
        watch: {
            usePolling: true,
            interval: 100,
        }
    },
    plugins: [
        vue(),
    ]
});
