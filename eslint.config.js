const {
    defineConfig,
    globalIgnores,
} = require("eslint/config");

const tsParser = require("@typescript-eslint/parser");
const typescriptEslint = require("@typescript-eslint/eslint-plugin");
const jest = require("eslint-plugin-jest");
const globals = require("globals");
const js = require("@eslint/js");

const {
    FlatCompat,
} = require("@eslint/eslintrc");

const compat = new FlatCompat({
    baseDirectory: __dirname,
    recommendedConfig: js.configs.recommended,
    allConfig: js.configs.all
});

module.exports = defineConfig([{
    languageOptions: {
        parser: tsParser,

        globals: {
            ...globals.browser,
            ...globals.node,
            ...jest.environments.globals.globals,
        },
    },

    plugins: {
        "@typescript-eslint": typescriptEslint,
        jest,
    },

    extends: compat.extends(
        "next/core-web-vitals",
        "eslint:recommended",
        "plugin:@typescript-eslint/recommended",
        "plugin:jest/recommended",
        "plugin:jest/style",
    ),

    settings: {
        jest: {
            version: 29,
        },
    },

    rules: {
        "@typescript-eslint/explicit-module-boundary-types": "off",
        "@typescript-eslint/no-explicit-any": "warn",
        "@typescript-eslint/no-unused-vars": "warn",
        "react-hooks/exhaustive-deps": "warn",
    },
}, globalIgnores(["**/.next/", "**/node_modules/", "**/drizzle/"])]);
