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



/* =========================================
   LOAD
========================================= */

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
          item =>
            item &&
            item.advice
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



/* =========================================
   HELPERS
========================================= */

function clean(value) {

  if (
    value === null ||
    value === undefined
  ) {

    return "";

  }


  return String(value).trim();

}



function normaliseKey(value) {

  return clean(value)
    .toLowerCase()
    .replace(/\s+/g, " ");

}



function uniqueLabels(values) {

  const output = [];

  const keys =
    new Set();


  values.forEach(
    value => {

      const label =
        clean(value);

      const key =
        normaliseKey(label);


      if (
        label &&
        !keys.has(key)
      ) {

        keys.add(key);

        output.push(label);

      }

    }
  );


  return output;

}



/* =========================================
   CATEGORIES
========================================= */

const categoryMap = [

  {
    label: "Career",
    keywords: [
      "career"
    ]
  },

  {
    label: "Money",
    keywords: [
      "money",
      "salary",
      "rate",
      "rates"
    ]
  },

  {
    label: "Clients",
    keywords: [
      "client",
      "clients"
    ]
  },

  {
    label: "Freelance",
    keywords: [
      "freelance",
      "freelancing"
    ]
  },

  {
    label: "Making",
    keywords: [
      "making"
    ]
  },

  {
    label: "Collaboration",
    keywords: [
      "collaboration"
    ]
  },

  {
    label: "Education",
    keywords: [
      "education"
    ]
  },

  {
    label: "Other",
    keywords: [
      "other"
    ]
  }

];



function getCategories(insight) {

  const raw =
    normaliseKey(
      insight.category
    );


  if (!raw) {
    return [];
  }


  const matches = [];


  categoryMap.forEach(
    definition => {

      const matched =
        definition.keywords.some(
          keyword => {

            const regex =
              new RegExp(
                `(^|[,;|/&+\\s])${keyword}(?=$|[,;|/&+\\s])`,
                "i"
              );


            return regex.test(raw);

          }
        );


      if (matched) {

        matches.push(
          definition.label
        );

      }

    }
  );


  /*
     If Google Forms sends something
     unexpected, preserve it.
  */

  if (matches.length === 0) {

    raw
      .split(
        /\s*(?:,|;|\||&|\+|\band\b)\s*/i
      )

      .filter(Boolean)

      .forEach(
        item =>
          matches.push(
            titleCase(item)
          )
      );

  }


  return uniqueLabels(matches);

}



/* =========================================
   WORKING TYPES
========================================= */

const workingMap = [

  {
    label: "Employed",
    keywords: [
      "employed",
      "employee"
    ]
  },

  {
    label: "Freelance",
    keywords: [
      "freelance",
      "freelancer"
    ]
  },

  {
    label: "Independent / Founder",
    keywords: [
      "independent",
      "founder",
      "own studio",
      "studio owner"
    ]
  },

  {
    label: "Academic / Research",
    keywords: [
      "academic",
      "research"
    ]
  },

  {
    label: "Student",
    keywords: [
      "student"
    ]
  },

  {
    label: "Other",
    keywords: [
      "other"
    ]
  }

];



function getWorkingTypes(insight) {

  const raw =
    normaliseKey(
      insight.workingAs
    );


  if (!raw) {
    return [];
  }


  const matches = [];


  workingMap.forEach(
    definition => {

      const matched =
        definition.keywords.some(
          keyword =>
            raw.includes(keyword)
        );


      if (matched) {

        matches.push(
          definition.label
        );

      }

    }
  );


  if (matches.length === 0) {

    raw
      .split(
        /\s*(?:,|;|\||&|\+|\band\b)\s*/i
      )

      .filter(Boolean)

      .forEach(
        item =>
          matches.push(
            titleCase(item)
          )
      );

  }


  return uniqueLabels(matches);

}



/* =========================================
   AVAILABLE FILTERS
========================================= */

function getAvailableCategories() {

  const all = [];


  insights.forEach(
    insight => {

      getCategories(insight)
        .forEach(
          value =>
            all.push(value)
        );

    }
  );


  return uniqueLabels(all);

}



function getAvailableWorkingTypes() {

  const all = [];


  insights.forEach(
    insight => {

      getWorkingTypes(insight)
        .forEach(
          value =>
            all.push(value)
        );

    }
  );


  return uniqueLabels(all);

}



/* =========================================
   COUNTS
========================================= */

function categoryCount(category) {

  if (category === "ALL") {

    return insights.length;

  }


  return insights.filter(
    insight =>
      getCategories(insight)
        .some(
          item =>
            same(item, category)
        )
  ).length;

}



