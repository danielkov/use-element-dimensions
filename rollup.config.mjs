import commonjs from "@rollup/plugin-commonjs";
import { nodeResolve } from "@rollup/plugin-node-resolve";
import typescript from "rollup-plugin-typescript2";

export default {
  input: "./src/index.ts",
  output: [
    {
      file: "dist/cjs/index.js",
      format: "cjs",
      exports: "named",
      footer: "module.exports = Object.assign(module.exports.default, module.exports);",
    },
    {
      file: "dist/esm/index.js",
      format: "esm",
    },
    {
      file: "dist/umd/index.js",
      format: "umd",
      exports: "named",
      name: "useDimensions",
      globals: {
        react: "React",
      },
    },
  ],
  plugins: [
    nodeResolve(),
    commonjs(),
    typescript({
      clean: true,
      useTsconfigDeclarationDir: true,
    }),
  ],
  external: ["react"],
};
