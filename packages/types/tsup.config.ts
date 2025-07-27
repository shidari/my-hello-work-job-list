import { defineConfig } from "tsup";
export default defineConfig({
  entry: ["src/index.ts"],
  noExternal: ["zod"],
  outDir: "dist",
  splitting: false,
  sourcemap: true,
  clean: true,
  format: ["cjs"],
  target: "es2022",
});
