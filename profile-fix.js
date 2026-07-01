// Defensive modal/profile click handling for v0.1.
// This keeps the profile/user switcher from feeling frozen if backdrop clicks
// or nested modal clicks are missed by the original app event handler.
(function () {
  function closeTopModal() {
    const modal = document.querySelector(".modal-backdrop");
    if (modal) modal.remove();
  }

  document.addEventListener(
    "click",
    function (event) {
      const actionTarget = event.target.closest("[data-action]");
      if (!actionTarget) return;

      const action = actionTarget.dataset.action;

      if (action === "close-modal") {
        event.preventDefault();
        event.stopPropagation();
        closeTopModal();
        return;
      }

      if (action === "open-user-switcher") {
        const existingModal = document.querySelector(".modal-backdrop");
        if (existingModal) existingModal.remove();
      }
    },
    true
  );

  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape") closeTopModal();
  });
})();
