module.exports = {
  env: {
    browser: true,
    es2021: true,
    jest: true,
  },
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
    ecmaVersion: 12,
    sourceType: "module",
  },
  plugins: ["@typescript-eslint", "import", "filenames-simple", "react", "foldernaming"],
  rules: {
    "import/no-default-export": "error",
    "@typescript-eslint/naming-convention": [
      "error",
      { selector: "typeLike", format: ["PascalCase"] },
    ],
    "filenames-simple/naming-convention": ["error", { "rule": "kebab-case" }],
    "foldernaming/match-regex": [2, "^[a-z-]+$", './packages/'],
    "react/jsx-pascal-case": 2
  },
};
