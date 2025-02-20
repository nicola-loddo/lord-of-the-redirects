function setRules(redirectRules=[], isExtensionActive) {
  const rules = [];

  if (isExtensionActive) {
    redirectRules.forEach((redirectRule, idx) => {
      if (redirectRule.isActive && redirectRule.from && redirectRule.to) {
  
        const rule = {
          "id": idx + 1,
          "priority": 1,
          "action": {
            "type": "redirect",
            "redirect": { "url": redirectRule.to }
          },
          "condition": {
            "urlFilter": redirectRule.from,
            "resourceTypes": ["script"]
          }
        }
        rules.push(rule)
      }
    })

    chrome.action.setIcon({
      path: {
        "16": "icons/icon_on_16.png",
        "32": "icons/icon_on_32.png",
        "48": "icons/icon_on_48.png",
        "128": "icons/icon_on_128.png"
      }
    });
  }
  else {
    chrome.action.setIcon({
      path: {
        "16": "icons/icon_off_16.png",
        "32": "icons/icon_off_32.png",
        "48": "icons/icon_off_48.png",
        "128": "icons/icon_off_128.png"
      }
    });

  }

  chrome.declarativeNetRequest.getDynamicRules((oldRules) => {
    // reset old rules
    let oldRulesId = oldRules && oldRules.length ? oldRules.map(r => r.id) : []

    console.log("setRules", rules, oldRulesId, isExtensionActive)

    chrome.declarativeNetRequest.updateDynamicRules({
      removeRuleIds: oldRulesId,
      addRules: rules
    }, () => {
      chrome.declarativeNetRequest.getDynamicRules((rules) => console.log("afterSet: rules", rules));
    });
  });
}


chrome.storage.sync.get(["redirectRules", "isExtensionActive"], (data) => {
  let isExtensionActive = data.isExtensionActive !== false;
  console.log("firstGet", data.redirectRules, isExtensionActive)

  setRules(data.redirectRules, isExtensionActive)
});

// on change event
chrome.storage.onChanged.addListener((changes) => {
  console.log("onChange", changes)
  if (changes.isExtensionActive) {
    chrome.storage.sync.get(["redirectRules"], (data) => {
      console.log("onChange - isExtensionActive", changes.isExtensionActive.newValue, data.redirectRules)
      setRules(data.redirectRules, changes.isExtensionActive.newValue)
    });
  }
  else if (changes.redirectRules) {
    chrome.storage.sync.get(["isExtensionActive"], (data) => {
      console.log("onChange - redirectRules", changes.redirectRules.newValue, data.isExtensionActive)
      setRules(changes.redirectRules.newValue, data.isExtensionActive)
    });
  }
});
