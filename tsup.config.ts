import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["esm", "cjs"],
  dts: true,
  sourcemap: true,
  clean: true,
  treeshake: true,
  minify: true,
  external: ["react", "react-dom"],
  // Emit a plain styles.css alongside the JS bundles so consumers can
  // `import "react-datetimeui/styles.css"`.
  onSuccess: async () => {
    const { copyFile } = await import("node:fs/promises");
    await copyFile("src/styles.css", "dist/styles.css");
  },
});
