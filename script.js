const DATA_URL =
  "https://script.google.com/macros/s/AKfycbxfHNB1tTeQVdKz5e3aZZrM1cCAIk9lKNYygpDoPFPPP4OnbuRQ7oL410Mv9SeZd-hUHg/exec";


let insights = [];

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
   LOAD DATA
----------------------------------------- */

async function loadInsights() {

  try {

    const callbackName =
      "archiveCallback_" + Date.now();


    const script =
      document.createElement("script");


    window[callbackName] =
      function(data) {

        delete window[callbackName];

        script.remove();


        if (!Array.isArray(data)) {

          throw new Error(
            "Archive data is not an array."
          );

        }


        insights = data;


        console.log(
          "Archive loaded:",
          insights
        );


        initialiseArchive();

      };


    script.src =
      DATA_URL +
      "?callback=" +
      callbackName +
      "&t=" +
      Date.now();


    script.onerror =
      function() {

        delete window[callbackName];

        script.remove();


        throw new Error(
          "Could not load archive data."
        );

      };


    document.body.appendChild(script);


  } catch (error) {

    console.error(
      "Archive loading error:",
      error
    );


    if (archiveGrid) {

      archiveGrid.innerHTML = `

        <div class="empty-state">
          The archive is temporarily unavailable.
        </div>

      `;

    }


    if (insightCount) {
      insightCount.textContent = "0";
    }


    if (introCount) {
      introCount.textContent = "0";
    }

  }

}



/* -----------------------------------------
   NORMALISE WORKING TYPE
----------------------------------------- */

/*
   This changes how working types are displayed.

   Freelance / Independent
   →
   Independent / Founder

   Everything else stays as it is.
*/

function normaliseWorkingType(value) {

  if (!value) {
    return "";
  }


  const cleaned =
    String(value).trim();


  const lower =
    cleaned.toLowerCase();


  if (
    lower === "freelance / independent" ||
    lower === "freelance/independent" ||
    lower === "independent / freelance" ||
    lower === "independent/freelance"
  ) {

    return "Independent / Founder";

  }


  return cleaned;

}



/* -----------------------------------------
   SPLIT CATEGORIES
----------------------------------------- */

/*
   A contribution can belong to more than
   one category.

   Examples:

   "Clients, Money"
   →
   ["Clients", "Money"]

   "Clients / Money"
   →
   ["Clients", "Money"]

   "Clients & Money"
   →
   ["Clients", "Money"]

   "Clients"
   →
   ["Clients"]
*/

function getCategories(insight) {

  if (!insight || !insight.category) {
    return [];
  }


  return String(insight.category)

    .split(/\s*(?:,|\/|&|\+|\band\b)\s*/i)

    .map(category =>
      category.trim()
    )

    .filter(Boolean);

}



/* -----------------------------------------
   DISPLAY CATEGORY
----------------------------------------- */

function getPrimaryCategory(insight) {

  const categories =
    getCategories(insight);


  return categories.length
    ? categories[0]
    : "";

}



/* -----------------------------------------
   AVAILABLE CATEGORIES
----------------------------------------- */

function getAvailableCategories() {

  const categories = [];


  insights.forEach(insight => {

    getCategories(insight)
      .forEach(category => {

        if (
          !categories.includes(category)
        ) {

          categories.push(category);

        }

      });

  });


  return categories;

}



/* -----------------------------------------
   AVAILABLE WORKING TYPES
----------------------------------------- */

function getAvailableWorkingTypes() {

  const workingTypes = [];


  insights.forEach(insight => {

    const workingType =
      normaliseWorkingType(
        insight.workingAs
      );


    if (
      workingType &&
      !workingTypes.includes(workingType)
    ) {

      workingTypes.push(
        workingType
      );

    }

  });


  return workingTypes;

}



/* -----------------------------------------
   CREATE CATEGORY FILTERS
----------------------------------------- */

function createCategoryFilters() {

  if (!categoryFilters) {
    return;
  }


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

  if (
    !workingFilters ||
    !workingFilterArea
  ) {

    return;

  }


  const workingTypes =
    getAvailableWorkingTypes();


  if (workingTypes.length === 0) {

    workingFilterArea.classList.add(
      "hidden"
    );

    return;

  }


  workingFilterArea.classList.remove(
    "hidden"
  );


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


  button.className =
    "filter";


  if (
    (type === "category" &&
      value === selectedCategory) ||

    (type === "working" &&
      value === selectedWorkingAs)
  ) {

    button.classList.add("active");

  }


  button.textContent =
    label;


  button.addEventListener(
    "click",
    () => {

      if (type === "category") {

        selectedCategory =
          value;


        if (categoryFilters) {

          categoryFilters
            .querySelectorAll(".filter")
            .forEach(button =>
              button.classList.remove(
                "active"
              )
            );

        }


        button.classList.add(
          "active"
        );

      }


      if (type === "working") {

        selectedWorkingAs =
          value;


        if (workingFilters) {

          workingFilters
            .querySelectorAll(".filter")
            .forEach(button =>
              button.classList.remove(
                "active"
              )
            );

        }


        button.classList.add(
          "active"
        );

      }


      displayArchive();

      showRandomInsight();

    }
  );


  container.appendChild(button);

}



