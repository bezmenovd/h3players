import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['client/spectator.ts'],
  outDir: 'client/dist/spectator',
  format: ['esm'],
  dts: false,
  sourcemap: false,
  target: 'esnext',
});