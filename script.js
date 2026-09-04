const DATA_URL =
  "https://script.google.com/macros/s/AKfycbxfHNB1tTeQVdKz5e3aZZrM1cCAIk9lKNYygpDoPFPPP4OnbuRQ7oL410Mv9SeZd-hUHg/exec";


let insights = [];

let selectedCategory = "ALL";
let selectedWorkingAs = "ALL";

let carouselIndex = 0;
let carouselLocked = false;



/* =========================================
   DOM
========================================= */

const libraryGrid =
  document.getElementById(
    "library-grid"
  );

const insightCount =
  document.getElementById(
    "insight-count"
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

const carouselTrack =
  document.getElementById(
    "carousel-track"
  );

const previousButton =
  document.getElementById(
    "previous-button"
  );

const nextButton =
  document.getElementById(
    "next-button"
  );

const hero =
  document.getElementById(
    "top"
  );



/* =========================================
   LOAD DATA
========================================= */

async function loadInsights() {

  try {

    const response =
      await fetch(
        DATA_URL +
        "?t=" +
        Date.now(),
        {
          method: "GET",
          cache: "no-store"
        }
      );


    if (!response.ok) {

      throw new Error(
        "HTTP " +
        response.status
      );

    }


    const text =
      await response.text();


    const parsed =
      parseResponseText(
        text
      );


    const rows =
      extractArray(
        parsed
      );


    if (rows) {

      useLoadedData(
        rows
      );

      return;

    }

  }

  catch (error) {

    console.warn(
      "Fetch failed:",
      error
    );

  }


  try {

    const rows =
      await loadWithJSONP();


    if (rows) {

      useLoadedData(
        rows
      );

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
   PARSE RESPONSE
========================================= */

function parseResponseText(
  text
) {

  const trimmed =
    clean(text);


  if (!trimmed) {
    return null;
  }


  try {

    return JSON.parse(
      trimmed
    );

  }

  catch (error) {
  }


  const match =
    trimmed.match(
      /^[^(]+\(([\s\S]*)\)\s*;?$/
    );


  if (
    match &&
    match[1]
  ) {

    try {

      return JSON.parse(
        match[1]
      );

    }

    catch (error) {

      return null;

    }

  }


  return null;

}



/* =========================================
   EXTRACT ARRAY
========================================= */

function extractArray(
  value
) {

  if (
    Array.isArray(
      value
    )
  ) {

    return value;

  }


  if (
    !value ||
    typeof value !==
      "object"
  ) {

    return null;

  }


  const keys = [
    "data",
    "insights",
    "rows",
    "results",
    "items"
  ];


  for (
    const property
    of keys
  ) {

    if (
      Array.isArray(
        value[property]
      )
    ) {

      return value[
        property
      ];

    }

  }


  return null;

}



/* =========================================
   JSONP
========================================= */

function loadWithJSONP() {

  return new Promise(
    (
      resolve,
      reject
    ) => {


      const callbackName =
        "libraryCallback_" +
        Date.now() +
        "_" +
        Math.floor(
          Math.random() *
          100000
        );


      const script =
        document.createElement(
          "script"
        );


      let finished = false;


      function cleanup() {

        if (
          window[
            callbackName
          ]
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

            if (finished) {
              return;
            }


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


      window[
        callbackName
      ] =
        function(data) {


          if (finished) {
            return;
          }


          finished = true;

          clearTimeout(
            timeout
          );

          cleanup();


          const rows =
            extractArray(
              data
            );


          if (!rows) {

            reject(
              new Error(
                "No data array."
              )
            );

            return;

          }


          resolve(rows);

        };


      script.onerror =
        function() {


          if (finished) {
            return;
          }


          finished = true;

          clearTimeout(
            timeout
          );

          cleanup();


          reject(
            new Error(
              "JSONP failed."
            )
          );

        };


      const separator =
        DATA_URL.includes("?")
          ? "&"
          : "?";


      script.src =
        DATA_URL +
        separator +
        "callback=" +
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
========================================= */

function useLoadedData(
  data
) {

  insights =
    data
      .map(
        normalizeInsight
      )
      .filter(
        item =>
          item &&
          clean(
            item.advice
          )
      );


  initialiseLibrary();

}



function normalizeInsight(
  raw
) {

  if (
    !raw ||
    typeof raw !==
      "object"
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
   PROPERTY LOOKUP
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
        value !==
          undefined &&
        clean(value) !== ""
      ) {

        return clean(
          value
        );

      }

    }

  }


  const keys =
    Object.keys(
      object
    );


  for (
    const wanted
    of names
  ) {

    const match =
      keys.find(
        item =>
          key(item) ===
          key(wanted)
      );


    if (match) {

      return clean(
        object[match]
      );

    }

  }


  return "";

}



/* =========================================
   CLEANING
========================================= */

function clean(
  value
) {

  if (
    value === null ||
    value ===
      undefined
  ) {

    return "";

  }


  if (
    Array.isArray(
      value
    )
  ) {

    return value
      .map(clean)
      .filter(Boolean)
      .join(", ");

  }


  return String(
    value
  ).trim();

}



function key(
  value
) {

  return clean(value)
    .toLowerCase()
    .replace(
      /\s+/g,
      " "
    );

}



function same(
  a,
  b
) {

  return (
    key(a) ===
    key(b)
  );

}



/* =========================================
   CATEGORIES
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
      "income",
      "pricing",
      "fee",
      "fees",
      "rate",
      "rates"
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



function getCategories(
  insight
) {

  const raw =
    key(
      insight.category
    );


  if (!raw) {
    return [];
  }


  const result = [];


  categoryDefinitions
    .forEach(
      definition => {


        const found =
          definition
            .terms
            .some(
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


  return unique(
    result
  );

}



/* =========================================
   WORKING TYPES
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
      "Freelance",

    terms: [
      "freelance",
      "freelancer"
    ]
  },


  {
    label:
      "Studio founder",

    terms: [
      "independent",
      "founder",
      "own studio",
      "studio owner",
      "studio founder"
    ]
  },


  {
    label:
      "Academic / Research",

    terms: [
      "academic",
      "academia",
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



function getWorkingTypes(
  insight
) {

  const raw =
    key(
      insight.workingAs
    );


  if (!raw) {
    return [];
  }


  const result = [];


  workingDefinitions
    .forEach(
      definition => {


        const found =
          definition
            .terms
            .some(
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


  return unique(
    result
  );

}



/* =========================================
   AVAILABLE FILTERS
========================================= */

function getAvailableCategories() {

  const values = [];


  insights.forEach(
    insight => {


      getCategories(
        insight
      ).forEach(
        category =>
          values.push(
            category
          )
      );

    }
  );


  return unique(
    values
  );

}



function getAvailableWorkingTypes() {

  const values = [];


  insights.forEach(
    insight => {


      getWorkingTypes(
        insight
      ).forEach(
        type =>
          values.push(
            type
          )
      );

    }
  );


  return unique(
    values
  );

}



/* =========================================
   COUNTS
========================================= */

function countCategory(
  category
) {

  if (
    category ===
      "ALL"
  ) {

    return insights.length;

  }


  return insights
    .filter(
      insight =>
        getCategories(
          insight
        ).some(
          item =>
            same(
              item,
              category
            )
        )
    )
    .length;

}



function countWorking(
  type
) {

  if (
    type ===
      "ALL"
  ) {

    return insights.length;

  }


  return insights
    .filter(
      insight =>
        getWorkingTypes(
          insight
        ).some(
          item =>
            same(
              item,
              type
            )
        )
    )
    .length;

}



/* =========================================
   FILTERS
========================================= */

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
      .classList
      .add(
        "hidden"
      );

    return;

  }


  workingFilterArea
    .classList
    .remove(
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
          countWorking(
            type
          )

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


  button.type =
    "button";


  button.className =
    "filter";


  const active =

    (
      type ===
        "category" &&
      same(
        value,
        selectedCategory
      )
    )

    ||

    (
      type ===
        "working" &&
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

      displayLibrary();

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
        getCategories(
          insight
        );


      const workingTypes =
        getWorkingTypes(
          insight
        );


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



/* =========================================
   DISPLAY LIBRARY
========================================= */

function displayLibrary() {

  const filtered =
    getFilteredInsights();


  libraryGrid.innerHTML =
    "";


  insightCount.textContent =
    filtered.length;


  if (!filtered.length) {

    libraryGrid.innerHTML = `

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


      card.className =
        "library-card";


      const categories =
        getCategories(
          insight
        );


      const workingTypes =
        getWorkingTypes(
          insight
        );


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
        clean(
          insight.role
        );


      const secondary = [];


      if (
        workingTypes.length
      ) {

        secondary.push(
          workingTypes.join(
            " / "
          )
        );

      }


      if (
        insight.experience
      ) {

        secondary.push(
          insight.experience
        );

      }


      card.innerHTML = `

        <div class="card-advice-area">

          <p
            class="card-advice"
            tabindex="0"
          >
            “${escapeHTML(
              insight.advice
            )}”
          </p>

        </div>


        <div class="card-info">

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
            secondary.length
              ? `
                <div class="card-working">
                  ${escapeHTML(
                    secondary.join(
                      " · "
                    )
                  )}
                </div>
              `
              : ""
          }


          ${
            insight.salary
              ? `
                <div class="card-salary">
                  ${escapeHTML(
                    insight.salary
                  )}
                </div>
              `
              : ""
          }


          <div class="card-category-list">
            ${categoryHTML}
          </div>

        </div>

      `;


      libraryGrid.appendChild(
        card
      );

    }
  );


  requestAnimationFrame(
    initialiseCardOverflow
  );

}



/* =========================================
   CARD OVERFLOW
========================================= */

function initialiseCardOverflow() {

  const areas =
    document.querySelectorAll(
      ".card-advice-area"
    );


  areas.forEach(
    area => {


      const advice =
        area.querySelector(
          ".card-advice"
        );


      if (!advice) {
        return;
      }


      function update() {

        const overflowing =
          advice.scrollHeight >
          advice.clientHeight +
          2;


        area.classList.toggle(
          "has-overflow",
          overflowing
        );


        const atBottom =
          advice.scrollTop +
          advice.clientHeight >=
          advice.scrollHeight -
          3;


        area.classList.toggle(
          "at-bottom",
          atBottom
        );

      }


      advice.addEventListener(
        "scroll",
        update,
        {
          passive: true
        }
      );


      update();

    }
  );

}



/* =========================================
   CAROUSEL
========================================= */

function buildCarousel() {

  carouselTrack.innerHTML =
    "";


  if (!insights.length) {

    carouselTrack.innerHTML = `

      <article class="carousel-slide active">

        <p class="carousel-advice">
          The library is currently empty.
        </p>

      </article>

    `;

    return;

  }


  insights.forEach(
    (
      insight,
      index
    ) => {


      const slide =
        document.createElement(
          "article"
        );


      slide.className =
        "carousel-slide" +
        (
          index === 0
            ? " active"
            : ""
        );


      const workingTypes =
        getWorkingTypes(
          insight
        );


      const meta = [];


      if (
        insight.role
      ) {

        meta.push(
          insight.role
        );

      }


      if (
        workingTypes.length
      ) {

        meta.push(
          workingTypes.join(
            " / "
          )
        );

      }


      if (
        insight.experience
      ) {

        meta.push(
          insight.experience
        );

      }


      slide.innerHTML = `

        <p class="carousel-advice">
          “${escapeHTML(
            insight.advice
          )}”
        </p>

        ${
          meta.length
            ? `
              <div class="carousel-meta">
                ${escapeHTML(
                  meta.join(
                    " · "
                  )
                )}
              </div>
            `
            : ""
        }

      `;


      carouselTrack.appendChild(
        slide
      );

    }
  );

}



/* =========================================
   CAROUSEL MOVEMENT
========================================= */

function moveCarousel(
  direction
) {

  const slides =
    Array.from(
      carouselTrack
        .querySelectorAll(
          ".carousel-slide"
        )
    );


  if (
    carouselLocked ||
    slides.length < 2
  ) {

    return;

  }


  carouselLocked =
    true;


  const current =
    slides[
      carouselIndex
    ];


  if (
    direction === 1
  ) {

    carouselIndex =
      (
        carouselIndex +
        1
      )
      %
      slides.length;

  }

  else {

    carouselIndex =
      (
        carouselIndex -
        1 +
        slides.length
      )
      %
      slides.length;

  }


  const next =
    slides[
      carouselIndex
    ];


  next.classList.remove(
    "active",
    "exit-left"
  );


  next.style.transition =
    "none";


  next.style.transform =
    direction === 1
      ? "translateX(110vw)"
      : "translateX(-110vw)";


  next.style.opacity =
    "0";


  requestAnimationFrame(
    () => {


      requestAnimationFrame(
        () => {


          next.style.transition =
            "";


          next.style.transform =
            "";


          next.style.opacity =
            "";


          if (
            direction === 1
          ) {

            current.classList.add(
              "exit-left"
            );

          }

          else {

            current.style.transform =
              "translateX(110vw)";


            current.style.opacity =
              "0";

          }


          current.classList.remove(
            "active"
          );


          next.classList.add(
            "active"
          );


          setTimeout(
            () => {


              current.classList.remove(
                "exit-left"
              );


              current.style.transform =
                "";


              current.style.opacity =
                "";


              carouselLocked =
                false;

            },

            900
          );

        }
      );

    }
  );

}



nextButton.addEventListener(
  "click",
  () =>
    moveCarousel(
      1
    )
);


previousButton.addEventListener(
  "click",
  () =>
    moveCarousel(
      -1
    )
);



/* =========================================
   MENU TRANSITION
========================================= */

function initialiseHeroMenuTransition() {

  function update() {

    const isMobile =
      window.matchMedia(
        "(max-width: 600px)"
      ).matches;


    if (isMobile) {

      document.body
        .classList
        .add(
          "menu-settled"
        );

      return;

    }


    const trigger =
      hero.offsetHeight -
      170;


    const settled =
      window.scrollY >
      trigger;


    document.body
      .classList
      .toggle(
        "menu-settled",
        settled
      );

  }


  window.addEventListener(
    "scroll",
    update,
    {
      passive: true
    }
  );


  window.addEventListener(
    "resize",
    update
  );


  update();

}



/* =========================================
   LIBRARY SPOTLIGHT
========================================= */

function initialiseLibrarySpotlight() {

  const canHover =
    window.matchMedia(
      "(hover: hover) and (pointer: fine)"
    ).matches;


  if (
    !canHover ||
    !libraryGrid
  ) {

    return;

  }


  libraryGrid.addEventListener(
    "pointerenter",
    event => {


      updateLibrarySpotlight(
        event
      );


      libraryGrid.style.setProperty(
        "--spotlight-opacity",
        "1"
      );

    }
  );


  libraryGrid.addEventListener(
    "pointermove",
    event => {


      updateLibrarySpotlight(
        event
      );

    }
  );


  libraryGrid.addEventListener(
    "pointerleave",
    () => {


      libraryGrid.style.setProperty(
        "--spotlight-opacity",
        "0"
      );

    }
  );

}



function updateLibrarySpotlight(
  event
) {

  const rect =
    libraryGrid
      .getBoundingClientRect();


  const x =
    event.clientX -
    rect.left;


  const y =
    event.clientY -
    rect.top;


  libraryGrid.style.setProperty(
    "--mouse-x",
    `${x}px`
  );


  libraryGrid.style.setProperty(
    "--mouse-y",
    `${y}px`
  );

}



/* =========================================
   CLEAR FILTERS
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

    displayLibrary();

  }
);



/* =========================================
   ERROR
========================================= */

function showError() {

  libraryGrid.innerHTML = `

    <div class="empty-state">
      The library is temporarily unavailable.
    </div>

  `;


  carouselTrack.innerHTML = `

    <article class="carousel-slide active">

      <p class="carousel-advice">
        The library is temporarily unavailable.
      </p>

    </article>

  `;


  insightCount.textContent =
    "0";

}



/* =========================================
   UTILITIES
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


  return expression.test(
    text
  );

}



function unique(
  values
) {

  const seen =
    new Set();


  return values.filter(
    value => {


      const normalized =
        key(
          value
        );


      if (
        !normalized ||
        seen.has(
          normalized
        )
      ) {

        return false;

      }


      seen.add(
        normalized
      );


      return true;

    }
  );

}



function escapeRegExp(
  value
) {

  return String(
    value
  ).replace(
    /[.*+?^${}()|[\]\\]/g,
    "\\$&"
  );

}



function escapeHTML(
  value
) {

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
   INITIALISE
========================================= */

function initialiseLibrary() {

  createCategoryFilters();

  createWorkingFilters();

  displayLibrary();

  buildCarousel();

}



/* =========================================
   START
========================================= */

initialiseHeroMenuTransition();

initialiseLibrarySpotlight();

loadInsights();
