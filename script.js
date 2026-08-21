let currentCategory = "ALL";

const archiveGrid = document.getElementById("archive-grid");
const insightCount = document.getElementById("insight-count");
const featuredInsight = document.getElementById("featured-insight");
const anotherButton = document.getElementById("another-button");


// -----------------------------------------
// DISPLAY ARCHIVE
// -----------------------------------------

function displayArchive(category = "ALL") {

  currentCategory = category;

  let filteredInsights = insights;

  if (category !== "ALL") {
    filteredInsights = insights.filter(
      insight => insight.category === category
    );
  }

  archiveGrid.innerHTML = "";

  insightCount.textContent = filteredInsights.length;

  filteredInsights.forEach((insight, index) => {

    const card = document.createElement("article");

    card.className = "insight-card";

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
          ${insight.experience} in practice
        </div>

        <div class="card-category">
          ${insight.category}
        </div>
      </div>
    `;

    archiveGrid.appendChild(card);

  });
}


// -----------------------------------------
// FEATURED INSIGHT
// -----------------------------------------

function showRandomInsight() {

  const randomIndex = Math.floor(
    Math.random() * insights.length
  );

  const insight = insights[randomIndex];

  featuredInsight.innerHTML = `
    <p class="quote">
      “${insight.advice}”
    </p>

    <p class="meta">
      ${insight.role} · ${insight.experience} in practice
    </p>
  `;
}


anotherButton.addEventListener(
  "click",
  showRandomInsight
);


// -----------------------------------------
// FILTERS
// -----------------------------------------

const filters = document.querySelectorAll(".filter");

filters.forEach(filter => {

  filter.addEventListener("click", () => {

    filters.forEach(button => {
      button.classList.remove("active");
    });

    filter.classList.add("active");

    const category = filter.dataset.category;

    displayArchive(category);

  });

});


// -----------------------------------------
// INITIALISE
// -----------------------------------------

displayArchive();

showRandomInsight();
