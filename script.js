let selectedCategory = "ALL";
let selectedWorkingAs = "ALL";

const archiveGrid = document.getElementById("archive-grid");
const insightCount = document.getElementById("insight-count");
const featuredInsight = document.getElementById("featured-insight");
const anotherButton = document.getElementById("another-button");


// -----------------------------------------
// FILTER ARCHIVE
// -----------------------------------------

function getFilteredInsights() {

  return insights.filter(insight => {

    const categoryMatches =
      selectedCategory === "ALL" ||
      insight.category === selectedCategory;

    const workingAsMatches =
      selectedWorkingAs === "ALL" ||
      insight.workingAs === selectedWorkingAs;

    return categoryMatches && workingAsMatches;

  });

}


// -----------------------------------------
// DISPLAY ARCHIVE
// -----------------------------------------

function displayArchive() {

  const filteredInsights = getFilteredInsights();

  archiveGrid.innerHTML = "";

  insightCount.textContent = filteredInsights.length;

  filteredInsights.forEach((insight, index) => {

    const card = document.createElement("article");

    card.className = "insight-card";

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
          ${insight.workingAs} · ${insight.experience} in practice
        </div>

        <div class="card-category">
          ${insight.category}
        </div>

      </div>

    `;

    archiveGrid.appendChild(card);

  });

}


// -----------------------------------------
// RANDOM FEATURED INSIGHT
// -----------------------------------------

function showRandomInsight() {

  const availableInsights = getFilteredInsights();

  if (availableInsights.length === 0) {

    featuredInsight.innerHTML = `
      <p class="quote">
        No insights found for this combination yet.
      </p>

      <p class="meta">
        Try another filter.
      </p>
    `;

    return;
  }

  const randomIndex = Math.floor(
    Math.random() * availableInsights.length
  );

  const insight = availableInsights[randomIndex];

  featuredInsight.innerHTML = `

    <p class="quote">
      “${insight.advice}”
    </p>

    <p class="meta">
  ${insight.role} · ${insight.workingAs} · ${insight.experience} in practice
  </p>

  <p class="featured-category">
  ${insight.category}
  </p>

  `;

}


anotherButton.addEventListener(
  "click",
  showRandomInsight
);


// -----------------------------------------
// TOPIC FILTERS
// -----------------------------------------

// -----------------------------------------
// TOPIC FILTERS
// -----------------------------------------

const categoryFilters =
  document.querySelectorAll(".filter");

categoryFilters.forEach(filter => {

  filter.addEventListener("click", () => {

    categoryFilters.forEach(button => {
      button.classList.remove("active");
    });

    filter.classList.add("active");

    selectedCategory =
      filter.dataset.category;

    displayArchive();

    showRandomInsight();

  });

});


// -----------------------------------------
// WORKING AS FILTERS
// -----------------------------------------

const workingFilters =
  document.querySelectorAll(".working-filter");

workingFilters.forEach(filter => {

  filter.addEventListener("click", () => {

    workingFilters.forEach(button => {
      button.classList.remove("active");
    });

    filter.classList.add("active");

    selectedWorkingAs =
      filter.dataset.workingAs;

    displayArchive();

    showRandomInsight();

  });

});


// -----------------------------------------
// INITIALISE
// -----------------------------------------

displayArchive();

showRandomInsight();


// -----------------------------------------
// INITIALISE
// -----------------------------------------

displayArchive();

showRandomInsight();
