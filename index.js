module.exports = {
    env: {
      browser: true,
      es2021: true,
      jest: true,
    },
    "parser": "@typescript-eslint/parser",
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
      "filename-consistency",
    ],
    rules: {
      "import/no-default-export": "error",
      "@typescript-eslint/naming-convention": [
        "error",
        { selector: "typeLike", format: ["PascalCase"] },
      ],
      "filenames-simple/naming-convention": ["error", { "rule": "kebab-case" }],
      "react/jsx-pascal-case": 2,
      "filename-consistency/match": [ 
        "error",
        ["kebab"]
      ],
      "react/react-in-jsx-scope": "off",
          "no-console": [
              "error",
              {
                  "allow": ["warn", "error"]
              }
          ],
          "react/no-unused-state": 2,
          "eol-last": ["error", "always"],
          "no-plusplus": "off",
          "arrow-parens": ["error", "always"],
          "arrow-body-style": ["error", "as-needed"],
          "object-curly-newline": [
              "error",
              {
                  "ObjectExpression": {
                      "multiline": true,
                      "minProperties": 3,
                      "consistent": true
                  },
                  "ObjectPattern": {
                      "multiline": true
                  },
                  "ImportDeclaration": {
                      "multiline": true,
                      "minProperties": 5,
                      "consistent": true
                  },
                  "ExportDeclaration": {
                      "multiline": true,
                      "minProperties": 5,
                      "consistent": true
                  }
              }
          ],
          "react/display-name": "off",
          "consistent-return": "off",
          "import/extensions": 0,
          "camelcase": "off",
          "no-shadow": "off",
          "import/prefer-default-export": "off",
          "react/jsx-filename-extension": [
              1,
              {
                  "extensions": [".js", ".jsx", ".tsx"]
              }
          ],
          "@typescript-eslint/explicit-module-boundary-types": [
              "error",
              {
                  "allowDirectConstAssertionInArrowFunctions": true
              }
          ],
          "no-use-before-define": "off",
          "import/no-extraneous-dependencies": "off",
          "@typescript-eslint/no-unused-vars": "error",
          "no-self-assign": "off",
          "@typescript-eslint/no-explicit-any": "off",
          "func-names": "off",
          "react/require-default-props": "off",
          "react/no-danger": "off",
          "react/jsx-props-no-spreading": "off",
          "no-nested-ternary": "off",
          "@typescript-eslint/ban-types": [
              "error",
              {
                  "extendDefaults": true,
                  "types": {
                      "{}": false
                  }
              }
          ],
          "import/extensions": "off"
    },
    "settings": {
        "import/resolver": {
          "node": {
            "extensions": [".js", ".jsx", ".ts", ".tsx"]
          }
        }
      }
  };
  