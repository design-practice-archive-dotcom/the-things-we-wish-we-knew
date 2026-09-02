/* =========================================
   DATA SOURCE
========================================= */

const DATA_URL =
  "https://script.google.com/macros/s/AKfycbxfHNB1tTeQVdKz5e3aZZrM1cCAIk9lKNYygpDoPFPPP4OnbuRQ7oL410Mv9SeZd-hUHg/exec";



let insights = [];

let selectedCategory = "ALL";

let selectedWorkingAs = "ALL";



/* =========================================
   ELEMENTS
========================================= */

const archiveGrid =
  document.getElementById(
    "archive-grid"
  );


const insightCount =
  document.getElementById(
    "insight-count"
  );


const introCount =
  document.getElementById(
    "intro-count"
  );


const featuredInsight =
  document.getElementById(
    "featured-insight"
  );


const anotherButton =
  document.getElementById(
    "another-button"
  );


const categoryFilters =
  document.getElementById(
    "category-filters"
  );


const workingFilters =
  document.getElementById(
    "working-filters"
  );


const workingFilterArea =
  document.getElementById(
    "working-filter-area"
  );


const clearFilters =
  document.getElementById(
    "clear-filters"
  );



/* =========================================
   LOAD GOOGLE SHEET DATA
========================================= */

