import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['client/archivist.ts'],
  outDir: 'client/dist/archivist',
  format: ['esm'],
  dts: false,
  sourcemap: false,
  target: 'esnext',
});