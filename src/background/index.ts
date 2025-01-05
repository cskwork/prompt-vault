import { ExtensionMessage } from '../types/messages';

console.log('Background script loaded');

// Listen for installation
chrome.runtime.onInstalled.addListener(() => {
  console.log('Prompt Vault installed');
});

// Listen for commands
chrome.commands.onCommand.addListener((command) => {
  if (command === 'open_popup') {
    chrome.action.openPopup();
  }
});

// Listen for messages from popup
chrome.runtime.onMessage.addListener((
  message: ExtensionMessage,
  _sender: chrome.runtime.MessageSender
) => {
  console.log('Received message:', message);
  return false;
});
