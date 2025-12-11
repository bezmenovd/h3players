import { defineConfig } from 'tsup';

export default defineConfig({
    entry: ['src/workers/h3players.ts'],
    outDir: 'dist/workers/h3players',
    format: ['cjs'],
    dts: false,
    sourcemap: false,
    target: 'esnext',
});
