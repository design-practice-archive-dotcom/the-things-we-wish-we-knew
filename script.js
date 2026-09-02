const DATA_URL =
  "https://script.google.com/macros/s/AKfycbxfHNB1tTeQVdKz5e3aZZrM1cCAIk9lKNYygpDoPFPPP4OnbuRQ7oL410Mv9SeZd-hUHg/exec";


let insights = [];

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

const workingFilterArea =
  document.getElementById("working-filter-area");

const clearFilters =
  document.getElementById("clear-filters");



/* -----------------------------------------
   LOAD DATA
----------------------------------------- */

function loadInsights() {

  const callbackName =
    "archiveCallback_" + Date.now();


  const script =
    document.createElement("script");


  window[callbackName] =
    function(data) {

      delete window[callbackName];

      script.remove();


      if (!Array.isArray(data)) {

        showError();

        return;

      }


      insights =
        data.filter(
          insight =>
            insight &&
            clean(insight.advice)
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

      showError();

    };


  document.body.appendChild(script);

}



function showError() {

  archiveGrid.innerHTML = `

    <div class="empty-state">
      The archive is temporarily unavailable.
    </div>

  `;

}



/* -----------------------------------------
   CLEAN
----------------------------------------- */

function clean(value) {

  if (
    value === null ||
    value === undefined
  ) {

    return "";

  }

  return String(value).trim();

}



function key(value) {

  return clean(value)
    .toLowerCase()
    .replace(/\s+/g, " ");

}



function same(a, b) {

  return key(a) === key(b);

}



/* -----------------------------------------
   CATEGORIES
----------------------------------------- */

const categoryDefinitions = [

  {
    label: "Career",
    terms: ["career"]
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
      "client",
      "clients"
    ]
  },

  {
    label: "Freelance",
    terms: [
      "freelance",
      "freelancing"
    ]
  },

  {
    label: "Making",
    terms: ["making"]
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
    terms: ["education"]
  },

  {
    label: "Other",
    terms: ["other"]
  }

];



function getCategories(insight) {

  const raw =
    key(insight.category);


  if (!raw) {
    return [];
  }


  const result = [];


  categoryDefinitions.forEach(
    definition => {

      const found =
        definition.terms.some(
          term => {

            const regex =
              new RegExp(
                `(^|[\\s,;|/&+])${escapeRegExp(term)}(?=$|[\\s,;|/&+])`,
                "i"
              );

            return regex.test(raw);

          }
        );


      if (found) {

        result.push(
          definition.label
        );

      }

    }
  );


  if (!result.length) {

    splitFallback(raw)
      .forEach(
        item =>
          result.push(
            titleCase(item)
          )
      );

  }


  return unique(result);

}



/* -----------------------------------------
   WORKING TYPES
----------------------------------------- */

const workingDefinitions = [

  {
    label: "Employed",
    terms: [
      "employed",
      "employee"
    ]
  },

  {
    label: "Freelance",
    terms: [
      "freelance",
      "freelancer"
    ]
  },

  {
    label: "Independent / Founder",
    terms: [
      "independent",
      "founder",
      "own studio",
      "studio owner"
    ]
  },

  {
    label: "Academic / Research",
    terms: [
      "academic",
      "research",
      "researcher"
    ]
  },

  {
    label: "Student",
    terms: [
      "student"
    ]
  },

  {
    label: "Other",
    terms: [
      "other"
    ]
  }

];



function getWorkingTypes(insight) {

  const raw =
    key(insight.workingAs);


  if (!raw) {
    return [];
  }


  const result = [];


  workingDefinitions.forEach(
    definition => {

      const found =
        definition.terms.some(
          term =>
            raw.includes(
              term
            )
        );


      if (found) {

        result.push(
          definition.label
        );

      }

    }
  );


  if (!result.length) {

    splitFallback(raw)
      .forEach(
        item =>
          result.push(
            titleCase(item)
          )
      );

  }


  return unique(result);

}



/* -----------------------------------------
   UNIQUE
----------------------------------------- */

function unique(values) {

  const used =
    new Set();

  const result =
    [];


  values.forEach(
    value => {

      const cleanValue =
        clean(value);

      const cleanKey =
        key(cleanValue);


      if (
        cleanValue &&
        !used.has(cleanKey)
      ) {

        used.add(cleanKey);

        result.push(
          cleanValue
        );

      }

    }
  );


  return result;

}



/* -----------------------------------------
   AVAILABLE FILTERS
----------------------------------------- */

function getAvailableCategories() {

  const values = [];


  insights.forEach(
    insight => {

      getCategories(insight)
        .forEach(
          category =>
            values.push(category)
        );

    }
  );


  return unique(values);

}



function getAvailableWorkingTypes() {

  const values = [];


  insights.forEach(
    insight => {

      getWorkingTypes(insight)
        .forEach(
          type =>
            values.push(type)
        );

    }
  );


  return unique(values);

}



/* -----------------------------------------
   COUNTS
----------------------------------------- */

function countCategory(category) {

  if (category === "ALL") {

    return insights.length;

  }


  return insights.filter(
    insight =>

      getCategories(insight)
        .some(
          item =>
            same(
              item,
              category
            )
        )

  ).length;

}



function countWorking(type) {

  if (type === "ALL") {

    return insights.length;

  }


  return insights.filter(
    insight =>

      getWorkingTypes(insight)
        .some(
          item =>
            same(
              item,
              type
            )
        )

  ).length;

}



/* -----------------------------------------
   CREATE FILTERS
----------------------------------------- */