async function loadInsights() {


  try {


    const callbackName =
      "archiveCallback_" +
      Date.now();


    const script =
      document.createElement(
        "script"
      );


    window[callbackName] =
      function(data) {


        delete window[
          callbackName
        ];


        script.remove();


        if (
          !Array.isArray(data)
        ) {

          console.error(
            "Archive data is not an array."
          );

          showLoadError();

          return;

        }


        insights =
          data.filter(
            insight =>
              insight &&
              insight.advice
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


        delete window[
          callbackName
        ];


        script.remove();


        showLoadError();

      };


    document.body.appendChild(
      script
    );


  } catch (error) {


    console.error(
      "Archive loading error:",
      error
    );


    showLoadError();

  }

}



/* =========================================
   LOAD ERROR
========================================= */

function showLoadError() {


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

}



/* =========================================
   TEXT HELPERS
========================================= */

function cleanText(value) {


  if (
    value === null ||
    value === undefined
  ) {

    return "";

  }


  return String(value)
    .trim();

}



/* =========================================
   CATEGORY DEFINITIONS

   These are the ONLY topic filters
   generated automatically.

   One answer can belong to several.
========================================= */

const categoryDefinitions = [

  {
    label: "Career",
    terms: [
      "career"
    ]
  },

  {
    label: "Money",
    terms: [
      "money",
      "salary",
      "rates",
      "rate"
    ]
  },

  {
    label: "Clients",
    terms: [
      "clients",
      "client"
    ]
  },

  {
    label: "Freelance",
    terms: [
      "freelance",
      "freelancing",
      "self-employed",
      "self employed"
    ]
  },

  {
    label: "Making",
    terms: [
      "making"
    ]
  },

  {
    label: "Collaboration",
    terms: [
      "collaboration",
      "collaborating"
    ]
  },

  {
    label: "Education",
    terms: [
      "education"
    ]
  },

  {
    label: "Other",
    terms: [
      "other"
    ]
  }

];



/* =========================================
   GET CATEGORIES FOR ONE INSIGHT

   Example:
   "Money, Career"
   →
   ["Money", "Career"]

   MONEY + Money also become
   one single "Money" category.
========================================= */

function getCategories(
  insight
) {


  if (
    !insight ||
    !insight.category
  ) {

    return [];

  }


  const raw =
    cleanText(
      insight.category
    );


  const lower =
    raw.toLowerCase();


  const found =
    [];


  categoryDefinitions
    .forEach(
      definition => {


        const matches =
          definition.terms.some(
            term => {

              const escaped =
                escapeRegExp(
                  term
                );


              const regex =
                new RegExp(
                  `(^|[\\s,;|/&+])${escaped}(?=$|[\\s,;|/&+])`,
                  "i"
                );


              return regex.test(
                lower
              );

            }
          );


        if (matches) {

          found.push(
            definition.label
          );

        }

      }
    );


  /*
     Fallback for unexpected
     custom categories.
  */

  if (
    found.length === 0
  ) {


    raw
      .split(
        /\s*(?:,|;|\||\+|&|\band\b)\s*/i
      )

      .map(
        value =>
          value.trim()
      )

      .filter(Boolean)

      .forEach(
        value => {


          const formatted =
            titleCase(value);


          if (
            !found.some(
              existing =>
                existing
                  .toLowerCase() ===
                formatted
                  .toLowerCase()
            )
          ) {

            found.push(
              formatted
            );

          }

        }
      );

  }


  return uniqueCaseInsensitive(
    found
  );

}



/* =========================================
   WORKING TYPE DEFINITIONS

   IMPORTANT:

   "Employed, Freelance / Independent"

   becomes:

   ["Employed", "Independent"]

   NOT a new combined filter.
========================================= */

const workingDefinitions = [

  {
    label:
      "Employed",

    terms: [
      "employed",
      "employee"
    ]
  },


  {
    label:
      "Independent",

    terms: [
      "freelance",
      "freelancer",
      "independent",
      "self-employed",
      "self employed"
    ]
  },


  {
    label:
      "Founder / Studio",

    terms: [
      "founder",
      "own studio",
      "studio owner"
    ]
  },


  {
    label:
      "Academic / Research",

    terms: [
      "academic",
      "research",
      "researcher"
    ]
  },


  {
    label:
      "Student",

    terms: [
      "student"
    ]
  },


  {
    label:
      "Other",

    terms: [
      "other"
    ]
  }

];



/* =========================================
   GET WORKING TYPES
========================================= */

function getWorkingTypes(
  insight
) {


  if (
    !insight ||
    !insight.workingAs
  ) {

    return [];

  }


  const raw =
    cleanText(
      insight.workingAs
    );


  const lower =
    raw.toLowerCase();


  const found =
    [];


  workingDefinitions
    .forEach(
      definition => {


        const matches =
          definition.terms.some(
            term =>
              lower.includes(
                term
              )
          );


        if (matches) {

          found.push(
            definition.label
          );

        }

      }
    );


  /*
     If no known working type
     was recognised, preserve it
     instead of throwing it away.
  */

  if (
    found.length === 0
  ) {


    raw
      .split(
        /\s*(?:,|;|\||\+|&|\band\b)\s*/i
      )

      .map(
        value =>
          value.trim()
      )

      .filter(Boolean)

      .forEach(
        value =>
          found.push(
            value
          )
      );

  }


  return uniqueCaseInsensitive(
    found
  );

}



/* =========================================
   REMOVE DUPLICATES CASE-INSENSITIVELY
========================================= */

function uniqueCaseInsensitive(
  values
) {


  const map =
    new Map();


  values.forEach(
    value => {


      const clean =
        cleanText(value);


      if (!clean) {
        return;
      }


      const key =
        clean.toLowerCase();


      if (
        !map.has(key)
      ) {

        map.set(
          key,
          clean
        );

      }

    }
  );


  return [
    ...map.values()
  ];

}



/* =========================================
   AVAILABLE CATEGORY FILTERS
========================================= */

function getAvailableCategories() {


  const categories =
    [];


  insights.forEach(
    insight => {


      getCategories(
        insight
      ).forEach(
        category =>
          categories.push(
            category
          )
      );

    }
  );


  const unique =
    uniqueCaseInsensitive(
      categories
    );


  /*
     Keep filters in a sensible
     consistent order.
  */

  const order =
    categoryDefinitions.map(
      item =>
        item.label
    );


  return unique.sort(
    (a, b) => {


      const aIndex =
        order.indexOf(a);


      const bIndex =
        order.indexOf(b);


      if (
        aIndex === -1 &&
        bIndex === -1
      ) {

        return a.localeCompare(
          b
        );

      }


      if (aIndex === -1) {
        return 1;
      }


      if (bIndex === -1) {
        return -1;
      }


      return (
        aIndex -
        bIndex
      );

    }
  );

}



/* =========================================
   AVAILABLE WORKING FILTERS
========================================= */

function getAvailableWorkingTypes() {


  const types =
    [];


  insights.forEach(
    insight => {


      getWorkingTypes(
        insight
      ).forEach(
        type =>
          types.push(
            type
          )
      );

    }
  );


  const unique =
    uniqueCaseInsensitive(
      types
    );


  const order =
    workingDefinitions.map(
      item =>
        item.label
    );


  return unique.sort(
    (a, b) => {


      const aIndex =
        order.indexOf(a);


      const bIndex =
        order.indexOf(b);


      if (
        aIndex === -1 &&
        bIndex === -1
      ) {

        return a.localeCompare(
          b
        );

      }


      if (aIndex === -1) {
        return 1;
      }


      if (bIndex === -1) {
        return -1;
      }


      return (
        aIndex -
        bIndex
      );

    }
  );

}



/* =========================================
   FILTER COUNTS
========================================= */

function getCategoryCount(
  category
) {


  if (
    category === "ALL"
  ) {

    return insights.length;

  }


  return insights.filter(
    insight =>
      getCategories(insight)
        .some(
          value =>
            valuesMatch(
              value,
              category
            )
        )
  ).length;

}



function getWorkingCount(
  type
) {


  if (
    type === "ALL"
  ) {

    return insights.length;

  }


  return insights.filter(
    insight =>
      getWorkingTypes(insight)
        .some(
          value =>
            valuesMatch(
              value,
              type
            )
        )
  ).length;

}



/* =========================================
   CREATE FILTERS
========================================= */

function createCategoryFilters() {


  if (!categoryFilters) {
    return;
  }


  categoryFilters.innerHTML =
    "";


  createFilterButton({

    container:
      categoryFilters,

    label:
      "All",

    value:
      "ALL",

    type:
      "category",

    count:
      insights.length

  });


  getAvailableCategories()
    .forEach(
      category => {


        createFilterButton({

          container:
            categoryFilters,

          label:
            category,

          value:
            category,

          type:
            "category",

          count:
            getCategoryCount(
              category
            )

        });

      }
    );

}



function createWorkingFilters() {


  if (
    !workingFilters ||
    !workingFilterArea
  ) {

    return;

  }


  const types =
    getAvailableWorkingTypes();


  if (
    types.length === 0
  ) {

    workingFilterArea
      .classList.add(
        "hidden"
      );

    return;

  }


  workingFilterArea
    .classList.remove(
      "hidden"
    );


  workingFilters.innerHTML =
    "";


  createFilterButton({

    container:
      workingFilters,

    label:
      "Everyone",

    value:
      "ALL",

    type:
      "working",

    count:
      insights.length

  });


  types.forEach(
    type => {


      createFilterButton({

        container:
          workingFilters,

        label:
          type,

        value:
          type,

        type:
          "working",

        count:
          getWorkingCount(
            type
          )

      });

    }
  );

}



/* =========================================
   CREATE ONE FILTER BUTTON
========================================= */

function createFilterButton({
  container,
  label,
  value,
  type,
  count
}) {


  const button =
    document.createElement(
      "button"
    );


  button.type =
    "button";


  button.className =
    "filter";


  const isActive =
    (
      type ===
        "category" &&
      valuesMatch(
        value,
        selectedCategory
      )
    ) ||
    (
      type ===
        "working" &&
      valuesMatch(
        value,
        selectedWorkingAs
      )
    );


  if (isActive) {

    button.classList.add(
      "active"
    );

  }


  button.innerHTML = `

    <span class="filter-label">
      ${escapeHTML(label)}
    </span>

    <span class="filter-count">
      ${count}
    </span>

  `;


  button.addEventListener(
    "click",
    () => {


      if (
        type ===
        "category"
      ) {

        selectedCategory =
          value;

      }


      if (
        type ===
        "working"
      ) {

        selectedWorkingAs =
          value;

      }


      createCategoryFilters();

      createWorkingFilters();

      displayArchive();

      showRandomInsight();

    }
  );


  container.appendChild(
    button
  );

}



/* =========================================
   FILTER INSIGHTS
========================================= */

function getFilteredInsights() {


  return insights.filter(
    insight => {


      const categories =
        getCategories(
          insight
        );


      const workingTypes =
        getWorkingTypes(
          insight
        );


      const categoryMatches =
        selectedCategory ===
          "ALL" ||

        categories.some(
          category =>
            valuesMatch(
              category,
              selectedCategory
            )
        );


      const workingMatches =
        selectedWorkingAs ===
          "ALL" ||

        workingTypes.some(
          type =>
            valuesMatch(
              type,
              selectedWorkingAs
            )
        );


      return (
        categoryMatches &&
        workingMatches
      );

    }
  );

}



/* =========================================
   ADVICE LENGTH

   Nothing gets truncated.

   We only adjust typography.
========================================= */

function getLengthClass(
  advice
) {


  const length =
    cleanText(
      advice
    ).length;


  if (
    length > 320
  ) {

    return "very-long";

  }


  if (
    length > 190
  ) {

    return "long";

  }


  return "";

}



function getFeaturedLengthClass(
  advice
) {


  const length =
    cleanText(
      advice
    ).length;


  if (
    length > 280
  ) {

    return "very-long-advice";

  }


  if (
    length > 165
  ) {

    return "long-advice";

  }


  return "";

}



/* =========================================
   DISPLAY ARCHIVE
========================================= */

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


      const lengthClass =
        getLengthClass(
          insight.advice
        );


      card.className =
        "insight-card" +
        (
          lengthClass
            ? ` ${lengthClass}`
            : ""
        );


      const salary =
        cleanText(
          insight.salary
        );


      const salaryHTML =
        salary
          ? `

            <div class="card-salary">

              ${escapeHTML(
                salary
              )}

            </div>

          `
          : "";


      const categories =
        getCategories(
          insight
        );


      const categoryHTML =
        categories
          .map(
            category => `

              <span class="card-category">

                ${escapeHTML(
                  category
                )}

              </span>

            `
          )
          .join("");


      const workingTypes =
        getWorkingTypes(
          insight
        );


      const workingText =
        workingTypes.join(
          " / "
        );


      card.innerHTML = `


        <div class="card-number">

          ${String(
            index + 1
          ).padStart(
            3,
            "0"
          )}

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
              workingText
            )}

            ${
              workingText &&
              insight.experience
                ? " · "
                : ""
            }

            ${escapeHTML(
              insight.experience || ""
            )}

          </div>


          ${salaryHTML}


          <div class="card-category-list">

            ${categoryHTML}

          </div>


        </div>


      `;


      archiveGrid.appendChild(
        card
      );

    }
  );

}



