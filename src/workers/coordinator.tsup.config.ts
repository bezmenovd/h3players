import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['client/coordinator.ts'],
  outDir: 'client/dist/coordinator',
  format: ['esm'],
  dts: false,
  sourcemap: false,
  target: 'esnext',
});