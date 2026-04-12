# DevTools

A comprehensive suite of developer tools for formatting, validating, and transforming data. All tools run entirely in your browser for maximum privacy and speed.

## ✨ Features

### 🛠️ Developer Tools

- **JSON Tools** - Format, validate, minify, parse, and export JSON with advanced features like schema generation and diff comparison
- **Text Tools** - Compare, convert, clean, and analyze text with powerful diff visualization and transformation capabilities
- **Base64 Tools** - Encode and decode Base64 data with support for media files and easy sharing
- **XML Tools** - Parse, validate, and convert XML data with a user-friendly interface
- **CSV Tools** - Convert, validate, and transform CSV data with ease
- **Git Branch Generator** - Generate consistent git branch names following best practices

### 🌟 Key Benefits

- **Privacy First** - All processing happens in your browser. Your data never leaves your device
- **Lightning Fast** - No server round-trips means instant results
- **Modern Design** - Clean, intuitive interface with dark mode support
- **Free Forever** - All tools are completely free with no sign-up required
- **Responsive** - Works seamlessly on desktop, tablet, and mobile devices

## 🚀 Tech Stack

- **Framework** - Next.js 16 with React 19
- **Language** - TypeScript
- **Styling** - Tailwind CSS
- **Icons** - Lucide React
- **Code Editor** - CodeMirror 6
- **Testing** - Vitest
- **Linting** - ESLint with Prettier

## 📦 Installation

```bash
# Clone the repository
git clone <repository-url>
cd devtools

# Install dependencies
npm install
# or
pnpm install
# or
yarn install
```

## 🏃 Getting Started

```bash
# Run the development server
npm run dev
# or
pnpm dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## 📚 Available Scripts

```bash
# Development
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run lint:fix     # Fix ESLint errors
npm run format       # Format code with Prettier
npm run format:check # Check code formatting
npm run typecheck    # Run TypeScript type checking
npm run test         # Run tests
```

## 📁 Project Structure

```
devtools/
├── app/                      # Next.js app directory
│   ├── json/                # JSON tools page
│   ├── text/                # Text tools page
│   ├── base64/              # Base64 tools page
│   ├── xml/                 # XML tools page
│   ├── csv/                 # CSV tools page
│   ├── git-branch-generator/# Git branch generator page
│   ├── history/             # History page
│   ├── shortcuts/           # Keyboard shortcuts
│   ├── docs/                # Documentation
│   ├── about/               # About page
│   └── page.tsx             # Home page
├── components/              # Reusable components
│   ├── base64/             # Base64 tool components
│   ├── editor/             # Code editor components
│   ├── export/             # Export tool components
│   ├── format/             # Format tool components
│   ├── minify/             # Minify tool components
│   ├── parser/             # Parser tool components
│   ├── schema/             # Schema tool components
│   ├── text/               # Text tool components
│   ├── viewer/             # Viewer tool components
│   ├── ui/                 # UI components
│   └── layout/             # Layout components
├── config/                 # Configuration files
├── lib/                    # Utility functions
└── public/                 # Static assets
```

## 🎨 Features Overview

### JSON Tools
- **Diff** - Compare two JSON files side by side
- **Format** - Beautify JSON with customizable options
- **Minify** - Compress JSON to minimal size
- **Viewer** - View JSON in a tree structure
- **Parser** - Parse and validate JSON
- **Export** - Convert JSON to CSV, XML, YAML
- **Schema** - Generate and validate JSON schemas

### Text Tools
- **Diff** - Compare text with visual highlighting
- **Convert** - Transform text between formats
- **Clean** - Remove extra spaces, lines, and characters

### Base64 Tools
- **Media to Base64** - Convert images and files to Base64
- **Base64 to Media** - Decode Base64 to downloadable files
- **History** - Track recent conversions

## 🧪 Testing

```bash
# Run tests
npm test

# Run tests in watch mode
npm test -- --watch

# Run tests with coverage
npm test -- --coverage
```

## 📝 Code Style

This project uses:
- **ESLint** for code linting
- **Prettier** for code formatting
- **Husky** for git hooks
- **lint-staged** for pre-commit checks

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- UI components inspired by [shadcn/ui](https://ui.shadcn.com/)
- Icons from [Lucide](https://lucide.dev/)
- Code editor powered by [CodeMirror](https://codemirror.net/)

## 📞 Support

If you have any questions or need help, please open an issue on GitHub.

---

Made with ❤️ by developers, for developers