/* -----------------------------------------
   CHECK CATEGORY
----------------------------------------- */

function insightHasCategory(
  insight,
  selectedCategory
) {

  if (
    selectedCategory === "ALL"
  ) {

    return true;

  }


  const categories =
    getCategories(insight);


  return categories.some(
    category =>
      category.toLowerCase() ===
      selectedCategory.toLowerCase()
  );

}



/* -----------------------------------------
   FILTER INSIGHTS
----------------------------------------- */

function getFilteredInsights() {

  return insights.filter(insight => {

    const categoryMatches =
      insightHasCategory(
        insight,
        selectedCategory
      );


    const workingType =
      normaliseWorkingType(
        insight.workingAs
      );


    const workingMatches =
      selectedWorkingAs === "ALL" ||
      workingType === selectedWorkingAs;


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

  if (!archiveGrid) {
    return;
  }


  const filteredInsights =
    getFilteredInsights();


  archiveGrid.innerHTML = "";


  if (insightCount) {

    insightCount.textContent =
      filteredInsights.length;

  }


  if (introCount) {

    introCount.textContent =
      insights.length;

  }


  if (
    filteredInsights.length === 0
  ) {

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
        document.createElement(
          "article"
        );


      card.className =
        "insight-card";


      const salaryHTML =
        insight.salary
          ? `
            <div class="card-salary">
              ${escapeHTML(
                insight.salary
              )}
            </div>
          `
          : "";


      const categories =
        getCategories(insight);


      const categoryHTML =
        categories
          .map(category => `
            <span class="card-category">
              ${escapeHTML(category)}
            </span>
          `)
          .join(" ");


      const workingType =
        normaliseWorkingType(
          insight.workingAs
        );


      card.innerHTML = `

        <div class="card-number">
          ${String(index + 1).padStart(3, "0")}
        </div>


        <div class="card-advice">
          “${escapeHTML(
            insight.advice
          )}”
        </div>


        <div class="card-footer">

          <div class="card-role">
            ${escapeHTML(
              insight.role || ""
            )}
          </div>


          <div class="card-experience">
            ${escapeHTML(
              workingType
            )}
            ·
            ${escapeHTML(
              insight.experience || ""
            )}
            in practice
          </div>


          ${salaryHTML}


          <div class="card-category-list">
            ${categoryHTML}
          </div>

        </div>

      `;


      archiveGrid.appendChild(card);

    }
  );

}



/* -----------------------------------------
   FEATURED INSIGHT
----------------------------------------- */

function showRandomInsight() {

  if (!featuredInsight) {
    return;
  }


  const availableInsights =
    getFilteredInsights();


  if (
    availableInsights.length === 0
  ) {

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
    availableInsights[
      randomIndex
    ];


  const workingType =
    normaliseWorkingType(
      insight.workingAs
    );


  const categories =
    getCategories(insight);


  const categoryHTML =
    categories
      .map(category => `
        <span class="featured-category">
          ${escapeHTML(category)}
        </span>
      `)
      .join("");


  featuredInsight.innerHTML = `

    <p class="quote">
      “${escapeHTML(
        insight.advice
      )}”
    </p>


    <p class="meta">

      ${escapeHTML(
        insight.role || ""
      )}

      ·

      ${escapeHTML(
        workingType
      )}

      ·

      ${escapeHTML(
        insight.experience || ""
      )}

      in practice

      ${
        insight.salary
          ? ` · ${escapeHTML(
              insight.salary
            )}`
          : ""
      }

    </p>


    <div class="featured-categories">
      ${categoryHTML}
    </div>

  `;

}



/* -----------------------------------------
   ESCAPE HTML
----------------------------------------- */

function escapeHTML(value) {

  if (value === null ||
      value === undefined) {

    return "";

  }


  return String(value)

    .replace(/&/g, "&amp;")

    .replace(/</g, "&lt;")

    .replace(/>/g, "&gt;")

    .replace(/"/g, "&quot;")

    .replace(
      /'/g,
      "&#039;"
    );

}



/* -----------------------------------------
   CLEAR FILTERS
----------------------------------------- */

if (clearFilters) {

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

}



/* -----------------------------------------
   ANOTHER BUTTON
----------------------------------------- */

if (anotherButton) {

  anotherButton.addEventListener(
    "click",
    showRandomInsight
  );

}



/* -----------------------------------------
   INITIALISE
----------------------------------------- */

function initialiseArchive() {

  createCategoryFilters();

  createWorkingFilters();

  displayArchive();

  showRandomInsight();

}



/* -----------------------------------------
   START
----------------------------------------- */

loadInsights();
