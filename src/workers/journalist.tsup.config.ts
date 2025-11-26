import { defineConfig } from 'tsup';

export default defineConfig({
    entry: ['src/workers/journalist.ts'],
    outDir: 'dist/workers/journalist',
    format: ['cjs'],
    dts: false,
    sourcemap: false,
    target: 'esnext',
});
