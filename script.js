let selectedCategory = "ALL";
let selectedWorkingAs = "ALL";


const archiveGrid =
  document.getElementById("archive-grid");

const insightCount =
  document.getElementById("insight-count");

const featuredInsight =
  document.getElementById("featured-insight");

const anotherButton =
  document.getElementById("another-button");

const categoryFilters =
  document.getElementById("category-filters");

const workingFilters =
  document.getElementById("working-filters");

const categoryFilterArea =
  document.getElementById("category-filter-area");

const workingFilterArea =
  document.getElementById("working-filter-area");


// -----------------------------------------
// GET AVAILABLE FILTERS
// -----------------------------------------

function getAvailableCategories() {

  return [
    ...new Set(
      insights
        .map(insight => insight.category)
        .filter(Boolean)
    )
  ];

}


function getAvailableWorkingAs() {

  return [
    ...new Set(
      insights
        .map(insight => insight.workingAs)
        .filter(Boolean)
    )
  ];

}


// -----------------------------------------
// CREATE CATEGORY FILTERS
// -----------------------------------------

function createCategoryFilters() {

  const categories =
    getAvailableCategories();

  categoryFilters.innerHTML = "";

  const allButton =
    document.createElement("button");

  allButton.className =
    "filter active";

  allButton.textContent =
    "All";

  allButton.dataset.category =
    "ALL";

  categoryFilters.appendChild(
    allButton
  );


  categories.forEach(category => {

    const button =
      document.createElement("button");

    button.className =
      "filter";

    button.textContent =
      category;

    button.dataset.category =
      category;

    categoryFilters.appendChild(
      button
    );

  });


  categoryFilters
    .querySelectorAll(".filter")
    .forEach(button => {

      button.addEventListener(
        "click",
        () => {

          categoryFilters
            .querySelectorAll(".filter")
            .forEach(item =>
              item.classList.remove("active")
            );

          button.classList.add("active");

          selectedCategory =
            button.dataset.category;

          displayArchive();

          showRandomInsight();

        }
      );

    });

}


// -----------------------------------------
// CREATE WORKING-AS FILTERS
// -----------------------------------------

function createWorkingFilters() {

  const workingTypes =
    getAvailableWorkingAs();

  workingFilters.innerHTML = "";

  const allButton =
    document.createElement("button");

  allButton.className =
    "filter active";

  allButton.textContent =
    "Everyone";

  allButton.dataset.workingAs =
    "ALL";

  workingFilters.appendChild(
    allButton
  );


  workingTypes.forEach(type => {

    const button =
      document.createElement("button");

    button.className =
      "filter";

    button.textContent =
      type;

    button.dataset.workingAs =
      type;

    workingFilters.appendChild(
      button
    );

  });


  workingFilters
    .querySelectorAll(".filter")
    .forEach(button => {

      button.addEventListener(
        "click",
        () => {

          workingFilters
            .querySelectorAll(".filter")
            .forEach(item =>
              item.classList.remove("active")
            );

          button.classList.add("active");

          selectedWorkingAs =
            button.dataset.workingAs;

          displayArchive();

          showRandomInsight();

        }
      );

    });

}


// -----------------------------------------
// FILTER DATA
// -----------------------------------------

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


// -----------------------------------------
// DISPLAY ARCHIVE
// -----------------------------------------

function displayArchive() {

  const filteredInsights =
    getFilteredInsights();

  archiveGrid.innerHTML = "";

  insightCount.textContent =
    filteredInsights.length;


  if (filteredInsights.length === 0) {

    archiveGrid.innerHTML = `
      <div class="empty-state">
        Nothing here yet.
      </div>
    `;

    return;

  }


  filteredInsights.forEach(
    (insight, index) => {

      const card =
        document.createElement("article");

      card.className =
        "insight-card";

      card.innerHTML = `

        <div class="card-number">
          ${String(index + 1).padStart(3, "0")}
        </div>

        <div class="card-advice">
          “${insight.advice}”
        </div>

        <div class="card-footer">

          <div class="card-role">
            ${insight.role}
          </div>

          <div class="card-experience">
            ${insight.workingAs} ·
            ${insight.experience} in practice
          </div>

          <div class="card-category">
            ${insight.category}
          </div>

        </div>

      `;

      archiveGrid.appendChild(card);

    }
  );

}


// -----------------------------------------
// RANDOM FEATURED INSIGHT
// -----------------------------------------

function showRandomInsight() {

  const availableInsights =
    getFilteredInsights();


  if (availableInsights.length === 0) {

    featuredInsight.innerHTML = `

      <p class="quote">
        Nothing here yet.
      </p>

      <p class="meta">
        Try another combination.
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
    </p>

    <p class="featured-category">
      ${insight.category}
    </p>

  `;

}


// -----------------------------------------
// INITIALISE
// -----------------------------------------

createCategoryFilters();

createWorkingFilters();

displayArchive();

showRandomInsight();
