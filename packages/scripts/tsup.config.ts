import { defineConfig } from "tsup";
export default defineConfig({
  entry: ["./src/cli/copy-schema.mts"],
  outDir: "dist",
  splitting: false,
  sourcemap: true,
  clean: true,
  target: "es2022",
  format: "esm",
});
