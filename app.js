const STORAGE_KEY = "projectPulse.v0.1";

const seedState = {
  currentView: "home",
  selectedProjectId: null,
  selectedTaskId: null,
  currentUserId: "user-topher",
  users: [
    { id: "user-topher", name: "Topher", email: "topher@example.com", role: "admin" },
    { id: "user-editor", name: "Collaborator", email: "collaborator@example.com", role: "editor" },
    { id: "user-viewer", name: "Viewer", email: "viewer@example.com", role: "viewer" }
  ],
  projects: [
    {
      id: crypto.randomUUID(),
      title: "Project Pulse MVP",
      description: "Build the first working version of the mobile project planner.",
      created_by: "user-topher",
      created_at: new Date().toISOString(),
      deadline: addDaysIso(14)
    }
  ],
  tasks: [],
  subtasks: [],
  activity: []
};

function addDaysIso(days) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 10);
}

let state = loadState();
const app = document.querySelector("#app");

function loadState() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (!saved) return structuredClone(seedState);
  try {
    return { ...structuredClone(seedState), ...JSON.parse(saved) };
  } catch {
    return structuredClone(seedState);
  }
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function todayStart() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return today;
}

function daysUntil(dateString) {
  if (!dateString) return 0;
  const due = new Date(`${dateString}T00:00:00`);
  return Math.ceil((due - todayStart()) / 86400000);
}

function countdownLabel(dateString) {
  const days = daysUntil(dateString);
  if (days < 0) return `${Math.abs(days)} overdue`;
  if (days === 0) return "Due today";
  if (days === 1) return "1 day";
  return `${days} days`;
}

function countdownClass(dateString) {
  const days = daysUntil(dateString);
  if (days <= 0) return "due";
  if (days <= 3) return "warning";
  return "";
}

function userById(id) {
  return state.users.find((user) => user.id === id) || state.users[0];
}

function currentUser() {
  return userById(state.currentUserId);
}

function canEdit() {
  return ["admin", "editor"].includes(currentUser().role);
}

function canAdmin() {
  return currentUser().role === "admin";
}

function tasksForProject(projectId) {
  return state.tasks.filter((task) => task.project_id === projectId);
}

function subtasksForTask(taskId) {
  return state.subtasks.filter((subtask) => subtask.task_id === taskId);
}

function taskProgress(taskId) {
  const subtasks = subtasksForTask(taskId);
  if (!subtasks.length) {
    const task = state.tasks.find((item) => item.id === taskId);
    return Number(task?.progress_percent || 0);
  }
  return Math.round((subtasks.filter((item) => item.completed).length / subtasks.length) * 100);
}

function projectProgress(projectId) {
  const tasks = tasksForProject(projectId);
  if (!tasks.length) return 0;
  return Math.round(tasks.reduce((sum, task) => sum + taskProgress(task.id), 0) / tasks.length);
}

function syncTaskStatus(taskId) {
  const task = state.tasks.find((item) => item.id === taskId);
  if (!task) return;
  task.progress_percent = taskProgress(taskId);
  if (task.progress_percent === 100) task.status = "completed";
  if (task.progress_percent > 0 && task.progress_percent < 100 && task.status === "not started") task.status = "in progress";
}

function logActivity(action) {
  state.activity.unshift({
    id: crypto.randomUUID(),
    user_id: state.currentUserId,
    action,
    timestamp: new Date().toISOString()
  });
}

function setView(view, options = {}) {
  state.currentView = view;
  Object.assign(state, options);
  saveState();
  render();
}

