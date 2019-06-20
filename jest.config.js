module.exports = {
  roots: ["."],
  moduleFileExtensions: ["ts", "tsx", "js"],
  transform: {
    "\\.(ts|tsx)$": "ts-jest"
  },
  moduleDirectories: ["node_modules"],
  globals: {
    NODE_ENV: "test"
  }
};
