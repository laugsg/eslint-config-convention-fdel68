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
  plugins: [
    "@typescript-eslint", 
    "import", 
    "filenames-simple", 
    "react", 
    "repo-structure",
  ],
  rules: {
    "import/no-default-export": "error",
    "@typescript-eslint/naming-convention": [
      "error",
      { selector: "typeLike", format: ["PascalCase"] },
    ],
    "filenames-simple/naming-convention": ["error", { "rule": "kebab-case" }],
    "react/jsx-pascal-case": 2,
    "repo-structure/file-structure": "error",
  },
  "settings": {
    "repo-structure/config-path": ".repo-structurerc.json"
  }
};
