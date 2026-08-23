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


// =========================================
// GET FILTERED INSIGHTS
// =========================================

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


// =========================================
// CREATE FILTER BUTTONS
// =========================================

function createFilters() {

  categoryFilters.innerHTML = "";
  workingFilters.innerHTML = "";


  // -----------------------------------------
  // CATEGORIES
  // -----------------------------------------

  const categories = [
    ...new Set(
      insights
        .map(insight => insight.category)
        .filter(Boolean)
    )
  ];


  createFilterButton(
    categoryFilters,
    "ALL",
    "ALL",
    "filter"
  );


  categories.forEach(category => {

    createFilterButton(
      categoryFilters,
      category,
      category,
      "filter"
    );

  });


  // -----------------------------------------
  // WORKING AS
  // -----------------------------------------

  const workingTypes = [
    ...new Set(
      insights
        .map(insight => insight.workingAs)
        .filter(Boolean)
    )
  ];


  createFilterButton(
    workingFilters,
    "ALL",
    "EVERYONE",
    "working-filter"
  );


  workingTypes.forEach(type => {

    let label = type;


    if (type === "Freelance / Independent") {
      label = "INDEPENDENT";
    }

    if (type === "Founder / Own studio") {
      label = "FOUNDER / STUDIO";
    }

    if (type === "Academic / Research") {
      label = "ACADEMIC / RESEARCH";
    }


    createFilterButton(
      workingFilters,
      type,
      label,
      "working-filter"
    );

  });

}


// =========================================
// CREATE INDIVIDUAL FILTER
// =========================================

function createFilterButton(
  container,
  value,
  label,
  className
) {

  const button =
    document.createElement("button");

  button.className =
    `filter ${className}`;

  button.textContent =
    label;

  if (value === "ALL") {
    button.classList.add("active");
  }


  if (className === "filter") {

    button.addEventListener(
      "click",
      () => {

        document
          .querySelectorAll(".filter")
          .forEach(button => {
            button.classList.remove("active");
          });

        button.classList.add("active");

        selectedCategory = value;

        displayArchive();
        showRandomInsight();

      }
    );

  }


  if (className === "working-filter") {

    button.addEventListener(
      "click",
      () => {

        document
          .querySelectorAll(".working-filter")
          .forEach(button => {
            button.classList.remove("active");
          });

        button.classList.add("active");

        selectedWorkingAs = value;

        displayArchive();
        showRandomInsight();

      }
    );

  }


  container.appendChild(button);

}


// =========================================
// DISPLAY ARCHIVE
// =========================================

function displayArchive() {

  const filteredInsights =
    getFilteredInsights();


  archiveGrid.innerHTML = "";


  insightCount.textContent =
    filteredInsights.length;


  filteredInsights.forEach(
    (insight, index) => {

      const card =
        document.createElement("article");


      card.className =
        "insight-card";


      let salaryHTML = "";


      if (
        insight.salary &&
        insight.salary.trim() !== ""
      ) {

        salaryHTML = `
          <div class="card-salary">
            Salary: ${insight.salary}
          </div>
        `;

      }


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
            ${insight.workingAs}
            ·
            ${insight.experience}
            in practice
          </div>


          ${salaryHTML}


          <div class="card-category">
            ${insight.category}
          </div>

        </div>

      `;


      archiveGrid.appendChild(card);

    }
  );

}


// =========================================
// RANDOM FEATURED INSIGHT
// =========================================

function showRandomInsight() {

  const availableInsights =
    getFilteredInsights();


  if (
    availableInsights.length === 0
  ) {

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
      ${insight.experience}
      in practice
    </p>


    <p class="featured-category">
      ${insight.category}
    </p>

  `;

}


// =========================================
// ANOTHER BUTTON
// =========================================

anotherButton.addEventListener(
  "click",
  showRandomInsight
);


// =========================================
// INITIALISE
// =========================================

createFilters();

displayArchive();

showRandomInsight();
