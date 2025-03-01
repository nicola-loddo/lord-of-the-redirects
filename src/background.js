let storedData = {
  redirectRules: [],
  isExtensionActive: false,
  getStoredData: async function () {
    storedData.redirectRules = await getStoredRules();
    storedData.isExtensionActive = await isExtensionActive();
  }
}

async function getStoredRules() {
  let rules = [];
  let storedData = await chrome.storage.sync.get("redirectRules");
  if (storedData && storedData.redirectRules) {
    rules = storedData.redirectRules
  }
  return rules;
}

async function isExtensionActive() {
  let result = false;
  let storedData = await chrome.storage.sync.get("isExtensionActive");
  result = storedData.isExtensionActive ? true : false
  return result;
}


function normalizeMatchingRule(rule) {
  if (!rule) {
    return null;
  }
  if (rule.patternType == "regex") {
    return rule;
  } else { //Convert wildcard to regex pattern
    var converted = '^';
    for (var i = 0; i < rule.length; i++) {
      var ch = rule.charAt(i);
      if ('()[]{}?.^$\\+'.indexOf(ch) != -1) {
        converted += '\\' + ch;
      } else if (ch == '*') {
        converted += '(.*?)';
      } else {
        converted += ch;
      }
    }
    converted += '$';
    return converted;
  }
}

function setIcon(isExtensionActive) {
  if (isExtensionActive) {
    chrome.action.setIcon({
      path: {
        "16": "../../icons/icon_on_16.png",
        "32": "../../icons/icon_on_32.png",
        "48": "../../icons/icon_on_48.png",
        "128": "../../icons/icon_on_128.png"
      }
    });
  }
  else {
    chrome.action.setIcon({
      path: {
        "16": "../../icons/icon_off_16.png",
        "32": "../../icons/icon_off_32.png",
        "48": "../../icons/icon_off_48.png",
        "128": "../../icons/icon_off_128.png"
      }
    });
  }
}

function setRules(redirectRules = [], isExtensionActive) {
  const rules = [];

  if (isExtensionActive) {
    redirectRules.forEach((redirectRule, idx) => {
      if (redirectRule.isActive && redirectRule.from && redirectRule.to) {
        redirectRule.from = normalizeMatchingRule(redirectRule.from);
        const rule = {
          "id": idx + 1,
          "priority": 1,
          "action": {
            "type": "redirect",
            "redirect": { "url": redirectRule.to }
          },
          "condition": {
            "regexFilter": redirectRule.from,
            "resourceTypes": ["script"]
          }
        }
        rules.push(rule)
      }
    })
  }
  
  setIcon(isExtensionActive)

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

async function init() {
  await storedData.getStoredData();
  setRules(storedData.redirectRules, storedData.isExtensionActive)

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
}

chrome.runtime.onStartup.addListener(init);
chrome.runtime.onInstalled.addListener(init);