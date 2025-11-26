import { defineConfig } from 'tsup';

export default defineConfig({
    entry: ['src/workers/archivist.ts'],
    outDir: 'dist/workers/archivist',
    format: ['cjs'],
    dts: false,
    sourcemap: false,
    target: 'esnext',
});
