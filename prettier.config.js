/** @type {import('prettier').Config} */
module.exports = {
  // Format options
  semi: true,
  singleQuote: true,
  tabWidth: 2,
  trailingComma: 'es5',
  arrowParens: 'always',
  endOfLine: 'lf',
  printWidth: 100,

  // Plugins
  plugins: ['prettier-plugin-tailwindcss'],

  // File type specific formatting rules
  overrides: [
    {
      // JavaScript/TypeScript files
      files: '*.{js,jsx,ts,tsx,mjs,cjs}',
      options: {
        parser: 'typescript',
      },
    },
    {
      // JSON files
      files: '*.json',
      options: {
        trailingComma: 'es5',
      },
    },
    {
      // CSS/SCSS files
      files: '*.{css,scss,sass,less}',
      options: {
        singleQuote: false,
      },
    },
    {
      // Markdown files
      files: '*.md',
      options: {
        proseWrap: 'preserve',
      },
    },
    {
      // HTML-like files
      files: '*.{html,htm}',
      options: {
        printWidth: 120,
      },
    },
    {
      // Package.json (special handling)
      files: 'package.json',
      options: {
        tabWidth: 2,
      },
    },
    {
      // Tailwind CSS files
      files: ['*.css', '*.scss'],
      options: {
        plugins: ['prettier-plugin-tailwindcss'],
      },
    },
  ],
};
