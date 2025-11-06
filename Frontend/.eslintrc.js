module.exports = {
    parserOptions: {
        ecmaVersion: 2021,
        sourceType: "module",
        ecmaFeatures: { jsx: true },
    },
    env: {
        browser: true,
        node: true,
        es2021: true,
        jest: true,
    },
    extends: ["eslint:recommended", "plugin:react/recommended"],
    plugins: ["react"],
    rules: {
    // your custom rules here
        "react/react-in-jsx-scope": "off",
        "no-unused-vars": ["warn", { varsIgnorePattern: "React" }],
        "indent": ["error", 4], // 4 spaces per indentation level
        "no-mixed-spaces-and-tabs": "error",
        "no-undef": "off",
    },
    settings: {
        react: {
            version: "detect",
        },
    },
};
