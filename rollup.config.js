import resolve from "rollup-plugin-node-resolve";
import commonjs from "rollup-plugin-commonjs";
import pkg from "./package.json" with { type: "json" };
import typescript from "rollup-plugin-typescript2";
import external from "rollup-plugin-peer-deps-external";
export default {
  input: "src/index.ts",

  output: [
    {
      file: pkg.main,
      format: "cjs",
      exports: "named",
      sourcemap: true
    },
    {
      file: pkg.module,
      format: "es",
      exports: "named",
      sourcemap: true
    }
  ],
  external: ["react", "path-to-regexp", "qs"],
  plugins: [
    typescript(),
    resolve({
      modulesOnly: true,
      extensions: [".ts", ".js", ".jsx", ".json"]
    }),
    commonjs({ extensions: [".js", ".ts"] }),
    external()
  ]
};
