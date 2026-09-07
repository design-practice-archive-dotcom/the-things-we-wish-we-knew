const DATA_URL =
  "https://script.google.com/macros/s/AKfycbxfHNB1tTeQVdKz5e3aZZrM1cCAIk9lKNYygpDoPFPPP4OnbuRQ7oL410Mv9SeZd-hUHg/exec";


let insights = [];

let selectedCategory = "ALL";
let selectedWorkingAs = "ALL";

let carouselIndex = 0;
let carouselLocked = false;

let mobileCarouselTimer = null;
let mobileCarouselHasAdvanced = false;
let mobileCarouselPaused = false;
let mobileCarouselScrollResumeTimer = null;

const MOBILE_FIRST_DELAY = 3000;
const MOBILE_REPEAT_DELAY = 6500;



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

const featureLabel =
  document.querySelector(
    ".feature-label"
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
   TERM MATCHING
========================================= */

function containsTerm(
  source,
  term
) {

  const cleanSource =
    key(source);

  const cleanTerm =
    key(term);


  if (
    !cleanSource ||
    !cleanTerm
  ) {

    return false;

  }


  return cleanSource
    .includes(
      cleanTerm
    );

}



/* =========================================
   UNIQUE VALUES
========================================= */

function unique(
  values
) {

  return [
    ...new Set(
      values.filter(
        Boolean
      )
    )
  ];

}



/* =========================================
   AVAILABLE CATEGORIES
========================================= */

function getAvailableCategories() {

  const result = [];


  categoryDefinitions
    .forEach(
      definition => {


        const count =
          insights.filter(
            insight =>
              getCategories(
                insight
              )
                .includes(
                  definition.label
                )
          ).length;


        if (count > 0) {

          result.push({
            label:
              definition.label,

            count:
              count
          });

        }

      }
    );


  return result;

}



/* =========================================
   AVAILABLE WORKING TYPES
========================================= */

function getAvailableWorkingTypes() {

  const result = [];


  workingDefinitions
    .forEach(
      definition => {


        const count =
          insights.filter(
            insight =>
              getWorkingTypes(
                insight
              )
                .includes(
                  definition.label
                )
          ).length;


        if (count > 0) {

          result.push({
            label:
              definition.label,

            count:
              count
          });

        }

      }
    );


  return result;

}



/* =========================================
   CATEGORY FILTERS
========================================= */

function createCategoryFilters() {

  categoryFilters.innerHTML =
    "";


  const available =
    getAvailableCategories();


  if (
    available.length === 0
  ) {

    categoryFilters
      .parentElement
      .classList
      .add(
        "hidden"
      );

    return;

  }


  categoryFilters
    .parentElement
    .classList
    .remove(
      "hidden"
    );


  createFilterButton(
    categoryFilters,
    "ALL",
    insights.length,
    selectedCategory ===
      "ALL",
    () => {

      selectedCategory =
        "ALL";

      refreshLibrary();

    }
  );


  available.forEach(
    item => {

      createFilterButton(
        categoryFilters,
        item.label,
        item.count,
        selectedCategory ===
          item.label,
        () => {

          selectedCategory =
            item.label;

          refreshLibrary();

        }
      );

    }
  );

}



/* =========================================
   WORKING FILTERS
========================================= */

function createWorkingFilters() {

  workingFilters.innerHTML =
    "";


  const available =
    getAvailableWorkingTypes();


  if (
    available.length === 0
  ) {

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


  createFilterButton(
    workingFilters,
    "ALL",
    insights.length,
    selectedWorkingAs ===
      "ALL",
    () => {

      selectedWorkingAs =
        "ALL";

      refreshLibrary();

    }
  );


  available.forEach(
    item => {

      createFilterButton(
        workingFilters,
        item.label,
        item.count,
        selectedWorkingAs ===
          item.label,
        () => {

          selectedWorkingAs =
            item.label;

          refreshLibrary();

        }
      );

    }
  );

}



/* =========================================
   CREATE FILTER BUTTON
========================================= */

function createFilterButton(
  container,
  label,
  count,
  active,
  onClick
) {

  const button =
    document.createElement(
      "button"
    );


  button.type =
    "button";


  button.className =
    "filter";


  if (active) {

    button.classList.add(
      "active"
    );

  }


  const labelSpan =
    document.createElement(
      "span"
    );


  labelSpan.textContent =
    label;


  const countSpan =
    document.createElement(
      "span"
    );


  countSpan.className =
    "filter-count";


  countSpan.textContent =
    `(${count})`;


  button.appendChild(
    labelSpan
  );


  button.appendChild(
    countSpan
  );


  button.addEventListener(
    "click",
    onClick
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


      const categoryMatch =
        selectedCategory ===
          "ALL" ||
        categories.includes(
          selectedCategory
        );


      const workingMatch =
        selectedWorkingAs ===
          "ALL" ||
        workingTypes.includes(
          selectedWorkingAs
        );


      return (
        categoryMatch &&
        workingMatch
      );

    }
  );

}



/* =========================================
   REFRESH LIBRARY
========================================= */

function refreshLibrary() {

  createCategoryFilters();

  createWorkingFilters();

  displayLibrary();

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

    refreshLibrary();

  }
);



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


  if (
    filtered.length === 0
  ) {

    const empty =
      document.createElement(
        "div"
      );


    empty.className =
      "empty-state";


    empty.textContent =
      "No entries match these filters yet.";


    libraryGrid.appendChild(
      empty
    );


    return;

  }


  filtered.forEach(
    insight => {

      const card =
        createLibraryCard(
          insight
        );


      libraryGrid.appendChild(
        card
      );

    }
  );


  initialiseCardOverflow();

}