function createCategoryFilters() {

  categoryFilters.innerHTML =
    "";


  addFilter({

    container:
      categoryFilters,

    label:
      "all",

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

        addFilter({

          container:
            categoryFilters,

          label:
            category.toLowerCase(),

          value:
            category,

          type:
            "category",

          count:
            countCategory(
              category
            )

        });

      }
    );

}



function createWorkingFilters() {

  const types =
    getAvailableWorkingTypes();


  if (!types.length) {

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


  addFilter({

    container:
      workingFilters,

    label:
      "all",

    value:
      "ALL",

    type:
      "working",

    count:
      insights.length

  });


  types.forEach(
    type => {

      addFilter({

        container:
          workingFilters,

        label:
          type.toLowerCase(),

        value:
          type,

        type:
          "working",

        count:
          countWorking(type)

      });

    }
  );

}



/* -----------------------------------------
   ONE FILTER BUTTON
----------------------------------------- */

function addFilter({
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


  const active =

    (
      type === "category" &&
      same(
        value,
        selectedCategory
      )
    )

    ||

    (
      type === "working" &&
      same(
        value,
        selectedWorkingAs
      )
    );


  if (active) {

    button.classList.add(
      "active"
    );

  }


  button.innerHTML = `

    <span>
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



/* -----------------------------------------
   FILTER INSIGHTS
----------------------------------------- */

function getFilteredInsights() {

  return insights.filter(
    insight => {


      const categories =
        getCategories(insight);


      const workingTypes =
        getWorkingTypes(insight);


      const categoryMatch =

        selectedCategory ===
        "ALL"

        ||

        categories.some(
          category =>
            same(
              category,
              selectedCategory
            )
        );


      const workingMatch =

        selectedWorkingAs ===
        "ALL"

        ||

        workingTypes.some(
          type =>
            same(
              type,
              selectedWorkingAs
            )
        );


      return (
        categoryMatch &&
        workingMatch
      );

    }
  );

}



/* -----------------------------------------
   LENGTH
----------------------------------------- */

function getLengthClass(advice) {

  const length =
    clean(advice).length;


  if (length > 390) {

    return "very-long";

  }


  if (length > 220) {

    return "long";

  }


  return "";

}



/* -----------------------------------------
   DISPLAY ARCHIVE
----------------------------------------- */

function displayArchive() {

  const filtered =
    getFilteredInsights();


  archiveGrid.innerHTML =
    "";


  insightCount.textContent =
    filtered.length;


  if (!filtered.length) {

    archiveGrid.innerHTML = `

      <div class="empty-state">
        Nothing here yet.
      </div>

    `;

    return;

  }


  filtered.forEach(
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


      const categories =
        getCategories(insight);


      const workingTypes =
        getWorkingTypes(insight);


      const categoryHTML =
        categories
          .map(
            category => `

              <span class="card-category">

                ${escapeHTML(category)}

              </span>

            `
          )
          .join("");


      const salary =
        clean(insight.salary);


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


          <div>


            <div class="card-role">

              ${escapeHTML(
                insight.role || ""
              )}

            </div>


            <div class="card-experience">

              ${escapeHTML(
                workingTypes.join(
                  " / "
                )
              )}

              ${
                workingTypes.length &&
                insight.experience
                  ? " · "
                  : ""
              }

              ${escapeHTML(
                insight.experience || ""
              )}

              ${
                insight.experience
                  ? " in practice"
                  : ""
              }

            </div>


            ${
              salary
                ? `

                  <div class="card-salary">

                    ${escapeHTML(
                      salary
                    )}

                  </div>

                `
                : ""
            }


          </div>



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



/* -----------------------------------------
   FEATURED
----------------------------------------- */

function showRandomInsight() {

  const available =
    getFilteredInsights();


  if (!available.length) {

    featuredInsight.innerHTML = `

      <p class="featured-quote">
        Nothing here yet.
      </p>

    `;

    return;

  }


  const insight =
    available[
      Math.floor(
        Math.random() *
        available.length
      )
    ];


  const workingTypes =
    getWorkingTypes(insight);


  const categories =
    getCategories(insight);


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
      `${insight.experience} in practice`
    );

  }


  if (
    insight.salary
  ) {

    metaParts.push(
      insight.salary
    );

  }


  const categoryHTML =
    categories
      .map(
        category => `

          <span class="featured-category">

            ${escapeHTML(category)}

          </span>

        `
      )
      .join("");


  const lengthClass =
    getLengthClass(
      insight.advice
    );


  featuredInsight.innerHTML = `


    <p class="featured-quote ${lengthClass}">

      “${escapeHTML(
        insight.advice
      )}”

    </p>


    <div class="featured-meta">

      ${escapeHTML(
        metaParts.join(
          " · "
        )
      )}

    </div>


    <div class="featured-categories">

      ${categoryHTML}

    </div>


  `;

}



/* -----------------------------------------
   CLEAR
----------------------------------------- */

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



anotherButton.addEventListener(
  "click",
  showRandomInsight
);



/* -----------------------------------------
   HELPERS
----------------------------------------- */

function splitFallback(value) {

  return clean(value)
    .split(
      /\s*(?:,|;|\||&|\+|\band\b)\s*/i
    )
    .map(item => clean(item))
    .filter(Boolean);

}



function titleCase(value) {

  return clean(value)
    .toLowerCase()
    .replace(
      /\b\w/g,
      letter =>
        letter.toUpperCase()
    );

}



function escapeRegExp(value) {

  return String(value)
    .replace(
      /[.*+?^${}()|[\]\\]/g,
      "\\$&"
    );

}



function escapeHTML(value) {

  return String(
    value ?? ""
  )

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
   INIT
----------------------------------------- */

function initialiseArchive() {

  createCategoryFilters();

  createWorkingFilters();

  displayArchive();

  showRandomInsight();

}



loadInsights();
