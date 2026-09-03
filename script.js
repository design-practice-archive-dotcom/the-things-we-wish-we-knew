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

async function loadInsights() {

  showLoadingState();


  try {

    const response =
      await fetch(
        DATA_URL + "?t=" + Date.now(),
        {
          method: "GET",
          cache: "no-store"
        }
      );


    if (!response.ok) {

      throw new Error(
        "HTTP " + response.status
      );

    }


    const text =
      await response.text();

    const parsed =
      parseResponseText(text);

    const rows =
      extractArray(parsed);


    if (rows) {

      useLoadedData(rows);

      return;

    }

  }

  catch (error) {

    console.warn(
      "Normal fetch failed:",
      error
    );

  }



  try {

    const rows =
      await loadWithJSONP();


    if (rows) {

      useLoadedData(rows);

      return;

    }

  }

  catch (error) {

    console.error(
      "JSONP failed:",
      error
    );

  }


  showError();

}



/* =========================================
   LOADING
========================================= */

function showLoadingState() {

  featuredInsight.innerHTML = `
    <p class="featured-quote">
      Loading archive...
    </p>
  `;


  archiveGrid.innerHTML = "";

  insightCount.textContent = "0";

}



/* =========================================
   RESPONSE
========================================= */

function parseResponseText(text) {

  const trimmed =
    clean(text);


  if (!trimmed) {

    return null;

  }


  try {

    return JSON.parse(trimmed);

  }

  catch (error) {
    /* continue */
  }


  const jsonpMatch =
    trimmed.match(
      /^[^(]+\(([\s\S]*)\)\s*;?$/
    );


  if (
    jsonpMatch &&
    jsonpMatch[1]
  ) {

    try {

      return JSON.parse(
        jsonpMatch[1]
      );

    }

    catch (error) {

      return null;

    }

  }


  return null;

}



function extractArray(value) {

  if (
    Array.isArray(value)
  ) {

    return value;

  }


  if (
    !value ||
    typeof value !== "object"
  ) {

    return null;

  }


  const possibleKeys = [
    "data",
    "insights",
    "rows",
    "results",
    "items"
  ];


  for (
    const property
    of possibleKeys
  ) {

    if (
      Array.isArray(
        value[property]
      )
    ) {

      return value[property];

    }

  }


  return null;

}



/* =========================================
   JSONP FALLBACK
========================================= */

function loadWithJSONP() {

  return new Promise(
    (resolve, reject) => {


      const callbackName =
        "archiveCallback_" +
        Date.now() +
        "_" +
        Math.floor(
          Math.random() * 100000
        );


      const script =
        document.createElement(
          "script"
        );


      let finished = false;


      function cleanup() {

        if (
          window[callbackName]
        ) {

          delete window[
            callbackName
          ];

        }


        if (
          script.parentNode
        ) {

          script.remove();

        }

      }


      const timeout =
        setTimeout(
          () => {

            if (finished) return;

            finished = true;

            cleanup();

            reject(
              new Error(
                "JSONP timed out."
              )
            );

          },
          10000
        );


      window[callbackName] =
        function(data) {

          if (finished) return;

          finished = true;

          clearTimeout(timeout);

          cleanup();


          const rows =
            extractArray(data);


          if (!rows) {

            reject(
              new Error(
                "No data array found."
              )
            );

            return;

          }


          resolve(rows);

        };


      script.onerror =
        function() {

          if (finished) return;

          finished = true;

          clearTimeout(timeout);

          cleanup();

          reject(
            new Error(
              "JSONP failed."
            )
          );

        };


      script.src =
        DATA_URL +
        "?callback=" +
        encodeURIComponent(
          callbackName
        ) +
        "&t=" +
        Date.now();


      document.body.appendChild(
        script
      );

    }
  );

}



/* =========================================
   NORMALISE

   Timestamp/date fields are intentionally
   NOT included.
========================================= */

function useLoadedData(data) {

  insights =
    data
      .map(normalizeInsight)
      .filter(
        insight =>
          insight &&
          clean(insight.advice)
      );


  initialiseArchive();

}



function normalizeInsight(raw) {

  if (
    !raw ||
    typeof raw !== "object"
  ) {

    return null;

  }


  return {

    role:
      firstValue(
        raw,
        [
          "role",
          "Role",
          "job",
          "Job",
          "jobTitle",
          "Job Title",
          "What do you do?"
        ]
      ),


    workingAs:
      firstValue(
        raw,
        [
          "workingAs",
          "working as",
          "Working As",
          "employment",
          "Employment",
          "How do you currently work?"
        ]
      ),


    experience:
      firstValue(
        raw,
        [
          "experience",
          "Experience",
          "years",
          "Years",
          "How long have you been working in or around design?"
        ]
      ),


    category:
      firstValue(
        raw,
        [
          "category",
          "Category",
          "topic",
          "Topic",
          "topics",
          "Topics",
          "What is it about?"
        ]
      ),


    advice:
      firstValue(
        raw,
        [
          "advice",
          "Advice",
          "insight",
          "Insight",
          "What is your insight?"
        ]
      ),


    salary:
      firstValue(
        raw,
        [
          "salary",
          "Salary",
          "income",
          "Income"
        ]
      )

  };

}



/* =========================================
   PROPERTY FINDER
========================================= */

function firstValue(
  object,
  names
) {

  for (
    const name
    of names
  ) {

    if (
      Object.prototype
        .hasOwnProperty
        .call(
          object,
          name
        )
    ) {

      const value =
        object[name];


      if (
        value !== null &&
        value !== undefined &&
        clean(value) !== ""
      ) {

        return clean(value);

      }

    }

  }


  const keys =
    Object.keys(object);


  for (
    const wanted
    of names
  ) {

    const matchingKey =
      keys.find(
        item =>
          key(item) ===
          key(wanted)
      );


    if (matchingKey) {

      return clean(
        object[matchingKey]
      );

    }

  }


  return "";

}



/* =========================================
   ERROR
========================================= */

function showError() {

  archiveGrid.innerHTML = `
    <div class="empty-state">
      The archive is temporarily unavailable.
    </div>
  `;


  insightCount.textContent =
    "0";


  featuredInsight.innerHTML = `
    <p class="featured-quote">
      The archive is temporarily unavailable.
    </p>
  `;

}



/* =========================================
   CLEAN
========================================= */

function clean(value) {

  if (
    value === null ||
    value === undefined
  ) {

    return "";

  }


  if (
    Array.isArray(value)
  ) {

    return value
      .map(clean)
      .filter(Boolean)
      .join(", ");

  }


  return String(value).trim();

}



function key(value) {

  return clean(value)
    .toLowerCase()
    .replace(
      /\s+/g,
      " "
    );

}



function same(a, b) {

  return key(a) === key(b);

}



/* =========================================
   TOPICS
========================================= */

const categoryDefinitions = [

  {
    label: "Career",
    terms: [
      "career",
      "careers"
    ]
  },

  {
    label: "Money",
    terms: [
      "money",
      "salary",
      "salaries",
      "rate",
      "rates",
      "income",
      "pricing",
      "fee",
      "fees"
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
    terms: [
      "making"
    ]
  },

  {
    label: "Collaboration",
    terms: [
      "collaboration",
      "collaborating",
      "collaborative"
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



function getCategories(insight) {

  const raw =
    key(insight.category);


  if (!raw) return [];


  const result = [];


  categoryDefinitions.forEach(
    definition => {


      const found =
        definition.terms.some(
          term =>
            containsTerm(
              raw,
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



/* =========================================
   WORK TYPE
========================================= */

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
      "academia",
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


  if (!raw) return [];


  const result = [];


  workingDefinitions.forEach(
    definition => {


      const found =
        definition.terms.some(
          term =>
            raw.includes(term)
        );


      if (found) {

        result.push(
          definition.label
        );

      }

    }
  );


  return unique(result);

}



/* =========================================
   HELPERS
========================================= */

function containsTerm(
  text,
  term
) {

  const expression =
    new RegExp(
      `(^|[\\s,;|/&+])${escapeRegExp(term)}(?=$|[\\s,;|/&+])`,
      "i"
    );


  return expression.test(text);

}



function unique(values) {

  const used = new Set();

  const result = [];


  values.forEach(
    value => {


      const cleaned =
        clean(value);

      const normalized =
        key(cleaned);


      if (
        cleaned &&
        !used.has(normalized)
      ) {

        used.add(normalized);

        result.push(cleaned);

      }

    }
  );


  return result;

}



/* =========================================
   FILTER DATA
========================================= */

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



function countCategory(category) {

  if (
    category === "ALL"
  ) {

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

  if (
    type === "ALL"
  ) {

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



/* =========================================
   BUILD FILTERS
========================================= */

function createCategoryFilters() {

  categoryFilters.innerHTML = "";


  addFilter({
    container: categoryFilters,
    label: "all",
    value: "ALL",
    type: "category",
    count: insights.length
  });


  getAvailableCategories()
    .forEach(
      category => {

        addFilter({
          container: categoryFilters,
          label: category.toLowerCase(),
          value: category,
          type: "category",
          count: countCategory(category)
        });

      }
    );

}



function createWorkingFilters() {

  const types =
    getAvailableWorkingTypes();


  if (!types.length) {

    workingFilterArea.classList.add(
      "hidden"
    );

    return;

  }


  workingFilterArea.classList.remove(
    "hidden"
  );


  workingFilters.innerHTML = "";


  addFilter({
    container: workingFilters,
    label: "all",
    value: "ALL",
    type: "working",
    count: insights.length
  });


  types.forEach(
    type => {

      addFilter({
        container: workingFilters,
        label: type.toLowerCase(),
        value: type,
        type: "working",
        count: countWorking(type)
      });

    }
  );

}



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


  button.type = "button";

  button.className = "filter";


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


  container.appendChild(
    button
  );

}



/* =========================================
   FILTER RESULTS
========================================= */

function getFilteredInsights() {

  return insights.filter(
    insight => {


      const categories =
        getCategories(insight);


      const workingTypes =
        getWorkingTypes(insight);


      const categoryMatch =
        selectedCategory === "ALL"
        ||
        categories.some(
          category =>
            same(
              category,
              selectedCategory
            )
        );


      const workingMatch =
        selectedWorkingAs === "ALL"
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



/* =========================================
   TEXT LENGTH
========================================= */

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



/* =========================================
   ARCHIVE CARDS
========================================= */

function displayArchive() {

  const filtered =
    getFilteredInsights();


  archiveGrid.innerHTML = "";

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
    insight => {


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
                ${escapeHTML(
                  category.toLowerCase()
                )}
              </span>
            `
          )
          .join("");


      const role =
        clean(insight.role);

      const salary =
        clean(insight.salary);

      const experience =
        clean(insight.experience);

      const working =
        workingTypes.join(" / ");


      const secondaryParts = [];


      if (working) {

        secondaryParts.push(
          working
        );

      }


      if (experience) {

        secondaryParts.push(
          experience +
          " in practice"
        );

      }


      card.innerHTML = `

        <div class="card-advice-area">

          <p class="card-advice">
            “${escapeHTML(
              insight.advice
            )}”
          </p>

        </div>


        <div class="card-info">

          <div class="card-meta">

            ${
              role
                ? `
                  <div class="card-role">
                    ${escapeHTML(role)}
                  </div>
                `
                : ""
            }

            ${
              secondaryParts.length
                ? `
                  <div class="card-working">
                    ${escapeHTML(
                      secondaryParts.join(
                        " · "
                      )
                    )}
                  </div>
                `
                : ""
            }

            ${
              salary
                ? `
                  <div class="card-salary">
                    ${escapeHTML(salary)}
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


  const workingTypes =
    getWorkingTypes(insight);


  const categories =
    getCategories(insight);


  const metaParts = [];


  if (insight.role) {

    metaParts.push(
      insight.role
    );

  }


  if (workingTypes.length) {

    metaParts.push(
      workingTypes.join(" / ")
    );

  }


  if (insight.experience) {

    metaParts.push(
      insight.experience +
      " in practice"
    );

  }


  if (insight.salary) {

    metaParts.push(
      insight.salary
    );

  }


  const categoryHTML =
    categories
      .map(
        category => `
          <span class="featured-category">
            ${escapeHTML(
              category.toLowerCase()
            )}
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

    ${
      metaParts.length
        ? `
          <div class="featured-meta">
            ${escapeHTML(
              metaParts.join(" · ")
            )}
          </div>
        `
        : ""
    }

    ${
      categories.length
        ? `
          <div class="featured-categories">
            ${categoryHTML}
          </div>
        `
        : ""
    }

  `;

}



/* =========================================
   BUTTONS
========================================= */

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


anotherButton.addEventListener(
  "click",
  showRandomInsight
);



/* =========================================
   HELPERS
========================================= */

function splitFallback(value) {

  return clean(value)
    .split(
      /\s*(?:,|;|\||&|\+|\band\b)\s*/i
    )
    .map(
      item => clean(item)
    )
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
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");

}



/* =========================================
   START
========================================= */

function initialiseArchive() {

  createCategoryFilters();

  createWorkingFilters();

  displayArchive();

  showRandomInsight();

}


loadInsights();
