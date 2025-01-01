import { defineManifest } from '@crxjs/vite-plugin';
import packageJson from '../package.json';

const { version } = packageJson;

export default defineManifest({
  manifest_version: 3,
  name: 'Prompt Vault',
  version,
  description: 'A Chrome extension for managing and organizing custom prompts',
  permissions: ['storage', 'contextMenus', 'clipboardWrite'],
  action: {
    default_popup: 'src/popup/index.html'
  },
  background: {
    service_worker: 'src/background/index.ts',
    type: 'module'
  },
  commands: {
    open_popup: {
      suggested_key: {
        default: 'Ctrl+Shift+P',
        mac: 'Command+Shift+P'
      },
      description: 'Open Prompt Vault'
    }
  }
});
