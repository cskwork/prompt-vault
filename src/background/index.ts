// Listen for installation
chrome.runtime.onInstalled.addListener(() => {
  console.log('Prompt Vault installed')
})

// Listen for commands
chrome.commands.onCommand.addListener((command) => {
  if (command === 'open_popup') {
    chrome.action.openPopup()
  }
})
