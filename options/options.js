// MODAL
function initModal() {
  const modal = document.getElementById("modal");
  const modalContent = modal.querySelector(".modal-content");
  const closeModalBtn = modal.querySelector(".modal-close");

  modal.open = function (content) {
    modalContent.innerHTML = "";
    if (content) {
      modalContent.append(content)
    }

    modal.style.display = "block";
    setTimeout(() => {
      modal.classList.add("show");
    }, 10);
  };

  modal.close = function () {
    modal.classList.remove("show");
    setTimeout(() => {
      modal.style.display = "none";
    }, 300);
  }

  closeModalBtn.addEventListener("click", function () {
    modal.close();
  });

  window.addEventListener("click", function (event) {
    if (event.target === modal) {
      modal.close();
    }
  });

  return modal;
}

const modal = initModal();

async function getStoredRules() {
  let rules = [];
  let storedData = await chrome.storage.sync.get("redirectRules");
  if (storedData && storedData.redirectRules) {
    rules = storedData.redirectRules
  }
  return rules;
}

async function saveRules(rules, message) {
  if (rules) {
    await chrome.storage.sync.set({ redirectRules: rules });

    printStoredRules();

    if (message) {
      showAlert(message);
    }
  }
  else {
    showAlert("No Rules Provided!", "error");
  }

  modal.close();
}

async function importRules(rules=[]) {  
  let storedRules = await getStoredRules();
  storedRules = storedRules.concat(rules)
  saveRules(storedRules, "Rules Successfully Imported!")
}

async function saveRule(rule, isAnUpdate) {
  let rules = await getStoredRules();

  if (rule) {
    if (isAnUpdate) {
      rules.forEach((r, idx) => {
        if (r.id == rule.id) {
          rules[idx] = rule
        }
      })
    }
    else {
      rules.push(rule)
    }
  }
  
  let message = isAnUpdate ? "Rule Successfully Updated!" : "Rule Successfully Created!"

  saveRules(rules, message)
}

async function deleteRule(ruleId) {
  if (ruleId) {
    if (!window.confirm("Are you sure you want to delete this rule?")) {
      return;
    }

    let rules = await getStoredRules();

    rules = rules.filter(function (rule) {
      return rule.id != ruleId;
    });

    await chrome.storage.sync.set({ redirectRules: rules });

    showAlert("Rule Successfully Deleted!");

    let item = document.querySelector(`[data-rule-id="${ruleId}"]`);
    if (item) {
      item.remove()
    }
  }
  else {
    showAlert("No Valid id Rule Provided!", "error");
  }
}

function getCheckedMarkup(isChecked) {
  if (isChecked) {
    return
    `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-check2" viewBox="0 0 16 16">
      <path d="M13.854 3.646a.5.5 0 0 1 0 .708l-7 7a.5.5 0 0 1-.708 0l-3.5-3.5a.5.5 0 1 1 .708-.708L6.5 10.293l6.646-6.647a.5.5 0 0 1 .708 0" />
    </svg>`;
  }
  return
  `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-x" viewBox="0 0 16 16">
    <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708"/>
  </svg>`;
}

function getRuleIdFromActionElementClicked(e) {
  return e.target.closest('.rule-item-container');
}

