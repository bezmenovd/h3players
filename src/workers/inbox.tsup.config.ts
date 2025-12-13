import { defineConfig } from 'tsup';

export default defineConfig({
    entry: ['src/workers/inbox.ts'],
    outDir: 'dist/workers/inbox',
    format: ['cjs'],
    dts: false,
    sourcemap: false,
    target: 'esnext',
});
