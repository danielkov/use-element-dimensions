import typescript from "rollup-plugin-typescript2";
import resolve from "rollup-plugin-node-resolve";

export default {
  input: "./src/index.ts",
  output: [
    {
      file: "dist/cjs/index.js",
      format: "cjs"
    },
    {
      file: "dist/esm/index.js",
      format: "esm"
    },
    {
      file: "dist/umd/index.js",
      format: "umd",
      globals: {
        react: "React",
        "react-dom": "ReactDOM"
      }
    }
  ],
  plugins: [typescript(), resolve()],
  external: ["react"]
};
