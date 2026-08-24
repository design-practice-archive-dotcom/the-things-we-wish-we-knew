/* =========================================
   THE THINGS WE WISH WE'D KNOWN

   DATA SOURCE:
   Google Apps Script JSONP endpoint
========================================= */


/* -----------------------------------------
   GOOGLE APPS SCRIPT ENDPOINT
----------------------------------------- */

const DATA_URL =
  "https://script.google.com/macros/s/AKfycbxfHNB1tTeQVdKz5e3aZZrM1cCAIk9lKNYygpDoPFPPP4OnbuRQ7oL410Mv9SeZd-hUHg/exec";


/* -----------------------------------------
   GOOGLE FORM
----------------------------------------- */

const GOOGLE_FORM_URL =
  "https://docs.google.com/forms/d/e/1FAIpQLScjiItmC0lLiyAeuG68L-sKDdghVBmpc2iqTyt22s_fOLPhBw/viewform?usp=header";


/* -----------------------------------------
   STATE
----------------------------------------- */

let insights = [];

let selectedCategory = "ALL";

let selectedWorkingAs = "ALL";


/* -----------------------------------------
   DOM ELEMENTS
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
   GOOGLE FORM BUTTONS
----------------------------------------- */

function connectGoogleFormButtons() {

  const formLinks =
    document.querySelectorAll(
      'a[href="YOUR_GOOGLE_FORM_LINK"]'
    );


  formLinks.forEach(link => {

    link.href =
      GOOGLE_FORM_URL;

    link.target =
      "_blank";

    link.rel =
      "noopener noreferrer";

  });

}



/* -----------------------------------------
   LOAD DATA USING JSONP
----------------------------------------- */

function loadInsights() {

  return new Promise((resolve, reject) => {

    const callbackName =
      "archiveCallback_" +
      Date.now();


    const script =
      document.createElement("script");


    const timeout =
      setTimeout(() => {

        cleanup();

        reject(
          new Error(
            "The archive data took too long to load."
          )
        );

      }, 10000);


    function cleanup() {

      clearTimeout(timeout);

      delete window[callbackName];

      if (script.parentNode) {

        script.parentNode.removeChild(
          script
        );

      }

    }


    window[callbackName] =
      function(data) {

        cleanup();

        resolve(data);

      };


    script.src =
      DATA_URL +
      "?callback=" +
      encodeURIComponent(callbackName) +
      "&t=" +
      Date.now();


    script.onerror =
      function() {

        cleanup();

        reject(
          new Error(
            "Could not connect to the archive."
          )
        );

      };


    document.body.appendChild(
      script
    );

  })

  .then(data => {

    console.log(
      "Archive data received:",
      data
    );


    if (!Array.isArray(data)) {

      throw new Error(
        "Archive data is not an array."
      );

    }


    insights =
      data;


    initialiseArchive();

  })

  .catch(error => {

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

      insightCount.textContent =
        "0";

    }


    if (introCount) {

      introCount.textContent =
        "0";

    }

  });

}



/* -----------------------------------------
   CATEGORY HELPERS
----------------------------------------- */

/*
   Turns:

   "Clients, Money"

   into:

   ["Clients", "Money"]

   Also works with:

   "Career"

   and:

   "Clients, Career, Money"
*/

function getCategoriesFromInsight(
  insight
) {

  if (
    !insight.category
  ) {

    return [];

  }


  return String(
    insight.category
  )

    .split(",")

    .map(category =>
      category.trim()
    )

    .filter(Boolean);

}



/* -----------------------------------------
   AVAILABLE CATEGORIES
----------------------------------------- */

function getAvailableCategories() {

  const categories = [];


  insights.forEach(insight => {

    const insightCategories =
      getCategoriesFromInsight(
        insight
      );


    insightCategories.forEach(
      category => {

        if (
          !categories.includes(
            category
          )
        ) {

          categories.push(
            category
          );

        }

      }
    );

  });


  return categories;

}



/* -----------------------------------------
   AVAILABLE WORKING TYPES
----------------------------------------- */

