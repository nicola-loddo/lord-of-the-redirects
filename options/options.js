document.addEventListener("DOMContentLoaded", () => {
  let ruleListDiv = document.getElementById("rule-list");
  document.getElementById("add-rule").addEventListener("click", addRule);
  document.getElementById("save-btn").addEventListener("click", saveRules);

  ruleListDiv.addEventListener("click", (e) => {
    if (e.target.classList.contains("path-trash") || e.target.classList.contains("trash")) {
      e.preventDefault();
      e.stopPropagation();
      
      let ruleRow = e.target.closest('.rule');
      let ruleData = getDataFromRuleRowDiv(ruleRow);

      ruleRow.remove();

      if (ruleData.id) {
        deleteSavedRule(ruleData.id)
      }
    }
  }) 

  function addRule(ruleData = {}) {
    const ruleDiv = document.createElement("div");
    ruleDiv.classList.add("rule");
    let id = ruleData.id ? ruleData.id : (new Date()).getTime()
    let row = `
      <input type="hidden" name="id" value="${id}">
      <div class="rule-fields">
        <div class="rule-name">
          <input type="text" name="name" placeholder="Rule Name" ${ruleData.name ? 'value="' + ruleData.name + '"' : ""}>
        </div>
        
        <div class="rule-data">
          <input type="text" name="from" placeholder="From" ${ruleData.from ? 'value="' + ruleData.from + '"' : ""}>
          <input type="text" name="to" placeholder="To" ${ruleData.name ? 'value="' + ruleData.to + '"' : ""}>
        </div>
        </div>
      <div class="rule-actions">
        <div class="checkbox-container">
          <input type="checkbox" name="is-active" id="is-active-${id}" class="checkbox" ${ruleData.isActive ? "checked" : ""}>
          <label for="is-active-${id}" class="checkbox-label">Active</label>
        </div>

        <svg xmlns="http://www.w3.org/2000/svg" width="25" height="25" class="trash" fill="currentColor" viewBox="0 0 16 16">
          <path class="path-trash" d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5m2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5m3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0z"/>
          <path class="path-trash" d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4zM2.5 3h11V2h-11z"/>
        </svg>
      </div>
    `;

    ruleDiv.innerHTML = row;
    ruleListDiv.appendChild(ruleDiv);
  }

  // Function to show the "done" alert
  function showAlert(message) {
    const alertContainer = document.getElementById("alert-container");
    const alertDiv = document.createElement("div");
    alertDiv.classList.add("alert");
    alertDiv.textContent = message;

    alertContainer.appendChild(alertDiv);

    alertDiv.style.display = "block";

    setTimeout(() => {
      alertDiv.style.display = "none";
    }, 3000);
  }

  function getDataFromRuleRowDiv(ruleRow) {
    const name = ruleRow.querySelector("input[name='name']").value;
    const to = ruleRow.querySelector("input[name='to']").value;
    const from = ruleRow.querySelector("input[name='from']").value;
    const id = ruleRow.querySelector("input[name='id']").value;
    const isActive = ruleRow.querySelector("input[name='is-active']").checked;
        
    return { name, to, from, id, isActive };
  }

  function deleteSavedRule(id) {
    chrome.storage.sync.get("redirectRules", (data) => {
      if (data.redirectRules && data.redirectRules.length) {
        let rules = data.redirectRules.filter(function (rule) {
          return rule.id !== id;
        });
        
        chrome.storage.sync.set({ redirectRules: rules }, () => {
          showAlert("Rule Successfully Deleted");
        });
      }
    });
  }

  function saveRules() {
    const rules = [];
    const ruleElements = document.querySelectorAll(".rule");

    ruleElements.forEach(rule => {
      let ruleData = getDataFromRuleRowDiv(rule)

      if (ruleData) {
        rules.push(ruleData);
      }
    });

    if (rules.length) {
      chrome.storage.sync.set({ redirectRules: rules }, () => {
        showAlert("Done");
      });
    }
  }


  chrome.storage.sync.get("redirectRules", (data) => {
    if (data.redirectRules && data.redirectRules.length) {
      ruleListDiv.innerHTML = "";
      data.redirectRules.forEach(rule => {
        addRule(rule);
      });
    }
  });

});