function generateRuleItemMarkup(rule) {
  if (rule) {
    let ruleItem = document.createElement("div");
    ruleItem.rule = rule;
    ruleItem.classList.add("rule-item-container");
    ruleItem.setAttribute("data-rule-id", rule.id);

    let ruleItemContent = `
        <div class="rule-drag-handle">⠿</div>
        <div class="rule-item">
          <div class="rule-item-content">
            <h3>
              <span class="${rule.isActive ? 'rule-active' : 'rule-not-active'}">${rule.isActive 
                  ? 
                '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-check2" viewBox="0 0 16 16"><path d = "M13.854 3.646a.5.5 0 0 1 0 .708l-7 7a.5.5 0 0 1-.708 0l-3.5-3.5a.5.5 0 1 1 .708-.708L6.5 10.293l6.646-6.647a.5.5 0 0 1 .708 0" /></svg>'
                    : 
                '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-x" viewBox="0 0 16 16"><path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708" /></svg>'
              }
              </span>
              <span>${rule.name}</span>
            </h3>
            <ul>
              <li><span>From: </span><span class="rule-item-rule">${rule.from}<span></li>
              <li><span>To: </span><span class="rule-item-rule">${rule.to}<span></li>
            </ul>
          </div>
          <div class="rule-item-actions">
            <div class="rule-item-edit">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-pencil" viewBox="0 0 16 16">
                <path d="M12.146.146a.5.5 0 0 1 .708 0l3 3a.5.5 0 0 1 0 .708l-10 10a.5.5 0 0 1-.168.11l-5 2a.5.5 0 0 1-.65-.65l2-5a.5.5 0 0 1 .11-.168zM11.207 2.5 13.5 4.793 14.793 3.5 12.5 1.207zm1.586 3L10.5 3.207 4 9.707V10h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.293zm-9.761 5.175-.106.106-1.528 3.821 3.821-1.528.106-.106A.5.5 0 0 1 5 12.5V12h-.5a.5.5 0 0 1-.5-.5V11h-.5a.5.5 0 0 1-.468-.325"/>
              </svg>
            </div>
            <div class="rule-item-delete">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-trash" viewBox="0 0 16 16">
                <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5m2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5m3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0z"/>
                <path d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4zM2.5 3h11V2h-11z"/>
              </svg>
            </div>
          </div>
        </div>
      `;

    ruleItem.innerHTML = ruleItemContent;

    let deleteBtn = ruleItem.querySelector(".rule-item-delete");
    let editBtn = ruleItem.querySelector(".rule-item-edit");

    deleteBtn.addEventListener("click", async e => {
      let item = getRuleIdFromActionElementClicked(e);
      let ruleId = item.getAttribute("data-rule-id");

      await deleteRule(ruleId)
    })
    
    editBtn.addEventListener("click", e => {
      let item = getRuleIdFromActionElementClicked(e);
      if (item) {
        createRuleForm(item.rule)
      }
    })

    return ruleItem
  }
}

function generateRuleList(rules) {
  let rulesList = document.createElement("div");
  rulesList.classList.add("rules-list");

  rules.forEach((rule) => {
    let ruleItem = generateRuleItemMarkup(rule);
    rulesList.append(ruleItem)
  })

  return rulesList;
}


// CREATE RULE FORM
function createRuleForm(ruleData) {
  let isAnUpdate = ruleData ? true : false;
  ruleData = ruleData ? ruleData : {};

  const ruleDiv = document.createElement("div");
  let ruleId = ruleData.id ? ruleData.id : (new Date()).getTime()
  let row = `
      <div class="rule-form">
        <h3>${isAnUpdate ? "Edit" : "Add"} Rule</h3>
        <input type="hidden" name="id" value="${ruleId}">
        <div class="rule-form-row">
          <div class="rule-form-fields">
            <div class="rule-form-field">
              <label>Name*</label>
              <input type="text" name="name" placeholder="My Custom JS" ${ruleData.name ? 'value="' + ruleData.name + '"' : ""}>
            </div>
            
            <div class="rule-form-field">
              <label>From*</label>
              <input type="text" name="from" placeholder="https://example.com/my-script.js" ${ruleData.from ? 'value="' + ruleData.from + '"' : ""}>
            </div>
            
            <div class="rule-form-field">
              <label>To*</label>
              <input type="text" name="to" placeholder="http://localhost/my-script.js" ${ruleData.name ? 'value="' + ruleData.to + '"' : ""}>
            </div>
            
            <div class="rule-form-field">
              <div class="checkbox-container">
                <label for="is-active" class="checkbox-label">Active</label>
                <input type="checkbox" name="is-active" id="is-active" class="checkbox" ${ruleData.isActive ? "checked" : ""}>
              </div>
            </div>
          </div>

        </div>
        <div class="rule-form-row actions">
          <button id="delete-rule" class="red">Delete</button>
          <button id="save-rule">Save</button>
        </div>
      </div>
    `;

  ruleDiv.innerHTML = row;
  modal.open(ruleDiv);

  const nameField = ruleDiv.querySelector("input[name='name']");
  const toField = ruleDiv.querySelector("input[name='to']");
  const fromField = ruleDiv.querySelector("input[name='from']");
  const idField = ruleDiv.querySelector("input[name='id']");
  const isActiveField = ruleDiv.querySelector("input[name='is-active']");
  const saveRuleBtn = ruleDiv.querySelector("#save-rule");
  const deleteRuleBtn = ruleDiv.querySelector("#delete-rule");

  saveRuleBtn.addEventListener("click", async (e) => {
    const name = nameField.value;
    const to = toField.value;
    const from = fromField.value;
    const id = idField.value;
    const isActive = isActiveField.checked;

    if (name && to && from && id) {
      let newRule = { name, to, from, id, isActive };

      await saveRule(newRule, isAnUpdate)
    }
  })

  deleteRuleBtn.addEventListener("click", async (e) => {
    const id = idField.value;
    
    if (id) {
      await deleteRule(id)
      modal.close()
    }
  })
}

