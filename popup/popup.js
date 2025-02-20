document.addEventListener("DOMContentLoaded", () => {
  const optionsLink = document.getElementById("options-link");
  const toggle = document.getElementById("activate-extension");

  chrome.storage.sync.get("isExtensionActive", (data) => {
    toggle.checked = data.isExtensionActive; 
  });

  toggle.addEventListener("change", () => {
    chrome.storage.sync.set({ isExtensionActive: toggle.checked }, () => {
      console.log("Redirezione aggiornata:", toggle.checked);
    });
  });
});
