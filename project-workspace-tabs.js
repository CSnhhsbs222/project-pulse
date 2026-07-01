const workspaceTabs = [
  { id: "tasks", label: "Tasks", description: "Your active task list lives here." },
  { id: "notes", label: "Notes", description: "Project notes will live here in a later MVP step." },
  { id: "files", label: "Files", description: "File attachments will live here in a later MVP step." },
  { id: "ideas", label: "Ideas", description: "Brainstorms and ideas will live here in a later MVP step." },
  { id: "timeline", label: "Timeline", description: "Project history will live here in a later MVP step." },
  { id: "progress", label: "Progress", description: "Progress details will live here in a later MVP step." }
];

function isProjectDetailScreen() {
  return Boolean(document.querySelector(".back-button[data-view='home']")) &&
    Array.from(document.querySelectorAll("strong")).some((node) => node.textContent.trim() === "Tasks");
}

function findTasksToolbar() {
  return Array.from(document.querySelectorAll(".toolbar")).find((toolbar) =>
    toolbar.textContent.includes("Tasks") && toolbar.textContent.includes("Grouped by status")
  );
}

function createWorkspaceTabs() {
  const tabs = document.createElement("section");
  tabs.className = "workspace-tabs card";
  tabs.dataset.workspaceTabs = "true";
  tabs.innerHTML = `
    <div class="workspace-tab-row" role="tablist" aria-label="Project workspace sections">
      ${workspaceTabs.map((tab) => `<button class="workspace-tab ${tab.id === "tasks" ? "active" : ""}" data-workspace-tab="${tab.id}" type="button">${tab.label}</button>`).join("")}
    </div>
    <p class="card-copy workspace-tab-note">Tasks are active now. Notes, Files, Ideas, Timeline, and Progress are staged for upcoming MVP steps.</p>
  `;
  return tabs;
}

function ensureWorkspaceTabs() {
  if (!isProjectDetailScreen()) return;
  if (document.querySelector("[data-workspace-tabs='true']")) return;

  const toolbar = findTasksToolbar();
  if (!toolbar) return;
  toolbar.insertAdjacentElement("beforebegin", createWorkspaceTabs());
}

function showComingSoon(tabId) {
  const tab = workspaceTabs.find((item) => item.id === tabId);
  if (!tab || tab.id === "tasks") return;

  const existing = document.querySelector(".workspace-coming-soon");
  if (existing) existing.remove();

  const message = document.createElement("section");
  message.className = "workspace-coming-soon card";
  message.innerHTML = `
    <h3 class="card-title">${tab.label}</h3>
    <p class="card-copy">${tab.description}</p>
  `;

  const tabs = document.querySelector("[data-workspace-tabs='true']");
  tabs?.insertAdjacentElement("afterend", message);
}

document.addEventListener("click", (event) => {
  const tabButton = event.target.closest("[data-workspace-tab]");
  if (!tabButton) return;

  document.querySelectorAll(".workspace-tab").forEach((button) => button.classList.remove("active"));
  tabButton.classList.add("active");

  const tabId = tabButton.dataset.workspaceTab;
  const existing = document.querySelector(".workspace-coming-soon");
  if (tabId === "tasks") {
    existing?.remove();
    return;
  }
  showComingSoon(tabId);
});

ensureWorkspaceTabs();
new MutationObserver(ensureWorkspaceTabs).observe(document.body, { childList: true, subtree: true });