function escapeHtml(value = "") {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function formatDate(dateString) {
  if (!dateString) return "No date";
  return new Date(`${dateString}T00:00:00`).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

function renderShell(content) {
  app.innerHTML = `
    <main class="app-shell">
      <header class="app-header">
        <div class="brand">
          <h1>Project Pulse</h1>
          <p>Plan projects, assign tasks, and track progress.</p>
        </div>
        <button class="icon-button" data-action="open-user-switcher" aria-label="Switch user">${escapeHtml(currentUser().name.slice(0, 1))}</button>
      </header>
      ${content}
      <nav class="nav-tabs" aria-label="Primary navigation">
        <button class="${state.currentView === "home" ? "active" : ""}" data-view="home">Projects</button>
        <button class="${state.currentView === "workspace" ? "active" : ""}" data-view="workspace">Team</button>
        <button class="${state.currentView === "activity" ? "active" : ""}" data-view="activity">Activity</button>
        <button class="${state.currentView === "help" ? "active" : ""}" data-view="help">Info</button>
      </nav>
    </main>
  `;
}

function progressMarkup(percent) {
  return `
    <div class="progress-wrap">
      <div class="progress-meta"><span>Progress</span><span>${percent}%</span></div>
      <div class="progress-bar"><div class="progress-fill" style="width:${percent}%"></div></div>
    </div>
  `;
}

function projectCard(project) {
  const progress = projectProgress(project.id);
  return `
    <article class="card project-card" data-project-id="${project.id}">
      <div class="card-row">
        <div>
          <h2 class="card-title">${escapeHtml(project.title)}</h2>
          <p class="card-copy">${escapeHtml(project.description || "No description yet.")}</p>
        </div>
        <div class="countdown ${countdownClass(project.deadline)}">${countdownLabel(project.deadline)}<small>${formatDate(project.deadline)}</small></div>
      </div>
      ${progressMarkup(progress)}
      <div class="card-row">
        <span class="badge">${tasksForProject(project.id).length} tasks</span>
        <button class="secondary-button" data-action="open-project" data-id="${project.id}">Open</button>
      </div>
    </article>
  `;
}

function renderHome() {
  const projects = state.projects.map(projectCard).join("") || `<section class="card empty-state">No projects yet. Add your first project to start planning.</section>`;
  renderShell(`
    <section class="toolbar">
      <div>
        <strong>${state.projects.length} project${state.projects.length === 1 ? "" : "s"}</strong>
        <p class="card-copy">Local working prototype. Real-time sync comes next.</p>
      </div>
      <button class="secondary-button" data-action="open-project-form">Add Project</button>
    </section>
    ${projects}
  `);
}

function taskBadge(status) {
  if (status === "completed") return `<span class="badge completed">Completed</span>`;
  if (status === "in progress") return `<span class="badge progress">In progress</span>`;
  return `<span class="badge not">Not started</span>`;
}

function taskCard(task) {
  const progress = taskProgress(task.id);
  return `
    <article class="card task-card">
      <div class="card-row">
        <div>
          <h3 class="card-title">${escapeHtml(task.title)}</h3>
          <p class="card-copy">Assigned to ${escapeHtml(userById(task.assigned_to).name)}</p>
        </div>
        <div class="countdown ${countdownClass(task.due_date)}">${countdownLabel(task.due_date)}<small>${formatDate(task.due_date)}</small></div>
      </div>
      ${progressMarkup(progress)}
      <div class="card-row">
        ${taskBadge(task.status)}
        <button class="secondary-button" data-action="open-task" data-id="${task.id}">Open</button>
      </div>
    </article>
  `;
}

function renderProjectDetail() {
  const project = state.projects.find((item) => item.id === state.selectedProjectId);
  if (!project) return setView("home", { selectedProjectId: null, selectedTaskId: null });
  const tasks = tasksForProject(project.id);
  renderShell(`
    <button class="back-button" data-view="home">← Back to projects</button>
    <section class="card">
      <div class="card-row">
        <div>
          <h2 class="card-title">${escapeHtml(project.title)}</h2>
          <p class="card-copy">${escapeHtml(project.description || "No description yet.")}</p>
        </div>
        <div class="countdown ${countdownClass(project.deadline)}">${countdownLabel(project.deadline)}<small>${formatDate(project.deadline)}</small></div>
      </div>
      ${progressMarkup(projectProgress(project.id))}
      <div class="action-grid">
        <button class="secondary-button" data-action="open-project-form" data-id="${project.id}" ${canEdit() ? "" : "disabled"}>Edit</button>
        <button class="danger-button" data-action="delete-project" data-id="${project.id}" ${canAdmin() ? "" : "disabled"}>Delete</button>
      </div>
    </section>
    <section class="toolbar">
      <strong>${tasks.length} task${tasks.length === 1 ? "" : "s"}</strong>
      <button class="secondary-button" data-action="open-task-form" ${canEdit() ? "" : "disabled"}>Add Task</button>
    </section>
    ${tasks.map(taskCard).join("") || `<section class="card empty-state">No tasks yet. Add a task to begin tracking work.</section>`}
  `);
}

function renderTaskDetail() {
  const task = state.tasks.find((item) => item.id === state.selectedTaskId);
  if (!task) return setView("project", { selectedTaskId: null });
  const subtasks = subtasksForTask(task.id);
  renderShell(`
    <button class="back-button" data-view="project">← Back to project</button>
    <section class="card">
      <div class="card-row">
        <div>
          <h2 class="card-title">${escapeHtml(task.title)}</h2>
          <p class="card-copy">${escapeHtml(task.description || "No description yet.")}</p>
          <p class="card-copy">Assigned to ${escapeHtml(userById(task.assigned_to).name)}</p>
        </div>
        <div class="countdown ${countdownClass(task.due_date)}">${countdownLabel(task.due_date)}<small>${formatDate(task.due_date)}</small></div>
      </div>
      ${progressMarkup(taskProgress(task.id))}
      <div class="field" style="margin-top:12px">
        <label for="status-select">Status</label>
        <select id="status-select" data-action="update-status" ${canEdit() ? "" : "disabled"}>
          <option value="not started" ${task.status === "not started" ? "selected" : ""}>Not started</option>
          <option value="in progress" ${task.status === "in progress" ? "selected" : ""}>In progress</option>
          <option value="completed" ${task.status === "completed" ? "selected" : ""}>Completed</option>
        </select>
      </div>
      <div class="action-grid">
        <button class="secondary-button" data-action="open-task-form" data-id="${task.id}" ${canEdit() ? "" : "disabled"}>Edit</button>
        <button class="danger-button" data-action="delete-task" data-id="${task.id}" ${canAdmin() ? "" : "disabled"}>Delete</button>
      </div>
    </section>
    <section class="toolbar">
      <strong>Subtasks</strong>
      <button class="secondary-button" data-action="open-subtask-form" ${canEdit() ? "" : "disabled"}>Add Subtask</button>
    </section>
    <section class="card">
      ${subtasks.map((subtask) => `
        <div class="subtask-row">
          <input type="checkbox" data-action="toggle-subtask" data-id="${subtask.id}" ${subtask.completed ? "checked" : ""} ${canEdit() ? "" : "disabled"} />
          <span>${escapeHtml(subtask.title)}</span>
          <button class="danger-button" data-action="delete-subtask" data-id="${subtask.id}" ${canAdmin() ? "" : "disabled"}>Delete</button>
        </div>
      `).join("") || `<div class="empty-state">No subtasks yet.</div>`}
    </section>
  `);
}

function renderWorkspace() {
  renderShell(`
    <section class="card">
      <h2 class="card-title">Shared Workspace</h2>
      <p class="card-copy">Invite teammates and set their permission level. In v0.1 this is local prototype data; real invitations will be added with backend sync.</p>
    </section>
    <section class="toolbar">
      <strong>${state.users.length} users</strong>
      <button class="secondary-button" data-action="open-user-form" ${canAdmin() ? "" : "disabled"}>Invite User</button>
    </section>
    <section class="card">
      ${state.users.map((user) => `
        <div class="user-row">
          <span class="badge">${escapeHtml(user.role)}</span>
          <div>
            <strong>${escapeHtml(user.name)}</strong>
            <p class="card-copy">${escapeHtml(user.email)}</p>
          </div>
          ${user.id === state.currentUserId ? `<span class="badge completed">Active</span>` : `<button class="secondary-button" data-action="switch-user" data-id="${user.id}">Use</button>`}
        </div>
      `).join("")}
    </section>
  `);
}

function renderActivity() {
  renderShell(`
    <section class="card">
      <h2 class="card-title">Activity Log</h2>
      <p class="card-copy">Chronological history of project, task, subtask, and user changes.</p>
    </section>
    <section class="card">
      ${state.activity.map((item) => `
        <div class="activity-row">
          <strong>${escapeHtml(userById(item.user_id).name)} ${escapeHtml(item.action)}</strong>
          <small>${new Date(item.timestamp).toLocaleString()}</small>
        </div>
      `).join("") || `<div class="empty-state">No activity yet.</div>`}
    </section>
  `);
}

function renderHelp() {
  renderShell(`
    <section class="card">
      <h2 class="card-title">Project Pulse v0.1</h2>
      <p class="card-copy">This first build proves the core app flow before adding a database, authentication, true shared editing, and push notifications.</p>
    </section>
    <section class="card">
      <h3 class="card-title">Included now</h3>
      <p class="card-copy">Projects, tasks, assigned users, role-based editing, subtasks, countdowns, progress calculations, automated status updates, and activity log.</p>
    </section>
    <section class="card">
      <h3 class="card-title">Next build</h3>
      <p class="card-copy">Supabase or Firebase setup for real-time shared editing, login, live permissions, and notification groundwork.</p>
    </section>
  `);
}

function openModal(title, body) {
  document.body.insertAdjacentHTML("beforeend", `
    <div class="modal-backdrop" data-action="close-modal">
      <section class="modal" role="dialog" aria-modal="true" onclick="event.stopPropagation()">
        <div class="modal-header">
          <h2>${escapeHtml(title)}</h2>
          <button class="close-button" data-action="close-modal">×</button>
        </div>
        ${body}
      </section>
    </div>
  `);
}

function closeModal() {
  document.querySelector(".modal-backdrop")?.remove();
}

function projectForm(project = {}) {
  openModal(project.id ? "Edit Project" : "Add Project", `
    <form class="form-grid" data-form="project">
      <input type="hidden" name="id" value="${project.id || ""}" />
      <div class="field"><label>Title</label><input name="title" required value="${escapeHtml(project.title || "")}" /></div>
      <div class="field"><label>Description</label><textarea name="description">${escapeHtml(project.description || "")}</textarea></div>
      <div class="field"><label>Deadline</label><input type="date" name="deadline" required value="${project.deadline || addDaysIso(7)}" /></div>
      <button class="primary-button">Save Project</button>
    </form>
  `);
}

function taskForm(task = {}) {
  openModal(task.id ? "Edit Task" : "Add Task", `
    <form class="form-grid" data-form="task">
      <input type="hidden" name="id" value="${task.id || ""}" />
      <div class="field"><label>Title</label><input name="title" required value="${escapeHtml(task.title || "")}" /></div>
      <div class="field"><label>Description</label><textarea name="description">${escapeHtml(task.description || "")}</textarea></div>
      <div class="inline-fields">
        <div class="field"><label>Due date</label><input type="date" name="due_date" required value="${task.due_date || addDaysIso(3)}" /></div>
        <div class="field"><label>Status</label><select name="status">
          <option value="not started" ${task.status === "not started" ? "selected" : ""}>Not started</option>
          <option value="in progress" ${task.status === "in progress" ? "selected" : ""}>In progress</option>
          <option value="completed" ${task.status === "completed" ? "selected" : ""}>Completed</option>
        </select></div>
      </div>
      <div class="field"><label>Assigned user</label><select name="assigned_to">
        ${state.users.map((user) => `<option value="${user.id}" ${task.assigned_to === user.id ? "selected" : ""}>${escapeHtml(user.name)}</option>`).join("")}
      </select></div>
      <button class="primary-button">Save Task</button>
    </form>
  `);
}

function subtaskForm() {
  openModal("Add Subtask", `
    <form class="form-grid" data-form="subtask">
      <div class="field"><label>Subtask title</label><input name="title" required /></div>
      <button class="primary-button">Save Subtask</button>
    </form>
  `);
}

function userForm() {
  openModal("Invite User", `
    <form class="form-grid" data-form="user">
      <div class="field"><label>Name</label><input name="name" required /></div>
      <div class="field"><label>Email</label><input type="email" name="email" required /></div>
      <div class="field"><label>Permission</label><select name="role">
        <option value="viewer">Viewer</option>
        <option value="editor">Editor</option>
        <option value="admin">Admin</option>
      </select></div>
      <button class="primary-button">Add User</button>
    </form>
  `);
}

function userSwitcher() {
  openModal("Switch Active User", `
    <div class="form-grid">
      ${state.users.map((user) => `<button class="secondary-button" data-action="switch-user" data-id="${user.id}">${escapeHtml(user.name)} — ${escapeHtml(user.role)}</button>`).join("")}
    </div>
  `);
}

function handleFormSubmit(event) {
  const form = event.target.closest("form");
  if (!form) return;
  event.preventDefault();
  const data = Object.fromEntries(new FormData(form).entries());

  if (form.dataset.form === "project") {
    if (data.id) {
      const project = state.projects.find((item) => item.id === data.id);
      Object.assign(project, { title: data.title, description: data.description, deadline: data.deadline });
      logActivity(`updated Project: ${data.title}`);
    } else {
      state.projects.unshift({ id: crypto.randomUUID(), title: data.title, description: data.description, created_by: state.currentUserId, created_at: new Date().toISOString(), deadline: data.deadline });
      logActivity(`created Project: ${data.title}`);
    }
  }

  if (form.dataset.form === "task") {
    if (data.id) {
      const task = state.tasks.find((item) => item.id === data.id);
      Object.assign(task, { title: data.title, description: data.description, due_date: data.due_date, status: data.status, assigned_to: data.assigned_to });
      if (task.status === "completed") task.progress_percent = 100;
      logActivity(`updated Task: ${data.title}`);
    } else {
      state.tasks.unshift({ id: crypto.randomUUID(), project_id: state.selectedProjectId, title: data.title, description: data.description, due_date: data.due_date, assigned_to: data.assigned_to, status: data.status, progress_percent: data.status === "completed" ? 100 : 0, created_at: new Date().toISOString() });
      logActivity(`created Task: ${data.title}`);
    }
  }

  if (form.dataset.form === "subtask") {
    state.subtasks.push({ id: crypto.randomUUID(), task_id: state.selectedTaskId, title: data.title, completed: false });
    syncTaskStatus(state.selectedTaskId);
    logActivity(`added Subtask: ${data.title}`);
  }

  if (form.dataset.form === "user") {
    state.users.push({ id: crypto.randomUUID(), name: data.name, email: data.email, role: data.role });
    logActivity(`invited ${data.name} as ${data.role}`);
  }

  closeModal();
  saveState();
  render();
}

function handleClick(event) {
  const button = event.target.closest("button, input[type='checkbox']");
  if (!button) return;
  const action = button.dataset.action;
  const view = button.dataset.view;
  const id = button.dataset.id;

  if (view) return setView(view);
  if (!action) return;

  if (["open-project-form", "open-task-form", "open-subtask-form", "open-user-form"].includes(action) && !canEdit()) return;
  if (["delete-project", "delete-task", "delete-subtask", "open-user-form"].includes(action) && !canAdmin()) return;

  if (action === "close-modal") closeModal();
  if (action === "open-user-switcher") userSwitcher();
  if (action === "open-project") setView("project", { selectedProjectId: id, selectedTaskId: null });
  if (action === "open-task") setView("task", { selectedTaskId: id });
  if (action === "open-project-form") projectForm(state.projects.find((item) => item.id === id));
  if (action === "open-task-form") taskForm(state.tasks.find((item) => item.id === id));
  if (action === "open-subtask-form") subtaskForm();
  if (action === "open-user-form") userForm();
  if (action === "switch-user") {
    state.currentUserId = id;
    logActivity(`switched active user to ${userById(id).name}`);
    closeModal();
    saveState();
    render();
  }
  if (action === "delete-project") {
    const project = state.projects.find((item) => item.id === id);
    if (confirm(`Delete ${project.title}?`)) {
      const taskIds = tasksForProject(id).map((task) => task.id);
      state.projects = state.projects.filter((item) => item.id !== id);
      state.tasks = state.tasks.filter((item) => item.project_id !== id);
      state.subtasks = state.subtasks.filter((item) => !taskIds.includes(item.task_id));
      logActivity(`deleted Project: ${project.title}`);
      setView("home", { selectedProjectId: null, selectedTaskId: null });
    }
  }
  if (action === "delete-task") {
    const task = state.tasks.find((item) => item.id === id);
    if (confirm(`Delete ${task.title}?`)) {
      state.tasks = state.tasks.filter((item) => item.id !== id);
      state.subtasks = state.subtasks.filter((item) => item.task_id !== id);
      logActivity(`deleted Task: ${task.title}`);
      setView("project", { selectedTaskId: null });
    }
  }
  if (action === "toggle-subtask") {
    const subtask = state.subtasks.find((item) => item.id === id);
    subtask.completed = button.checked;
    syncTaskStatus(subtask.task_id);
    logActivity(`${subtask.completed ? "completed" : "reopened"} Subtask: ${subtask.title}`);
    saveState();
    render();
  }
  if (action === "delete-subtask") {
    const subtask = state.subtasks.find((item) => item.id === id);
    state.subtasks = state.subtasks.filter((item) => item.id !== id);
    syncTaskStatus(subtask.task_id);
    logActivity(`deleted Subtask: ${subtask.title}`);
    saveState();
    render();
  }
}

function handleChange(event) {
  if (event.target.dataset.action !== "update-status") return;
  const task = state.tasks.find((item) => item.id === state.selectedTaskId);
  task.status = event.target.value;
  if (task.status === "completed") task.progress_percent = 100;
  if (task.status === "not started") task.progress_percent = 0;
  logActivity(`changed Task status: ${task.title} to ${task.status}`);
  saveState();
  render();
}

function render() {
  if (state.currentView === "project") return renderProjectDetail();
  if (state.currentView === "task") return renderTaskDetail();
  if (state.currentView === "workspace") return renderWorkspace();
  if (state.currentView === "activity") return renderActivity();
  if (state.currentView === "help") return renderHelp();
  return renderHome();
}

document.addEventListener("submit", handleFormSubmit);
document.addEventListener("click", handleClick);
document.addEventListener("change", handleChange);

saveState();
render();
