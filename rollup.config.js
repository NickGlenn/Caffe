import typescript from "rollup-plugin-typescript2";

export default {
  input: "./src/index.ts",
  output: {
    file: "./dist/compiled.js",
    format: "cjs",
  },
  exports: "named",
  external: [
    "url",
    "http",
  ],
  plugins: [
    typescript(),
  ],
}