/* =========================================
   FEATURED INSIGHT
========================================= */

function showRandomInsight() {


  if (!featuredInsight) {
    return;
  }


  const available =
    getFilteredInsights();


  if (
    available.length === 0
  ) {


    featuredInsight.innerHTML = `

      <p class="quote">
        Nothing here yet.
      </p>

    `;


    return;

  }


  const randomIndex =
    Math.floor(
      Math.random() *
      available.length
    );


  const insight =
    available[
      randomIndex
    ];


  const workingTypes =
    getWorkingTypes(
      insight
    );


  const categories =
    getCategories(
      insight
    );


  const lengthClass =
    getFeaturedLengthClass(
      insight.advice
    );


  const categoryHTML =
    categories
      .map(
        category => `

          <span class="featured-category">

            ${escapeHTML(
              category
            )}

          </span>

        `
      )
      .join("");


  const metaParts =
    [];


  if (insight.role) {

    metaParts.push(
      insight.role
    );

  }


  if (
    workingTypes.length
  ) {

    metaParts.push(
      workingTypes.join(
        " / "
      )
    );

  }


  if (
    insight.experience
  ) {

    metaParts.push(
      insight.experience
    );

  }


  if (
    insight.salary
  ) {

    metaParts.push(
      insight.salary
    );

  }


  featuredInsight.innerHTML = `


    <p class="quote ${lengthClass}">

      “${escapeHTML(
        insight.advice
      )}”

    </p>


    <p class="meta">

      ${escapeHTML(
        metaParts.join(
          " · "
        )
      )}

    </p>


    <div class="featured-categories">

      ${categoryHTML}

    </div>


  `;

}



/* =========================================
   GENERAL HELPERS
========================================= */

function valuesMatch(
  a,
  b
) {


  return (
    cleanText(a)
      .toLowerCase() ===
    cleanText(b)
      .toLowerCase()
  );

}



function titleCase(
  value
) {


  return cleanText(
    value
  )

    .toLowerCase()

    .replace(
      /\b\w/g,
      letter =>
        letter.toUpperCase()
    );

}



function escapeRegExp(
  string
) {


  return String(string)
    .replace(
      /[.*+?^${}()|[\]\\]/g,
      "\\$&"
    );

}



/* =========================================
   ESCAPE HTML
========================================= */

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



/* =========================================
   CLEAR FILTERS
========================================= */

if (clearFilters) {


  clearFilters.addEventListener(
    "click",
    () => {


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



/* =========================================
   RANDOM BUTTON
========================================= */

if (anotherButton) {


  anotherButton.addEventListener(
    "click",
    showRandomInsight
  );

}



/* =========================================
   INITIALISE
========================================= */

function initialiseArchive() {


  createCategoryFilters();

  createWorkingFilters();

  displayArchive();

  showRandomInsight();

}



/* =========================================
   START
========================================= */

loadInsights();
