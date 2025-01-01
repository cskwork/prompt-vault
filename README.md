# Prompt Vault

A Chrome extension for managing and organizing custom prompts, built with React and Vite.

## Features

- Save and organize custom prompts by category
- Quick access to recently used prompts
- Search functionality
- Cross-device sync using Chrome Storage
- Context menu integration
- Import/Export functionality

## Project Structure

```
prompt-vault/
├── src/
│   ├── popup/          # Popup UI components and entry
│   ├── background/     # Background scripts
│   ├── components/     # Reusable React components
│   ├── storage/        # Chrome storage utilities
│   ├── utils/          # Helper functions
│   └── manifest.ts     # Extension manifest
├── public/
│   └── icons/         # Extension icons
├── vite.config.ts     # Vite configuration
├── tsconfig.json      # TypeScript configuration
└── package.json
```

## Development

1. Install dependencies:
```bash
npm install
```

2. Start development server:
```bash
npm run dev
```

3. Build for production:
```bash
npm run build
```

## Loading the Extension

1. Build the extension:
```bash
npm run build
```

2. Open Chrome and navigate to `chrome://extensions`
3. Enable "Developer mode"
4. Click "Load unpacked" and select the `dist` directory

## Usage

1. Click the extension icon to open the prompt manager
2. Use the search bar to find specific prompts
3. Organize prompts by categories
4. Access recently used prompts in the "Recent" tab
5. Right-click to quickly access prompts from the context menu
