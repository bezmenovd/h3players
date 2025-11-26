import { defineConfig } from 'tsup';

export default defineConfig({
    entry: ['src/workers/processor.ts'],
    outDir: 'dist/workers/processor',
    format: ['cjs'],
    dts: false,
    sourcemap: false,
    target: 'esnext',
});