function getAvailableWorkingTypes() {

  return [
    ...new Set(

      insights

        .map(insight =>
          String(
            insight.workingAs || ""
          ).trim()
        )

        .filter(Boolean)

    )
  ];

}



/* -----------------------------------------
   DISPLAY WORKING TYPE
----------------------------------------- */

/*
   We keep the original value in the
   data, but change what is displayed.

   Freelance / Independent
   becomes:

   Independent / Founder
*/

function getWorkingLabel(
  workingType
) {

  if (
    workingType ===
    "Freelance / Independent"
  ) {

    return "Independent / Founder";

  }


  return workingType;

}



/* -----------------------------------------
   CREATE CATEGORY FILTERS
----------------------------------------- */

function createCategoryFilters() {

  if (!categoryFilters) {

    return;

  }


  categoryFilters.innerHTML =
    "";


  createFilterButton(
    categoryFilters,
    "Everyone",
    "ALL",
    "category"
  );


  const categories =
    getAvailableCategories();


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


  workingFilters.innerHTML =
    "";


  createFilterButton(
    workingFilters,
    "Everyone",
    "ALL",
    "working"
  );


  const workingTypes =
    getAvailableWorkingTypes();


  workingTypes.forEach(
    type => {

      createFilterButton(
        workingFilters,
        getWorkingLabel(type),
        type,
        "working"
      );

    }
  );


  if (workingFilterArea) {

    workingFilterArea.classList.remove(
      "hidden"
    );

  }

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
    document.createElement(
      "button"
    );


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


      /* ---------------------------------
         CATEGORY FILTER
      --------------------------------- */

      if (
        type === "category"
      ) {

        selectedCategory =
          value;


        if (categoryFilters) {

          categoryFilters
            .querySelectorAll(
              ".filter"
            )
            .forEach(filter => {

              filter.classList.remove(
                "active"
              );

            });

        }


        button.classList.add(
          "active"
        );

      }



      /* ---------------------------------
         WORKING AS FILTER
      --------------------------------- */

      if (
        type === "working"
      ) {

        selectedWorkingAs =
          value;


        if (workingFilters) {

          workingFilters
            .querySelectorAll(
              ".filter"
            )
            .forEach(filter => {

              filter.classList.remove(
                "active"
              );

            });

        }


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
   CATEGORY MATCHING
----------------------------------------- */

/*
   This is the important part.

   An insight with:

   category: "Clients, Money"

   matches BOTH:

   "Clients"

   and:

   "Money"
*/

function insightMatchesCategory(
  insight,
  selectedCategory
) {

  if (
    selectedCategory ===
    "ALL"
  ) {

    return true;

  }


  const categories =
    getCategoriesFromInsight(
      insight
    );


  return categories.includes(
    selectedCategory
  );

}



/* -----------------------------------------
   FILTER INSIGHTS
----------------------------------------- */

function getFilteredInsights() {

  return insights.filter(
    insight => {


      const categoryMatches =
        insightMatchesCategory(
          insight,
          selectedCategory
        );


      const workingAs =
        String(
          insight.workingAs || ""
        ).trim();


      const workingMatches =
        selectedWorkingAs === "ALL" ||
        workingAs ===
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


  archiveGrid.innerHTML =
    "";


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

        insight.salary &&
        String(
          insight.salary
        ).trim()

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
              getWorkingLabel(
                String(
                  insight.workingAs || ""
                ).trim()
              )
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


  const workingLabel =
    getWorkingLabel(
      String(
        insight.workingAs || ""
      ).trim()
    );


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
        workingLabel
      )}

      ·

      ${escapeHTML(
        insight.experience
      )}

      in practice

      ${
        insight.salary &&
        String(
          insight.salary
        ).trim()

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
    function() {

      showRandomInsight();

    }
  );

}



/* -----------------------------------------
   ESCAPE HTML
----------------------------------------- */

function escapeHTML(
  value
) {

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

connectGoogleFormButtons();

loadInsights();
