const DATA_URL =
  "https://script.google.com/macros/s/AKfycbxfHNB1tTeQVdKz5e3aZZrM1cCAIk9lKNYygpDoPFPPP4OnbuRQ7oL410Mv9SeZd-hUHg/exec";


/* -----------------------------------------
   STATE
----------------------------------------- */

let insights = [];

let selectedCategory = "ALL";
let selectedWorkingAs = "ALL";


/* -----------------------------------------
   ELEMENTS
----------------------------------------- */

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
   LOAD DATA USING JSONP
----------------------------------------- */

function loadInsights() {

  console.log("Loading archive...");

  const callbackName =
    "archiveCallback_" + Date.now();


  window[callbackName] = function(data) {

    console.log(
      "Archive data received:",
      data
    );


    try {

      if (!Array.isArray(data)) {

        throw new Error(
          "Archive data is not an array."
        );

      }


      insights = data;


      initialiseArchive();


    } catch (error) {

      console.error(
        "Archive processing error:",
        error
      );

      showArchiveError();

    }


    finally {

      delete window[callbackName];


      const oldScript =
        document.getElementById(
          callbackName
        );


      if (oldScript) {
        oldScript.remove();
      }

    }

  };


  const script =
    document.createElement("script");


  script.id =
    callbackName;


  script.src =
    DATA_URL +
    "?callback=" +
    encodeURIComponent(
      callbackName
    );


  script.onerror = function() {

    console.error(
      "Could not load archive data."
    );


    showArchiveError();


    delete window[callbackName];


    script.remove();

  };


  document.body.appendChild(script);

}



/* -----------------------------------------
   ERROR STATE
----------------------------------------- */

function showArchiveError() {

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



/* -----------------------------------------
   AVAILABLE CATEGORIES
----------------------------------------- */

function getAvailableCategories() {

  return [
    ...new Set(

      insights

        .map(
          insight =>
            insight.category
        )

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

        .map(
          insight =>
            insight.workingAs
        )

        .filter(Boolean)

    )
  ];

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
    "Everyone",
    "ALL",
    "category"
  );


  categories.forEach(
    category => {

      createFilterButton(
        categoryFilters,
        category,
        category,
        "category"
      );

    }
  );

}



/* -----------------------------------------
   CREATE WORKING FILTERS
----------------------------------------- */

function createWorkingFilters() {

  if (!workingFilters) {
    return;
  }


  const workingTypes =
    getAvailableWorkingTypes();


  console.log(
    "Working types:",
    workingTypes
  );


  workingFilters.innerHTML = "";


  /*
     IMPORTANT:
     Always show the working filter area.
     This prevents the second filter row
     from disappearing because of CSS/HTML.
  */

  if (workingFilterArea) {

    workingFilterArea.classList.remove(
      "hidden"
    );

  }


  createFilterButton(
    workingFilters,
    "Everyone",
    "ALL",
    "working"
  );


  workingTypes.forEach(
    type => {

      createFilterButton(
        workingFilters,
        type,
        type,
        "working"
      );

    }
  );

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

  if (!container) {
    return;
  }


  const button =
    document.createElement("button");


  button.type =
    "button";


  button.className =
    "filter";


  if (

    (
      type === "category" &&
      value === selectedCategory
    )

    ||

    (
      type === "working" &&
      value === selectedWorkingAs
    )

  ) {

    button.classList.add(
      "active"
    );

  }


  button.textContent =
    label;


  button.addEventListener(
    "click",
    function() {


      /* CATEGORY */

      if (
        type === "category"
      ) {

        selectedCategory =
          value;


        categoryFilters
          ?.querySelectorAll(".filter")
          .forEach(
            button =>
              button.classList.remove(
                "active"
              )
          );


        button.classList.add(
          "active"
        );

      }


      /* WORKING AS */

      if (
        type === "working"
      ) {

        selectedWorkingAs =
          value;


        workingFilters
          ?.querySelectorAll(".filter")
          .forEach(
            button =>
              button.classList.remove(
                "active"
              )
          );


        button.classList.add(
          "active"
        );

      }


      displayArchive();

      showRandomInsight();

    }
  );


  container.appendChild(
    button
  );

}



/* -----------------------------------------
   FILTER INSIGHTS
----------------------------------------- */

function getFilteredInsights() {

  return insights.filter(
    function(insight) {


      const categoryMatches =
        selectedCategory === "ALL" ||
        insight.category ===
          selectedCategory;


      const workingMatches =
        selectedWorkingAs === "ALL" ||
        insight.workingAs ===
          selectedWorkingAs;


      return (
        categoryMatches &&
        workingMatches
      );

    }
  );

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
    function(insight, index) {


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


      card.innerHTML = `

        <div class="card-number">

          ${String(
            index + 1
          ).padStart(3, "0")}

        </div>


        <div class="card-advice">

          “${escapeHTML(
            insight.advice
          )}”

        </div>


        <div class="card-footer">

          <div class="card-role">

            ${escapeHTML(
              insight.role
            )}

          </div>


          <div class="card-experience">

            ${escapeHTML(
              insight.workingAs
            )}

            ·

            ${escapeHTML(
              insight.experience
            )}

            in practice

          </div>


          ${salaryHTML}


          <div class="card-category">

            ${escapeHTML(
              insight.category
            )}

          </div>

        </div>

      `;


      archiveGrid.appendChild(
        card
      );

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


  featuredInsight.innerHTML = `

    <p class="quote">

      “${escapeHTML(
        insight.advice
      )}”

    </p>


    <p class="meta">

      ${escapeHTML(
        insight.role
      )}

      ·

      ${escapeHTML(
        insight.workingAs
      )}

      ·

      ${escapeHTML(
        insight.experience
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


    <div class="featured-category">

      ${escapeHTML(
        insight.category
      )}

    </div>

  `;

}



/* -----------------------------------------
   CLEAR FILTERS
----------------------------------------- */

if (clearFilters) {

  clearFilters.addEventListener(
    "click",
    function() {

      selectedCategory =
        "ALL";

      selectedWorkingAs =
        "ALL";


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
   ESCAPE HTML
----------------------------------------- */

function escapeHTML(value) {

  if (
    value === null ||
    value === undefined
  ) {

    return "";

  }


  return String(value)

    .replace(
      /&/g,
      "&amp;"
    )

    .replace(
      /</g,
      "&lt;"
    )

    .replace(
      />/g,
      "&gt;"
    )

    .replace(
      /"/g,
      "&quot;"
    )

    .replace(
      /'/g,
      "&#039;"
    );

}



/* -----------------------------------------
   INITIALISE
----------------------------------------- */

function initialiseArchive() {

  console.log(
    "Initialising archive with",
    insights.length,
    "insights"
  );


  createCategoryFilters();

  createWorkingFilters();

  displayArchive();

  showRandomInsight();

}



/* -----------------------------------------
   START
----------------------------------------- */

loadInsights();
