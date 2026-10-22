/*
 * QUICK CUSTOMIZATION
 * 1. Add future menu pages to NAV_ITEMS. Use paths relative to the project root.
 */
const HERO_IMAGE_URL = "https://cdn.discordapp.com/attachments/1560954800353452104/1560954967383216168/index.jpg?ex=6ad49819&is=6ad34699&hm=e1371fc3b809871c9bea20ed2324d8d48ca1ae98ca3ff7649d5e4c5595d9fe06&";

const NAV_ITEMS = [
  { label: "Home", href: "index.html", description: "Back to the homepage" },
  { label: "Register Project", href: "modules/register.html", description: "Add a carbon-credit project" },
  { label: "Search Project", href: "modules/search.html", description: "Search for carbon-credit project"}
  // Add more pages here, for example:
  // { label: "About", href: "modules/about.html", description: "Learn about the registry" },
];

(() => {
  const root = document.body.dataset.root ?? "";
  const menu = document.getElementById("site-menu");
  const toggle = document.querySelector(".menu-toggle");
  const backdrop = document.querySelector(".menu-backdrop");
  const linksContainer = document.getElementById("menu-links");

  if (linksContainer) {
    NAV_ITEMS.forEach((item) => {
      const link = document.createElement("a");
      link.className = "menu-link";
      link.href = `${root}${item.href}`;
      link.innerHTML = `<span>${escapeHtml(item.label)}</span><span aria-hidden="true">↗</span>`;
      if (item.description) link.setAttribute("aria-label", `${item.label}: ${item.description}`);
      linksContainer.appendChild(link);
    });
  }

  const setMenuOpen = (open) => {
    if (!menu || !toggle || !backdrop) return;
    menu.hidden = !open;
    backdrop.hidden = !open;
    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute("aria-label", open ? "Close navigation menu" : "Open navigation menu");
    document.body.classList.toggle("menu-open", open);
  };

  toggle?.addEventListener("click", () => {
    setMenuOpen(toggle.getAttribute("aria-expanded") !== "true");
  });
  backdrop?.addEventListener("click", () => setMenuOpen(false));
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") setMenuOpen(false);
  });

  const heroImage = document.getElementById("hero-image");
  if (heroImage) {
    heroImage.addEventListener("error", () => heroImage.classList.add("is-hidden"), { once: true });
    if (HERO_IMAGE_URL.trim()) heroImage.src = HERO_IMAGE_URL.trim();
  }

  const form = document.getElementById("project-form");
  if (form) setupProjectForm(form, root);
})();

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (character) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
  })[character]);
}

function setupProjectForm(form, root) {
  const message = document.getElementById("form-message");
  const submitButton = document.getElementById("submit-button");
  const fields = ["project_name", "latitude", "longitude", "owner_name", "carbon_credits"];

  const showMessage = (text, kind) => {
    message.textContent = text;
    message.className = `form-message ${kind}`;
  };

  form.querySelectorAll("input").forEach((input) => {
    input.addEventListener("input", () => input.removeAttribute("aria-invalid"));
  });

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    message.textContent = "";
    message.className = "form-message";

    let firstInvalid = null;
    for (const input of form.querySelectorAll("input[required]")) {
      const value = input.value.trim();
      let invalid = value === "";
      if (!invalid && input.type === "number") {
        const number = Number(value);
        invalid = !Number.isFinite(number) || (input.min !== "" && number < Number(input.min)) || (input.max !== "" && number > Number(input.max));
      }
      if (invalid) {
        input.setAttribute("aria-invalid", "true");
        firstInvalid ??= input;
      }
    }
    if (firstInvalid) {
      showMessage("Please check the required fields and enter valid coordinates and a positive credit amount.", "error");
      firstInvalid.focus();
      return;
    }

    const data = {};
    for (const key of fields) {
      const input = form.elements.namedItem(key);
      if (!input) continue;
      data[key] = key === "latitude" || key === "longitude" || key === "carbon_credits"
        ? (input.value.trim() === "" ? null : Number(input.value))
        : input.value.trim();
    }

    submitButton.disabled = true;
    submitButton.firstChild.textContent = "Submitting… ";
    try {
      const response = await fetch(`${root}api/projects`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.error || "The project could not be saved. Please try again.");
      showMessage(`Project submitted successfully. Reference: ${result.id}`, "success");
      form.reset();
      form.querySelectorAll("[aria-invalid]").forEach((input) => input.removeAttribute("aria-invalid"));
    } catch (error) {
      const detail = error instanceof Error ? error.message : "An unexpected error occurred.";
      showMessage(`${detail} Make sure you started the website with python api/server.py.`, "error");
    } finally {
      submitButton.disabled = false;
      submitButton.firstChild.textContent = "Submit project ";
    }
  });
}
