# Running Chrome Extension from IDE

## Prerequisites
- Node.js and npm installed
- Chrome browser
- Your favorite IDE (VS Code, WebStorm, etc.)

## Development Setup

1. Install dependencies:
```bash
npm install
```

2. Start development mode:
```bash
npm run dev
```
This will:
- Start webpack in watch mode
- Automatically rebuild the extension when you make changes
- Output the built extension to the `dist` directory

3. Load the extension in Chrome:
- Open Chrome
- Go to `chrome://extensions/`
- Enable "Developer mode" (toggle in the top right)
- Click "Load unpacked"
- Select the `dist` directory from your project

## Building for Production

To create a production build:
```bash
npm run build
```

## Development Workflow

1. Make changes to files in the `src` directory
2. If running in dev mode (`npm run dev`), the extension will automatically rebuild
3. Go to Chrome extensions page (`chrome://extensions/`)
4. Click the refresh icon on your extension card to load the new changes
5. Test your changes in Chrome

## Project Structure

- `src/`
  - `background/` - Background service worker scripts
  - `content/` - Content scripts that run on web pages
  - `popup/` - Extension popup HTML and related scripts
  - `manifest.json` - Extension configuration file

## Testing

Run tests using:
```bash
npm test
```

## Tips for IDE Usage

1. Use your IDE's built-in terminal to run the development server
2. Configure file watching in your IDE to automatically trigger webpack rebuilds
3. Use Chrome DevTools for debugging:
   - Right-click the extension icon and select "Inspect popup" for popup debugging
   - Use the "Inspect" option in chrome://extensions for background script debugging
   - Use regular DevTools (F12) for content script debugging