module.exports = {
  extends: [
    "next/core-web-vitals",
    "plugin:@typescript-eslint/recommended",
    "plugin:react/recommended",
    "plugin:react-hooks/recommended"
  ],
  parser: "@typescript-eslint/parser",
  plugins: ["@typescript-eslint", "react", "react-hooks"],
  rules: {
    // Add any custom rules here
    "react/react-in-jsx-scope": "off" // Not needed in Next.js
  },
  settings: {
    react: {
      version: "detect"
    }
  }
};