/* =========================================
   CREATE LIBRARY CARD
========================================= */

function createLibraryCard(
  insight
) {

  const card =
    document.createElement(
      "article"
    );


  card.className =
    "library-card";


  const adviceArea =
    document.createElement(
      "div"
    );


  adviceArea.className =
    "card-advice-area";


  const advice =
    document.createElement(
      "p"
    );


  advice.className =
    "card-advice";


  advice.tabIndex = 0;


  advice.textContent =
    `“${clean(
      insight.advice
    )}”`;


  adviceArea.appendChild(
    advice
  );


  const info =
    document.createElement(
      "div"
    );


  info.className =
    "card-info";


  const role =
    document.createElement(
      "div"
    );


  role.className =
    "card-role";


  role.textContent =
    clean(
      insight.role
    ) ||
    "Designer";


  info.appendChild(
    role
  );


  const workingTypes =
    getWorkingTypes(
      insight
    );


  const metaParts = [];


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
    clean(
      insight.experience
    )
  ) {

    metaParts.push(
      clean(
        insight.experience
      )
    );

  }


  if (
    metaParts.length
  ) {

    const working =
      document.createElement(
        "div"
      );


    working.className =
      "card-working";


    working.textContent =
      metaParts.join(
        " · "
      );


    info.appendChild(
      working
    );

  }


  if (
    clean(
      insight.salary
    )
  ) {

    const salary =
      document.createElement(
        "div"
      );


    salary.className =
      "card-salary";


    salary.textContent =
      clean(
        insight.salary
      );


    info.appendChild(
      salary
    );

  }


  const categories =
    getCategories(
      insight
    );


  if (
    categories.length
  ) {

    const categoryList =
      document.createElement(
        "div"
      );


    categoryList.className =
      "card-category-list";


    categories.forEach(
      category => {

        const item =
          document.createElement(
            "span"
          );


        item.className =
          "card-category";


        item.textContent =
          category;


        categoryList.appendChild(
          item
        );

      }
    );


    info.appendChild(
      categoryList
    );

  }


  card.appendChild(
    adviceArea
  );


  card.appendChild(
    info
  );


  return card;

}



/* =========================================
   CARD OVERFLOW
========================================= */

function initialiseCardOverflow() {

  const adviceAreas =
    document.querySelectorAll(
      ".card-advice-area"
    );


  adviceAreas.forEach(
    area => {

      const advice =
        area.querySelector(
          ".card-advice"
        );


      if (!advice) {
        return;
      }


      function updateOverflow() {

        const hasOverflow =
          advice.scrollHeight >
          advice.clientHeight +
          2;


        area.classList.toggle(
          "has-overflow",
          hasOverflow
        );


        const atBottom =
          advice.scrollTop +
          advice.clientHeight >=
          advice.scrollHeight -
          2;


        area.classList.toggle(
          "at-bottom",
          atBottom
        );

      }


      advice.addEventListener(
        "scroll",
        updateOverflow,
        {
          passive: true
        }
      );


      updateOverflow();

    }
  );

}