function workingCount(type) {

  if (type === "ALL") {

    return insights.length;

  }


  return insights.filter(
    insight =>
      getWorkingTypes(insight)
        .some(
          item =>
            same(item, type)
        )
  ).length;

}



/* =========================================
   CREATE FILTERS
========================================= */

function createCategoryFilters() {

  categoryFilters.innerHTML = "";


  createFilter(
    categoryFilters,
    "all",
    "ALL",
    "category",
    insights.length
  );


  getAvailableCategories()
    .forEach(
      category => {

        createFilter(
          categoryFilters,
          category.toLowerCase(),
          category,
          "category",
          categoryCount(category)
        );

      }
    );

}



function createWorkingFilters() {

  const available =
    getAvailableWorkingTypes();


  if (
    available.length === 0
  ) {

    workingFilterArea
      .classList.add("hidden");

    return;

  }


  workingFilterArea
    .classList.remove("hidden");


  workingFilters.innerHTML = "";


  createFilter(
    workingFilters,
    "all",
    "ALL",
    "working",
    insights.length
  );


  available.forEach(
    type => {

      createFilter(
        workingFilters,
        type.toLowerCase(),
        type,
        "working",
        workingCount(type)
      );

    }
  );

}



function createFilter(
  container,
  label,
  value,
  type,
  count
) {

  const button =
    document.createElement(
      "button"
    );


  button.type =
    "button";

  button.className =
    "filter";


  if (
    type === "category" &&
    same(
      value,
      selectedCategory
    )
  ) {

    button.classList.add(
      "active"
    );

  }


  if (
    type === "working" &&
    same(
      value,
      selectedWorkingAs
    )
  ) {

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
        type === "category"
      ) {

        selectedCategory =
          value;

      }


      if (
        type === "working"
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


  container.appendChild(button);

}



/* =========================================
   FILTER LOGIC
========================================= */

function getFilteredInsights() {

  return insights.filter(
    insight => {


      const categories =
        getCategories(insight);


      const workingTypes =
        getWorkingTypes(insight);


      const categoryMatches =

        selectedCategory === "ALL" ||

        categories.some(
          category =>
            same(
              category,
              selectedCategory
            )
        );


      const workingMatches =

        selectedWorkingAs === "ALL" ||

        workingTypes.some(
          type =>
            same(
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
   LONG TEXT
========================================= */

function getLengthClass(advice) {

  const length =
    clean(advice).length;


  if (length > 420) {

    return "very-long";

  }


  if (length > 230) {

    return "long";

  }


  return "";

}



/* =========================================
   DISPLAY CARDS
========================================= */

function displayArchive() {

  const filtered =
    getFilteredInsights();


  archiveGrid.innerHTML = "";


  insightCount.textContent =
    filtered.length;


  if (
    filtered.length === 0
  ) {

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
            ? " " + lengthClass
            : ""
        );


      const categories =
        getCategories(insight);


      const workingTypes =
        getWorkingTypes(insight);


      const salary =
        clean(insight.salary);


      const categoryHTML =
        categories.map(
          category => `

            <span class="card-category">
              ${escapeHTML(category)}
            </span>

          `
        ).join("");


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


          <div class="card-person">

            <div class="card-role">

              ${escapeHTML(
                insight.role || ""
              )}

            </div>


            <div class="card-experience">

              ${escapeHTML(
                workingTypes.join(" / ")
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


      archiveGrid.appendChild(card);

    }
  );

}



/* =========================================
   FEATURED
========================================= */

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


  const categories =
    getCategories(insight);


  const workingTypes =
    getWorkingTypes(insight);


  const lengthClass =
    getLengthClass(
      insight.advice
    );


  const categoryHTML =
    categories.map(
      category => `

        <span class="featured-category">

          ${escapeHTML(category)}

        </span>

      `
    ).join("");


  const meta = [

    insight.role,

    workingTypes.join(" / "),

    insight.experience
      ? `${insight.experience} in practice`
      : "",

    insight.salary

  ]
  .filter(Boolean)
  .join(" · ");


  featuredInsight.innerHTML = `

    <p class="featured-quote ${lengthClass}">

      “${escapeHTML(
        insight.advice
      )}”

    </p>


    <div class="featured-meta">

      ${escapeHTML(meta)}

    </div>


    <div class="featured-categories">

      ${categoryHTML}

    </div>

  `;

}



/* =========================================
   UTILITIES
========================================= */

function same(a, b) {

  return (
    normaliseKey(a) ===
    normaliseKey(b)
  );

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



/* =========================================
   BUTTONS
========================================= */

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



/* =========================================
   INIT
========================================= */

function initialiseArchive() {

  createCategoryFilters();

  createWorkingFilters();

  displayArchive();

  showRandomInsight();

}



loadInsights();
