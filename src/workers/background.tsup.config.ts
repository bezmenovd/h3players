import { defineConfig } from 'tsup';

export default defineConfig({
    entry: ['src/workers/background.ts'],
    outDir: 'dist/workers/background',
    format: ['cjs'],
    dts: false,
    sourcemap: false,
    target: 'esnext',
});
