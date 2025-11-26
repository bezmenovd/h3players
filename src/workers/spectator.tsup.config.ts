import { defineConfig } from 'tsup';

export default defineConfig({
    entry: ['src/workers/spectator.ts'],
    outDir: 'dist/workers/spectator',
    format: ['cjs'],
    dts: false,
    sourcemap: false,
    target: 'esnext',
});
