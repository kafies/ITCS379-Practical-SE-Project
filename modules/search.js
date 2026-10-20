/*
 * EXAMPLE DATA FOR PROJECT, please make the api connect to the db and query these datas properly.
 */
const PROJECTS = [
  {
    name: "Coastal Mangrove Restoration (Example)",
    owner: "Example Conservation Group",
    latitude: 12.5597,
    longitude: 100.9354,
    carbonCredits: 12500,
    description: "Example coastal restoration project used to preview the registry search experience."
  },
  {
    name: "Community Solar Demonstration (Example)",
    owner: "Sample Renewable Cooperative",
    latitude: 13.7563,
    longitude: 100.5018,
    carbonCredits: 4800,
    description: "Example renewable-energy entry. This record is sample data, not a verified project."
  },
  {
    name: "Forest Recovery Pilot (Example)",
    owner: "Demo Forest Partnership",
    latitude: 18.7883,
    longitude: 98.9853,
    carbonCredits: 9000,
    description: "Example forest recovery entry for testing text and coordinate searches."
  },
  {
    name: "Regenerative Agriculture Trial (Example)",
    owner: "Placeholder Soil Initiative",
    latitude: 14.9799,
    longitude: 102.0977,
    carbonCredits: 2100,
    description: "Example agriculture entry for testing the project cards and live filtering."
  }
];

(() => {
  const searchInput = document.getElementById("project-search");
  const clearButton = document.getElementById("clear-search");
  const resetButton = document.getElementById("reset-search");
  const grid = document.getElementById("project-grid");
  const summary = document.getElementById("results-summary");
  const noResults = document.getElementById("no-results");

  if (!searchInput || !grid || !summary || !noResults) return;

  const numberFormat = new Intl.NumberFormat(undefined, { maximumFractionDigits: 6 });
  const creditFormat = new Intl.NumberFormat(undefined, { maximumFractionDigits: 3 });

  function createElement(tagName, className, text) {
    const element = document.createElement(tagName);
    if (className) element.className = className;
    if (text !== undefined) element.textContent = text;
    return element;
  }

  function projectMatches(project, query) {
    if (!query) return true;
    const searchableText = [
      project.name,
      project.owner,
      project.latitude,
      project.longitude,
      `${project.latitude}, ${project.longitude}`,
      `${project.latitude} ${project.longitude}`,
      project.carbonCredits,
      project.description
    ].join(" ").toLocaleLowerCase();
    return searchableText.includes(query);
  }

  function makeProjectCard(project, index) {
    const article = createElement("article", "project-card");
    const top = createElement("div", "project-card-top");
    top.append(
      createElement("span", "project-number", String(index + 1).padStart(2, "0")),
      createElement("span", "project-tag", "EXAMPLE")
    );

    const title = createElement("h2", "project-card-title", project.name);
    const description = createElement("p", "project-card-description", project.description);
    const ownerLabel = createElement("p", "project-meta-label", "CREDIT OWNER");
    const owner = createElement("p", "project-owner", project.owner);
    const divider = createElement("div", "project-card-divider");
    const stats = createElement("div", "project-stats");

    const location = createElement("div", "project-stat");
    location.append(
      createElement("span", "project-meta-label", "COORDINATES"),
      createElement("span", "project-stat-value", `${numberFormat.format(project.latitude)}, ${numberFormat.format(project.longitude)}`)
    );

    const credits = createElement("div", "project-stat");
    credits.append(
      createElement("span", "project-meta-label", "CARBON CREDITS"),
      createElement("span", "project-credit-value", creditFormat.format(project.carbonCredits))
    );

    stats.append(location, credits);
    article.append(top, title, description, ownerLabel, owner, divider, stats);
    return article;
  }

  function renderProjects() {
    const query = searchInput.value.trim().toLocaleLowerCase();
    const filtered = PROJECTS.filter((project) => projectMatches(project, query));
    grid.replaceChildren();
    filtered.forEach((project, index) => grid.appendChild(makeProjectCard(project, index)));

    const count = filtered.length;
    summary.textContent = query
      ? `${count} ${count === 1 ? "project" : "projects"} found for “${searchInput.value.trim()}”`
      : `${count} example ${count === 1 ? "project" : "projects"} listed`;
    noResults.hidden = count !== 0;
    grid.hidden = count === 0;
    clearButton.hidden = searchInput.value.length === 0;
    grid.setAttribute("aria-busy", "false");
  }

  searchInput.addEventListener("input", renderProjects);
  clearButton.addEventListener("click", () => {
    searchInput.value = "";
    renderProjects();
    searchInput.focus();
  });
  resetButton?.addEventListener("click", () => {
    searchInput.value = "";
    renderProjects();
    searchInput.focus();
  });

  renderProjects();
})();