// Function to show the "done" alert
function showAlert(message, type="success") {
  const alertContainer = document.getElementById("alert-container");
  const alertDiv = document.createElement("div");
  alertDiv.classList.add("alert", type);
  alertDiv.textContent = message;
  
  alertContainer.appendChild(alertDiv);
  
  alertDiv.style.display = "block";
  
  alertContainer.classList.add("show")
  
  setTimeout(() => {
    alertContainer.classList.remove("show")
    alertDiv.remove();
  }, 1500);
}

function toggleAccordion() {
  var content = document.querySelector(".accordion-content");
  var button = document.querySelector(".accordion-btn");

  if (content.style.display === "block") {
    content.style.display = "none";
    button.innerHTML = "▼ Supported URL Formats";
  } else {
    content.style.display = "block";
    button.innerHTML = "▲ Supported URL Formats";
  }
}

function handleDragAndDropRuleItems() {
  const list = document.querySelector(".rules-list");
  let draggedItem = null;

  function onItemReordered(movedItem, targetItem) {
    console.log(`Elemento spostato: ${movedItem.dataset.ruleId} -> Posizione di: ${targetItem.dataset.ruleId}`);
  }

  document.querySelectorAll(".rule-item-container").forEach((item) => {
    const dragButton = item.querySelector(".rule-drag-handle");
    // Imposta l'elemento come draggable solo se si preme il pulsante
    dragButton.addEventListener("mousedown", function (e) {
      item.setAttribute("draggable", "true");
    });

    item.addEventListener("dragstart", function () {
      draggedItem = this;
      setTimeout(() => (this.style.display = "none"), 0);
    });

    item.addEventListener("dragend", function () {
      setTimeout(() => {
        draggedItem.style.display = "flex";
        draggedItem = null;
        this.setAttribute("draggable", "false"); // Disattiva drag dopo il rilascio
      }, 0);
    });

    item.addEventListener("dragover", function (e) {
      e.preventDefault();
      this.classList.add("dd-active-border")
    });
    
    item.addEventListener("dragleave", function () {
      this.classList.remove("dd-active-border")
    });
    
    item.addEventListener("drop", function (e) {
      e.preventDefault();
      this.classList.remove("dd-active-border")

      if (draggedItem) {
        let allItems = [...list.querySelectorAll(".rule-item-container")];
        let currentIndex = allItems.indexOf(this);
        let draggedIndex = allItems.indexOf(draggedItem);

        if (currentIndex > draggedIndex) {
          this.after(draggedItem);
        } else {
          this.before(draggedItem);
        }

        onItemReordered(draggedItem, this);
      }
    });
  });
}

async function printStoredRules() {
  let ruleListDiv = document.getElementById("rule-list-container");
  ruleListDiv.innerHTML = "";

  let storedRules = await getStoredRules();
  if (storedRules.length) {
    let ruleList = generateRuleList(storedRules);
    ruleListDiv.append(ruleList)
  }

  handleDragAndDropRuleItems()
}

document.addEventListener("DOMContentLoaded", async () => {
  let accordionBtn = document.getElementById("accordion-btn");
  let addRuleBtn = document.getElementById("add-rule");
  let exportRulesBtn = document.getElementById("export-rules");
  let importRulesBtn = document.getElementById("import-rules-button");
  let importRulesField = document.getElementById("import-rules");

  addRuleBtn.addEventListener("click", () => { createRuleForm() });

  accordionBtn.addEventListener("click", toggleAccordion);

  printStoredRules();


  importRulesBtn.addEventListener("click", function () {
    importRulesField.click();
  });

  importRulesField.addEventListener("change", function (event) {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = async function (e) {
        const jsonData = JSON.parse(e.target.result);
        await importRules(jsonData)
      };
      reader.readAsText(file);
    }
  });

  exportRulesBtn.addEventListener("click", async function () {
    let storedRules = await getStoredRules();
    const jsonStr = JSON.stringify(storedRules);

    const blob = new Blob([jsonStr], { type: "application/json;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.style.display = "none";
    a.href = url;
    a.setAttribute("download", "export.json");
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  });
});

