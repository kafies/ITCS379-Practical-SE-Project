/*
 * EXAMPLE DATA FOR PROJECT, please make the api connect to the db and query these datas properly.
 */
let PROJECTS = [];

(() => {
  const root = document.body.dataset.root || "../";
  const API_URL = `${root}api/projects`;
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
      createElement("span", "project-tag", "REGISTERED")
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


  async function loadProjects() {
    grid.setAttribute("aria-busy", "true");
    summary.textContent = "Loading projects...";

    try {
      const response = await fetch(API_URL);
      const responseText = await response.text();

      console.log("API URL:", API_URL);
      console.log("HTTP status:", response.status);
      console.log("API response:", responseText);

      if (!response.ok) {
        throw new Error(
          `API returned HTTP ${response.status}: ${responseText}`
        );
      }

      const data = JSON.parse(responseText);

      const projects = Array.isArray(data) ? data : data.projects;

      if (!Array.isArray(projects)) {
        throw new Error("API response does not contain a projects array.");
      }

      PROJECTS = projects.map((row) => ({
        name: row.project_name ?? row.name ?? "Untitled project",
        owner: row.owner_name ?? row.owner ?? "Not provided",
        latitude: Number(row.latitude),
        longitude: Number(row.longitude),
        carbonCredits: Number(row.carbon_credits ?? row.carbonCredits ?? 0),
        description: row.description ?? ""
      }));

      renderProjects();
    } catch (error) {
      console.error("Failed to load projects:", error);
      grid.replaceChildren();
      grid.hidden = true;
      noResults.hidden = false;
      noResults.textContent =
        "Unable to load projects. Check the server and database connection.";
      summary.textContent = "Failed to load projects.";
      grid.setAttribute("aria-busy", "false");
    }
  }

  function renderProjects() {
    const query = searchInput.value.trim().toLocaleLowerCase();

    const filtered = PROJECTS.filter((project) =>
      projectMatches(project, query)
    );

    grid.replaceChildren();

    filtered.forEach((project, index) => {
      grid.appendChild(makeProjectCard(project, index));
    });

    const count = filtered.length;

    summary.textContent = query
      ? `${count} ${count === 1 ? "project" : "projects"} found for “${searchInput.value.trim()}”`
      : `${count} registered ${count === 1 ? "project" : "projects"} listed`;

    noResults.hidden = count !== 0;
    grid.hidden = count === 0;
    clearButton.hidden = searchInput.value.length === 0;
    grid.setAttribute("aria-busy", "false");
  }

  searchInput.addEventListener("input", renderProjects);

  clearButton?.addEventListener("click", () => {
    searchInput.value = "";
    renderProjects();
    searchInput.focus();
  });

  resetButton?.addEventListener("click", () => {
    searchInput.value = "";
    renderProjects();
    searchInput.focus();
  });

  void loadProjects();

})();
