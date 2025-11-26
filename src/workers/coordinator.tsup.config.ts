import { defineConfig } from 'tsup';

export default defineConfig({
    entry: ['src/workers/coordinator.ts'],
    outDir: 'dist/workers/coordinator',
    format: ['cjs'],
    dts: false,
    sourcemap: false,
    target: 'esnext',
});