/* =========================================
   ESCAPE HTML
========================================= */

function escapeHTML(
  value
) {

  return clean(value)
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

}/* =========================================
   CAROUSEL
========================================= */

function buildCarousel() {

  carouselTrack.innerHTML =
    "";


  carouselIndex = 0;


  if (!insights.length) {

    carouselTrack.innerHTML = `

      <article class="carousel-slide active">

        <div class="carousel-advice-window">

          <p class="carousel-advice">
            The library is currently empty.
          </p>

        </div>

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

        <div class="carousel-advice-window">

          <p class="carousel-advice">
            “${escapeHTML(
              insight.advice
            )}”
          </p>

        </div>

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


  initialiseMobileCarouselInteractionPause();

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



/* =========================================
   MOBILE CAROUSEL AUTOPLAY
========================================= */

function isMobileCarousel() {

  return window.matchMedia(
    "(max-width: 600px)"
  ).matches;

}



function clearMobileCarouselTimer() {

  if (
    mobileCarouselTimer
  ) {

    clearTimeout(
      mobileCarouselTimer
    );


    mobileCarouselTimer =
      null;

  }

}



function getCarouselSlideCount() {

  return carouselTrack
    .querySelectorAll(
      ".carousel-slide"
    )
    .length;

}



function scheduleMobileCarousel(
  delay
) {

  clearMobileCarouselTimer();


  if (
    !isMobileCarousel() ||
    mobileCarouselPaused ||
    document.hidden ||
    getCarouselSlideCount() < 2
  ) {

    return;

  }


  mobileCarouselTimer =
    setTimeout(
      () => {


        if (
          !isMobileCarousel() ||
          mobileCarouselPaused ||
          document.hidden
        ) {

          return;

        }


        /*
          If an existing slide animation has not
          quite finished yet, wait briefly instead
          of trying to start another transition.
        */

        if (
          carouselLocked
        ) {

          scheduleMobileCarousel(
            1000
          );

          return;

        }


        moveCarousel(
          1
        );


        mobileCarouselHasAdvanced =
          true;


        scheduleMobileCarousel(
          MOBILE_REPEAT_DELAY
        );

      },

      delay
    );

}



function startMobileCarouselAutoplay() {

  clearMobileCarouselTimer();


  mobileCarouselPaused =
    false;


  mobileCarouselHasAdvanced =
    false;


  if (
    !isMobileCarousel()
  ) {

    return;

  }


  scheduleMobileCarousel(
    MOBILE_FIRST_DELAY
  );

}



function resetMobileCarouselAfterManualMove() {

  if (
    !isMobileCarousel()
  ) {

    return;

  }


  mobileCarouselHasAdvanced =
    true;


  mobileCarouselPaused =
    false;


  scheduleMobileCarousel(
    MOBILE_REPEAT_DELAY
  );

}



function pauseMobileCarouselAutoplay() {

  if (
    !isMobileCarousel()
  ) {

    return;

  }


  mobileCarouselPaused =
    true;


  clearMobileCarouselTimer();

}



function resumeMobileCarouselAutoplay() {

  if (
    !isMobileCarousel()
  ) {

    return;

  }


  mobileCarouselPaused =
    false;


  scheduleMobileCarousel(
    MOBILE_REPEAT_DELAY
  );

}



/* =========================================
   PAUSE WHILE READING / SCROLLING
========================================= */

function initialiseMobileCarouselInteractionPause() {

  const adviceWindows =
    carouselTrack
      .querySelectorAll(
        ".carousel-advice-window"
      );


  adviceWindows.forEach(
    adviceWindow => {


      /*
        buildCarousel can run more than once.
        This prevents duplicate listeners.
      */

      if (
        adviceWindow.dataset
          .carouselPauseReady ===
        "true"
      ) {

        return;

      }


      adviceWindow.dataset
        .carouselPauseReady =
        "true";


      adviceWindow.addEventListener(
        "touchstart",
        pauseMobileCarouselAutoplay,
        {
          passive: true
        }
      );


      adviceWindow.addEventListener(
        "touchend",
        resumeMobileCarouselAutoplay,
        {
          passive: true
        }
      );


      adviceWindow.addEventListener(
        "touchcancel",
        resumeMobileCarouselAutoplay,
        {
          passive: true
        }
      );


      adviceWindow.addEventListener(
        "scroll",
        () => {


          if (
            !isMobileCarousel()
          ) {

            return;

          }


          pauseMobileCarouselAutoplay();


          if (
            mobileCarouselScrollResumeTimer
          ) {

            clearTimeout(
              mobileCarouselScrollResumeTimer
            );

          }


          mobileCarouselScrollResumeTimer =
            setTimeout(
              () => {

                resumeMobileCarouselAutoplay();

              },

              1200
            );

        },
        {
          passive: true
        }
      );

    }
  );

}



/* =========================================
   CAROUSEL ARROWS
========================================= */

nextButton.addEventListener(
  "click",
  () => {

    moveCarousel(
      1
    );


    resetMobileCarouselAfterManualMove();

  }
);



previousButton.addEventListener(
  "click",
  () => {

    moveCarousel(
      -1
    );


    resetMobileCarouselAfterManualMove();

  }
);



/* =========================================
   PAGE VISIBILITY
========================================= */

document.addEventListener(
  "visibilitychange",
  () => {


    if (
      document.hidden
    ) {

      clearMobileCarouselTimer();

      return;

    }


    if (
      isMobileCarousel() &&
      !mobileCarouselPaused
    ) {

      scheduleMobileCarousel(
        MOBILE_REPEAT_DELAY
      );

    }

  }
);



/* =========================================
   MOBILE / DESKTOP SWITCH
========================================= */

window.addEventListener(
  "resize",
  () => {


    if (
      isMobileCarousel()
    ) {


      if (
        getCarouselSlideCount() > 1 &&
        !mobileCarouselTimer &&
        !mobileCarouselPaused
      ) {

        scheduleMobileCarousel(
          mobileCarouselHasAdvanced
            ? MOBILE_REPEAT_DELAY
            : MOBILE_FIRST_DELAY
        );

      }

    }


    else {

      clearMobileCarouselTimer();


      mobileCarouselPaused =
        false;

    }

  }
);



/* =========================================
   ALIGN TRAVELLING MENU
========================================= */

function updateHeroMenuAlignment() {

  const isMobile =
    window.matchMedia(
      "(max-width: 600px)"
    ).matches;


  if (
    isMobile ||
    !featureLabel
  ) {

    return;

  }


  const rect =
    featureLabel
      .getBoundingClientRect();


  document.documentElement
    .style
    .setProperty(
      "--hero-menu-left",
      `${rect.left}px`
    );

}



/* =========================================
   MENU TRANSITION
========================================= */

function initialiseHeroMenuTransition() {

  function update() {

    const isMobile =
      window.matchMedia(
        "(max-width: 600px)"
      ).matches;


    updateHeroMenuAlignment();


    if (
      isMobile
    ) {

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


      libraryGrid.style
        .setProperty(
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


      libraryGrid.style
        .setProperty(
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


  libraryGrid.style
    .setProperty(
      "--mouse-x",
      `${x}px`
    );


  libraryGrid.style
    .setProperty(
      "--mouse-y",
      `${y}px`
    );

}



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

      <div class="carousel-advice-window">

        <p class="carousel-advice">
          The library is temporarily unavailable.
        </p>

      </div>

    </article>

  `;


  insightCount.textContent =
    "0";


  clearMobileCarouselTimer();

}



/* =========================================
   INITIALISE
========================================= */

function initialiseLibrary() {

  createCategoryFilters();

  createWorkingFilters();

  displayLibrary();

  buildCarousel();

  startMobileCarouselAutoplay();

}



/* =========================================
   START
========================================= */

updateHeroMenuAlignment();

initialiseHeroMenuTransition();

initialiseLibrarySpotlight();

loadInsights();



/*
  Fonts can slightly change measurements after
  first render, so align again once loaded.
*/

window.addEventListener(
  "load",
  updateHeroMenuAlignment
);
