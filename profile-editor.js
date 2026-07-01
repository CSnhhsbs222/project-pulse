// Local profile editor extension for Project Pulse v0.1.
// This keeps the change small by extending the existing user-switcher entry point.
(function () {
  function fileToDataUrl(file) {
    return new Promise((resolve) => {
      if (!file) return resolve(null);
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.readAsDataURL(file);
    });
  }

  function profilePhotoPreview(user) {
    if (user.photo) {
      return `<img class="avatar" src="${user.photo}" alt="${escapeHtml(user.name || "Profile")}" />`;
    }

    return escapeHtml((user.name || "?").slice(0, 1).toUpperCase());
  }

  function ensureProfileFields(user) {
    user.username = user.username || (user.name || "user").toLowerCase().replace(/[^a-z0-9]+/g, "").slice(0, 20);
    user.password = user.password || "";
    user.photo = user.photo || "";
    return user;
  }

  window.openLocalProfileEditor = function () {
    const user = ensureProfileFields(currentUser());

    openModal("Profile", `
      <form class="form-grid" data-form="profile-editor">
        <div class="card-row">
          <div class="profile-photo-preview">${profilePhotoPreview(user)}</div>
          <p class="card-copy">This profile is local to this browser for now. Real login comes later.</p>
        </div>

        <div class="field">
          <label>Profile photo</label>
          <input type="file" name="photo" accept="image/*" />
        </div>

        <div class="field">
          <label>Name</label>
          <input name="name" required value="${escapeHtml(user.name || "")}" />
        </div>

        <div class="field">
          <label>Email</label>
          <input type="email" name="email" required value="${escapeHtml(user.email || "")}" />
        </div>

        <div class="field">
          <label>Username</label>
          <input name="username" required value="${escapeHtml(user.username || "")}" />
        </div>

        <div class="field">
          <label>Password placeholder</label>
          <input type="password" name="password" value="${escapeHtml(user.password || "")}" />
        </div>

        <p class="card-copy">Password is not secure yet because this version does not have real authentication. Treat it as a placeholder only.</p>
        <button class="primary-button">Save Profile</button>
      </form>
    `);
  };

  if (typeof userSwitcher === "function") {
    userSwitcher = window.openLocalProfileEditor;
  }

  document.addEventListener(
    "submit",
    async function (event) {
      const form = event.target.closest('form[data-form="profile-editor"]');
      if (!form) return;

      event.preventDefault();
      event.stopImmediatePropagation();

      const formData = new FormData(form);
      const user = ensureProfileFields(currentUser());
      const photo = await fileToDataUrl(form.elements.photo.files[0]);

      user.name = formData.get("name").trim();
      user.email = formData.get("email").trim();
      user.username = formData.get("username").trim();
      user.password = formData.get("password");
      if (photo) user.photo = photo;

      logActivity("updated their profile");
      closeModal();
      saveState();
      render();
    },
    true
  );
})();
