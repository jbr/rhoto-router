import resolve from "rollup-plugin-node-resolve";
import commonjs from "rollup-plugin-commonjs";
import pkg from "./package.json";
import babel from "rollup-plugin-babel";
import external from "rollup-plugin-peer-deps-external";
export default {
  input: "src/index.js",

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
  external: ["react", "path-to-regexp"],
  plugins: [
    babel({ runtimeHelpers: true, exclude: "node_modules/**" }),
    resolve({
      modulesOnly: true,
      extensions: [".js", ".jsx", ".json"]
    }),
    commonjs()
  ]
};
