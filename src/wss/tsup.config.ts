import { defineConfig } from 'tsup';

export default defineConfig({
    entry: ['src/wss/server.ts'],
    outDir: 'dist/wss',
    format: ['cjs'],
    dts: false,
    sourcemap: false,
    target: 'esnext',
});
