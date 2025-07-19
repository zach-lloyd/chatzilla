import js from "@eslint/js";
import globals from "globals";
import react from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";
import jsxA11y from "eslint-plugin-jsx-a11y";
import reactRefresh from "eslint-plugin-react-refresh";
import prettier from "eslint-config-prettier/flat";

export default [
  // Base JS rules (syntax errors, best practices, etc.).
  js.configs.recommended,

  {
    // Ignore transpiled output.
    ignores: ["dist"],
    // Apply to every source file in the project.
    files: ["**/*.{js,jsx}"],

    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
      parserOptions: {
        ecmaVersion: "latest", // Allow newer syntax behind Babel.
        ecmaFeatures: { jsx: true },
        sourceType: "module",
      },
    },
    // Register plugins (object form is required by ESLint 9 flat-config).
    plugins: {
      react,
      "react-hooks": reactHooks,
      "jsx-a11y": jsxA11y,
      "react-refresh": reactRefresh, // Avoid issues with Vite's fast refresh.
    },
    // Let the React plugin auto-detect version from package.json.
    settings: {
      react: { version: "detect" },
    },

    rules: {
      // Pull in each plugin’s recommended ruleset.
      ...react.configs.recommended.rules,
      ...reactHooks.configs.recommended.rules,
      ...jsxA11y.configs.recommended.rules,

      "no-unused-vars": ["error", { varsIgnorePattern: "^[A-Z_]" }],
      "react-refresh/only-export-components": [
        "warn",
        { allowConstantExport: true },
      ],
      // Avoid issues with removal of import React statement, which is not needed
      // with React 17+.
      "react/react-in-jsx-scope": "off",
    },
  },

  // Prettier needs to be last so it disables any clashing stylistic rules.
  prettier,
];
