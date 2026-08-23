```javascript
let selectedCategory = "ALL";
let selectedWorkingAs = "ALL";


const archiveGrid =
  document.getElementById("archive-grid");

const insightCount =
  document.getElementById("insight-count");

const introCount =
  document.getElementById("intro-count");

const featuredInsight =
  document.getElementById("featured-insight");

const anotherButton =
  document.getElementById("another-button");

const categoryFilters =
  document.getElementById("category-filters");

const workingFilters =
  document.getElementById("working-filters");

const workingFilterArea =
  document.getElementById("working-filter-area");

const clearFilters =
  document.getElementById("clear-filters");


/* -----------------------------------------
   AVAILABLE CATEGORIES
----------------------------------------- */

function getAvailableCategories() {

  return [
    ...new Set(
      insights
        .map(insight => insight.category)
        .filter(Boolean)
    )
  ];

}


/* -----------------------------------------
   AVAILABLE WORKING TYPES
----------------------------------------- */

function getAvailableWorkingTypes() {

  return [
    ...new Set(
      insights
        .map(insight => insight.workingAs)
        .filter(Boolean)
    )
  ];

}


/* -----------------------------------------
   CREATE CATEGORY FILTERS
----------------------------------------- */

function createCategoryFilters() {

  const categories =
    getAvailableCategories();

  categoryFilters.innerHTML = "";


  createFilterButton(
    categoryFilters,
    "All",
    "ALL",
    "category"
  );


  categories.forEach(category => {

    createFilterButton(
      categoryFilters,
      category,
      category,
      "category"
    );

  });

}


/* -----------------------------------------
   CREATE WORKING FILTERS
----------------------------------------- */

function createWorkingFilters() {

  const workingTypes =
    getAvailableWorkingTypes();


  if (workingTypes.length === 0) {

    workingFilterArea.classList.add("hidden");

    return;

  }


  workingFilterArea.classList.remove("hidden");

  workingFilters.innerHTML = "";


  createFilterButton(
    workingFilters,
    "Everyone",
    "ALL",
    "working"
  );


  workingTypes.forEach(type => {

    createFilterButton(
      workingFilters,
      type,
      type,
      "working"
    );

  });

}


/* -----------------------------------------
   CREATE FILTER BUTTON
----------------------------------------- */

function createFilterButton(
  container,
  label,
  value,
  type
) {

  const button =
    document.createElement("button");

  button.className = "filter";


  if (
    (type === "category" &&
      value === selectedCategory) ||
    (type === "working" &&
      value === selectedWorkingAs)
  ) {

    button.classList.add("active");

  }


  button.textContent = label;


  button.addEventListener(
    "click",
    () => {

      if (type === "category") {

        selectedCategory = value;

        categoryFilters
          .querySelectorAll(".filter")
          .forEach(filter =>
            filter.classList.remove("active")
          );

        button.classList.add("active");

      }


      if (type === "working") {

        selectedWorkingAs = value;

        workingFilters
          .querySelectorAll(".filter")
          .forEach(filter =>
            filter.classList.remove("active")
          );

        button.classList.add("active");

      }


      displayArchive();

      showRandomInsight();

    }
  );


  container.appendChild(button);

}


/* -----------------------------------------
   FILTER INSIGHTS
----------------------------------------- */

function getFilteredInsights() {

  return insights.filter(insight => {

    const categoryMatches =
      selectedCategory === "ALL" ||
      insight.category === selectedCategory;


    const workingMatches =
      selectedWorkingAs === "ALL" ||
      insight.workingAs === selectedWorkingAs;


    return (
      categoryMatches &&
      workingMatches
    );

  });

}


/* -----------------------------------------
   DISPLAY ARCHIVE
----------------------------------------- */

function displayArchive() {

  const filteredInsights =
    getFilteredInsights();


  archiveGrid.innerHTML = "";


  insightCount.textContent =
    filteredInsights.length;


  introCount.textContent =
    insights.length;


  if (filteredInsights.length === 0) {

    archiveGrid.innerHTML = `

      <div class="empty-state">
        Nothing here yet.
      </div>

    `;

    return;

  }


  filteredInsights.forEach(insight => {

    const card =
      document.createElement("article");


    card.className =
      "insight-card";


    const salaryHTML =
      insight.salary
        ? `
          <div class="card-salary">
            ${insight.salary}
          </div>
        `
        : "";


    card.innerHTML = `

      <div class="card-number">
        ${insight.id}
      </div>


      <div class="card-advice">
        “${insight.advice}”
      </div>


      <div class="card-footer">

        <div class="card-role">
          ${insight.role}
        </div>


        <div class="card-experience">
          ${insight.workingAs}
          ·
          ${insight.experience} in practice
        </div>


        ${salaryHTML}


        <div class="card-category">
          ${insight.category}
        </div>

      </div>

    `;


    archiveGrid.appendChild(card);

  });

}


/* -----------------------------------------
   FEATURED INSIGHT
----------------------------------------- */

function showRandomInsight() {

  const availableInsights =
    getFilteredInsights();


  if (availableInsights.length === 0) {

    featuredInsight.innerHTML = `

      <p class="quote">
        Nothing here yet.
      </p>

      <p class="meta">
        Try another filter.
      </p>

    `;

    return;

  }


  const randomIndex =
    Math.floor(
      Math.random() *
      availableInsights.length
    );


  const insight =
    availableInsights[randomIndex];


  featuredInsight.innerHTML = `

    <p class="quote">
      “${insight.advice}”
    </p>


    <p class="meta">
      ${insight.role}
      ·
      ${insight.workingAs}
      ·
      ${insight.experience} in practice

      ${
        insight.salary
          ? ` · ${insight.salary}`
          : ""
      }
    </p>


    <div class="featured-category">
      ${insight.category}
    </div>

  `;

}


/* -----------------------------------------
   CLEAR FILTERS
----------------------------------------- */

clearFilters.addEventListener(
  "click",
  () => {

    selectedCategory = "ALL";

    selectedWorkingAs = "ALL";

    createCategoryFilters();

    createWorkingFilters();

    displayArchive();

    showRandomInsight();

  }
);


/* -----------------------------------------
   ANOTHER BUTTON
----------------------------------------- */

anotherButton.addEventListener(
  "click",
  showRandomInsight
);


/* -----------------------------------------
   INITIALISE
----------------------------------------- */

createCategoryFilters();

createWorkingFilters();

displayArchive();

showRandomInsight();
```
