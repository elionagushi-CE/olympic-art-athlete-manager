/* ==========================================================================
   Olympic-Art Taekwondo Club — main JavaScript file
   Contents:
   1.  Constants and small helpers
   2.  Local Storage layer (read / write / seed)
   3.  Statistics used by the dashboard
   4.  Home page: stats, featured athletes, category table
   5.  Athletes page: rendering the roster
   6.  Athletes page: search and filters
   7.  Athletes page: form validation and saving
   8.  Athletes page: deleting an athlete
   9.  API page: Fetch API with loading and error handling
   10. Start-up (runs the code that belongs to the current page)
   ========================================================================== */

"use strict";


/* ================= 1. CONSTANTS AND SMALL HELPERS ======================= */

/** The single key used for everything this site stores in the browser. */
const STORAGE_KEY = "olympicArtAthletes";

/** The endpoint the project requirements ask for, plus the corrected form. */
const REQUIRED_API_URL = "https://dummyjson.com/products/limit=10";
const FALLBACK_API_URL = "https://dummyjson.com/products?limit=10";

/** Short helper so the code below reads more easily. */
function $(selector) {
  return document.querySelector(selector);
}

/** Creates an element, and optionally sets its class and its text. */
function createEl(tag, className, text) {
  const element = document.createElement(tag);
  if (className) element.className = className;
  if (text !== undefined) element.textContent = text;
  return element;
}

/** Calculates the age in full years from a date of birth (yyyy-mm-dd). */
function calculateAge(birthDate) {
  const birth = new Date(birthDate);
  const today = new Date();

  let age = today.getFullYear() - birth.getFullYear();
  const monthDifference = today.getMonth() - birth.getMonth();

  // The birthday has not happened yet this year, so subtract one year.
  if (monthDifference < 0 || (monthDifference === 0 && today.getDate() < birth.getDate())) {
    age = age - 1;
  }
  return age;
}

/** Turns 2026-03-14 into 14.03.2026 for display. */
function formatDate(dateString) {
  const date = new Date(dateString);
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  return day + "." + month + "." + date.getFullYear();
}

/** Builds the initials shown in the round badge of an athlete card. */
function getInitials(firstName, lastName) {
  return (firstName.charAt(0) + lastName.charAt(0)).toUpperCase();
}


/* ==================== 2. LOCAL STORAGE LAYER ============================ */

/** Reads all athletes from Local Storage and returns an array. */
function getAthletes() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];
    const parsed = JSON.parse(stored);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.error("Local Storage could not be read:", error);
    return [];
  }
}

/** Writes the whole array of athletes back into Local Storage. */
function saveAthletes(athletes) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(athletes));
    return true;
  } catch (error) {
    console.error("Local Storage could not be written:", error);
    return false;
  }
}

/**
 * The first time the site is opened there is nothing in Local Storage,
 * so a few example athletes are written in. Once the key exists this
 * function does nothing, and an empty roster stays empty.
 */
function seedAthletesOnFirstVisit() {
  if (localStorage.getItem(STORAGE_KEY) !== null) return;

  const starterAthletes = [
    {
      id: "seed-1", firstName: "Elion", lastName: "Krasniqi", birthDate: "2004-05-18",
      phone: "+383 44 111 222", email: "elion.krasniqi@example.com",
      team: "Seniors", position: "Kyorugi", belt: "Black", status: "Active",
      notes: "Trains Monday, Wednesday and Friday.", createdAt: "2026-09-01T09:00:00.000Z"
    },
    {
      id: "seed-2", firstName: "Arta", lastName: "Berisha", birthDate: "2013-11-02",
      phone: "+383 45 333 444", email: "arta.berisha@example.com",
      team: "Cadets", position: "Poomsae", belt: "Red", status: "Active",
      notes: "", createdAt: "2026-09-01T09:05:00.000Z"
    },
    {
      id: "seed-3", firstName: "Drin", lastName: "Gashi", birthDate: "2010-02-24",
      phone: "+383 49 555 666", email: "drin.gashi@example.com",
      team: "Juniors", position: "Team captain", belt: "Blue", status: "Active",
      notes: "Leads the warm-up for the junior group.", createdAt: "2026-09-01T09:10:00.000Z"
    },
    {
      id: "seed-4", firstName: "Rina", lastName: "Hoxha", birthDate: "1996-07-09",
      phone: "+383 44 777 888", email: "rina.hoxha@example.com",
      team: "Adults", position: "Assistant coach", belt: "Black", status: "Active",
      notes: "", createdAt: "2026-09-01T09:15:00.000Z"
    },
    {
      id: "seed-5", firstName: "Blend", lastName: "Morina", birthDate: "2014-03-30",
      phone: "+383 43 999 000", email: "blend.morina@example.com",
      team: "Cadets", position: "Competitor", belt: "Green", status: "Inactive",
      notes: "Paused because of school exams.", createdAt: "2026-09-01T09:20:00.000Z"
    },
    {
      id: "seed-6", firstName: "Erza", lastName: "Rexhepi", birthDate: "2002-12-12",
      phone: "+383 44 123 456", email: "erza.rexhepi@example.com",
      team: "Seniors", position: "Poomsae", belt: "Yellow", status: "Active",
      notes: "", createdAt: "2026-09-01T09:25:00.000Z"
    }
  ];

  saveAthletes(starterAthletes);
}


/* ================ 3. STATISTICS USED BY THE DASHBOARD =================== */

/** Works out the four dashboard numbers from the stored athletes. */
function calculateStatistics(athletes) {
  const activeAthletes = athletes.filter(function (athlete) {
    return athlete.status === "Active";
  });

  // A Set keeps every category only once, so its size is the number of categories.
  const categories = new Set(athletes.map(function (athlete) { return athlete.team; }));

  let averageAge = 0;
  if (athletes.length > 0) {
    const sumOfAges = athletes.reduce(function (sum, athlete) {
      return sum + calculateAge(athlete.birthDate);
    }, 0);
    averageAge = Math.round(sumOfAges / athletes.length);
  }

  return {
    total: athletes.length,
    active: activeAthletes.length,
    categories: categories.size,
    averageAge: averageAge
  };
}


/* ======================= 4. HOME PAGE =================================== */

/** Writes the four statistic values into the dashboard. */
function renderDashboardStatistics() {
  const totalBox = $("#statTotal");
  if (!totalBox) return;                     // not on the home page

  const stats = calculateStatistics(getAthletes());

  totalBox.textContent = stats.total;
  $("#statActive").textContent = stats.active;
  $("#statTeams").textContent = stats.categories;
  $("#statAvgAge").textContent = stats.averageAge;
}

/** Shows the six most recently added athletes on the home page. */
function renderFeaturedAthletes() {
  const container = $("#featuredAthletes");
  if (!container) return;

  const emptyNote = $("#featuredEmpty");
  const athletes = getAthletes().slice().reverse().slice(0, 6);

  container.innerHTML = "";                  // DOM manipulation: clear the old cards

  if (athletes.length === 0) {
    emptyNote.hidden = false;
    return;
  }
  emptyNote.hidden = true;

  athletes.forEach(function (athlete) {
    container.appendChild(buildAthleteCard(athlete, false));
  });
}

/** Fills the "Athletes by category" table with rows built in JavaScript. */
function renderCategoryTable() {
  const tableBody = $("#categoryTableBody");
  if (!tableBody) return;

  const athletes = getAthletes();
  const categories = ["Cadets", "Juniors", "Seniors", "Adults"];

  tableBody.innerHTML = "";

  categories.forEach(function (category) {
    const inCategory = athletes.filter(function (a) { return a.team === category; });
    const activeInCategory = inCategory.filter(function (a) { return a.status === "Active"; });

    const row = document.createElement("tr");
    const nameCell = createEl("th", null, category);
    nameCell.setAttribute("scope", "row");

    row.appendChild(nameCell);
    row.appendChild(createEl("td", null, String(inCategory.length)));
    row.appendChild(createEl("td", null, String(activeInCategory.length)));
    tableBody.appendChild(row);
  });

  // Last row: the totals for the whole club.
  const totalRow = document.createElement("tr");
  const totalLabel = createEl("th", null, "Total");
  totalLabel.setAttribute("scope", "row");
  totalRow.appendChild(totalLabel);
  totalRow.appendChild(createEl("td", null, String(athletes.length)));
  totalRow.appendChild(createEl("td", null, String(
    athletes.filter(function (a) { return a.status === "Active"; }).length
  )));
  tableBody.appendChild(totalRow);
}


/* ============ 5. ATHLETES PAGE: RENDERING THE ROSTER ==================== */

/**
 * Builds one athlete card with document.createElement.
 * withDeleteButton is false on the home page, where cards are read-only.
 */
function buildAthleteCard(athlete, withDeleteButton) {
  const age = calculateAge(athlete.birthDate);

  const card = createEl("article", "athlete-card");

  /* --- head: name, role and initials --- */
  const head = createEl("div", "athlete-card-head");
  const nameBox = createEl("div");
  nameBox.appendChild(createEl("h3", "athlete-name", athlete.firstName + " " + athlete.lastName));
  nameBox.appendChild(createEl("p", "athlete-role", athlete.position + " · " + athlete.team));
  head.appendChild(nameBox);
  head.appendChild(createEl("span", "athlete-initials", getInitials(athlete.firstName, athlete.lastName)));
  card.appendChild(head);

  /* --- details list --- */
  const details = [
    ["Date of birth", formatDate(athlete.birthDate)],
    ["Age", age + " years"],
    ["Belt", athlete.belt],
    ["Phone", athlete.phone],
    ["Email", athlete.email]
  ];

  const list = createEl("ul", "athlete-meta");
  details.forEach(function (pair) {
    const item = document.createElement("li");
    item.appendChild(createEl("span", "meta-key", pair[0]));
    item.appendChild(createEl("span", "meta-value", pair[1]));
    list.appendChild(item);
  });
  card.appendChild(list);

  if (athlete.notes) {
    card.appendChild(createEl("p", "athlete-note", athlete.notes));
  }

  /* --- foot: status badge and delete button --- */
  const foot = createEl("div", "athlete-card-foot");
  const statusClass = athlete.status === "Active" ? "badge-oa badge-active" : "badge-oa badge-inactive";
  foot.appendChild(createEl("span", statusClass, athlete.status));

  if (withDeleteButton) {
    const deleteButton = createEl("button", "btn-delete", "Remove");
    deleteButton.type = "button";
    deleteButton.dataset.id = athlete.id;      // the id travels with the button
    deleteButton.setAttribute(
      "aria-label",
      "Remove " + athlete.firstName + " " + athlete.lastName + " from the roster"
    );
    foot.appendChild(deleteButton);
  }

  card.appendChild(foot);
  return card;
}

/** Draws the roster after search and filters have been applied. */
function renderAthleteList() {
  const list = $("#athleteList");
  if (!list) return;                         // not on the athletes page

  const athletes = getVisibleAthletes();
  const emptyMessage = $("#emptyMessage");
  const counter = $("#resultCount");

  list.innerHTML = "";                       // DOM manipulation: start from an empty list

  athletes.forEach(function (athlete) {
    list.appendChild(buildAthleteCard(athlete, true));
  });

  counter.textContent = athletes.length === 1 ? "1 athlete" : athletes.length + " athletes";

  if (athletes.length === 0) {
    emptyMessage.hidden = false;
    emptyMessage.textContent = getAthletes().length === 0
      ? "The roster is empty. Use the form above to register the first athlete."
      : "No athlete matches this search and these filters.";
  } else {
    emptyMessage.hidden = true;
  }
}


/* ============ 6. ATHLETES PAGE: SEARCH AND FILTERS ====================== */

/**
 * Applies the search text and all four filters together and returns
 * only the athletes that should be visible.
 */
function getVisibleAthletes() {
  const searchTerm = $("#searchInput").value.trim().toLowerCase();
  const teamFilter = $("#filterTeam").value;
  const beltFilter = $("#filterBelt").value;
  const statusFilter = $("#filterStatus").value;
  const ageFilter = $("#filterAge").value;

  return getAthletes().slice().reverse().filter(function (athlete) {

    // 1. Search on first name, last name, full name, email and phone.
    const fullName = (athlete.firstName + " " + athlete.lastName).toLowerCase();
    const searchable = fullName + " " + athlete.email.toLowerCase() + " " + athlete.phone.toLowerCase();
    const matchesSearch = searchTerm === "" || searchable.indexOf(searchTerm) !== -1;

    // 2. The three simple dropdown filters.
    const matchesTeam = teamFilter === "all" || athlete.team === teamFilter;
    const matchesBelt = beltFilter === "all" || athlete.belt === beltFilter;
    const matchesStatus = statusFilter === "all" || athlete.status === statusFilter;

    // 3. The age range filter, for example "14-17".
    let matchesAge = true;
    if (ageFilter !== "all") {
      const range = ageFilter.split("-");
      const age = calculateAge(athlete.birthDate);
      matchesAge = age >= Number(range[0]) && age <= Number(range[1]);
    }

    return matchesSearch && matchesTeam && matchesBelt && matchesStatus && matchesAge;
  });
}

/** Puts the toolbar back to its starting state. */
function resetFilters() {
  $("#searchInput").value = "";
  $("#filterTeam").value = "all";
  $("#filterBelt").value = "all";
  $("#filterStatus").value = "all";
  $("#filterAge").value = "all";
  renderAthleteList();
}


/* ========= 7. ATHLETES PAGE: FORM VALIDATION AND SAVING ================= */

/** Shows a red message under one field and marks the input. */
function showFieldError(fieldId, message) {
  const input = document.getElementById(fieldId);
  const errorBox = document.getElementById(fieldId + "Error");

  input.classList.add("input-invalid");
  input.setAttribute("aria-invalid", "true");
  errorBox.textContent = message;
  errorBox.hidden = false;
}

/** Removes the error message from one field. */
function clearFieldError(fieldId) {
  const input = document.getElementById(fieldId);
  const errorBox = document.getElementById(fieldId + "Error");

  input.classList.remove("input-invalid");
  input.removeAttribute("aria-invalid");
  errorBox.textContent = "";
  errorBox.hidden = true;
}

/* --- the individual rules, each returns "" when the value is correct --- */

function validateName(value, label) {
  const namePattern = /^[A-Za-zÇçËëÀ-ÿ' -]{2,30}$/;
  if (value === "") return label + " is required.";
  if (!namePattern.test(value)) return label + " must be 2 to 30 letters, without numbers.";
  return "";
}

function validateBirthDate(value) {
  if (value === "") return "Date of birth is required.";

  const birth = new Date(value);
  if (isNaN(birth.getTime())) return "Please enter a valid date.";
  if (birth > new Date()) return "The date of birth cannot be in the future.";

  const age = calculateAge(value);
  if (age < 4) return "Athletes must be at least 4 years old.";
  if (age > 90) return "Please check the date, the age looks too high.";
  return "";
}

function validatePhone(value) {
  if (value === "") return "Phone number is required.";

  // Spaces, dashes and brackets are allowed while typing, so remove them first.
  const digitsOnly = value.replace(/[\s\-()]/g, "");
  const phonePattern = /^\+?[0-9]{8,15}$/;

  if (!phonePattern.test(digitsOnly)) {
    return "Enter 8 to 15 digits, for example +383 44 123 456.";
  }
  return "";
}

function validateEmail(value) {
  if (value === "") return "Email is required.";

  const emailPattern = /^[^\s@]+@[^\s@]+\.[A-Za-z]{2,}$/;
  if (!emailPattern.test(value)) {
    return "Enter a valid email, for example athlete@example.com.";
  }
  return "";
}

function validateSelect(value, label) {
  if (value === "") return "Please choose a " + label + ".";
  return "";
}

/**
 * Checks the whole form. Every message is shown at once, and the id of the
 * first field with a problem is returned so it can be focused.
 */
function validateAthleteForm(values) {
  const problems = [
    ["firstName", validateName(values.firstName, "First name")],
    ["lastName", validateName(values.lastName, "Last name")],
    ["birthDate", validateBirthDate(values.birthDate)],
    ["phone", validatePhone(values.phone)],
    ["email", validateEmail(values.email)],
    ["team", validateSelect(values.team, "category")],
    ["position", validateSelect(values.position, "role")],
    ["belt", validateSelect(values.belt, "belt")],
    ["status", validateSelect(values.status, "status")]
  ];

  let firstInvalidField = null;

  problems.forEach(function (problem) {
    const fieldId = problem[0];
    const message = problem[1];

    if (message === "") {
      clearFieldError(fieldId);
    } else {
      showFieldError(fieldId, message);
      if (firstInvalidField === null) firstInvalidField = fieldId;
    }
  });

  return firstInvalidField;                  // null means the form is valid
}

/** Reads every value out of the form. */
function readFormValues() {
  return {
    firstName: $("#firstName").value.trim(),
    lastName: $("#lastName").value.trim(),
    birthDate: $("#birthDate").value,
    phone: $("#phone").value.trim(),
    email: $("#email").value.trim().toLowerCase(),
    team: $("#team").value,
    position: $("#position").value,
    belt: $("#belt").value,
    status: $("#status").value,
    notes: $("#notes").value.trim()
  };
}

/** Shows the green message above the form for a few seconds. */
function showSuccessMessage(text) {
  const box = $("#formSuccess");
  box.textContent = text;
  box.hidden = false;

  window.setTimeout(function () {
    box.hidden = true;
  }, 5000);
}

/** Runs when the form is submitted. */
function handleFormSubmit(event) {
  event.preventDefault();                    // stop the page from reloading

  const values = readFormValues();
  const firstInvalidField = validateAthleteForm(values);

  if (firstInvalidField !== null) {
    document.getElementById(firstInvalidField).focus();
    return;                                  // invalid data is never saved
  }

  // Build the new athlete and add it to what is already stored.
  const newAthlete = Object.assign({}, values, {
    id: "athlete-" + Date.now(),
    createdAt: new Date().toISOString()
  });

  const athletes = getAthletes();
  athletes.push(newAthlete);
  saveAthletes(athletes);                    // Local Storage is updated here

  $("#athleteForm").reset();                 // clear the form
  $("#status").value = "Active";             // sensible default after reset

  renderAthleteList();                       // update the roster
  showSuccessMessage(
    newAthlete.firstName + " " + newAthlete.lastName +
    " was added to the roster and saved in Local Storage."
  );
}


/* ============ 8. ATHLETES PAGE: DELETING AN ATHLETE ===================== */

let athleteIdToDelete = null;                 // remembered while the modal is open

/** Opens the confirmation dialog for one athlete. */
function askForDeleteConfirmation(athleteId) {
  const athlete = getAthletes().find(function (a) { return a.id === athleteId; });
  if (!athlete) return;

  athleteIdToDelete = athleteId;

  const message = "Remove " + athlete.firstName + " " + athlete.lastName +
    " from the roster? The record will also be deleted from Local Storage.";

  // Bootstrap modal when its JavaScript is available, otherwise a plain dialog.
  if (typeof bootstrap !== "undefined" && $("#deleteModal")) {
    $("#deleteModalText").textContent = message;
    bootstrap.Modal.getOrCreateInstance($("#deleteModal")).show();
  } else if (window.confirm(message)) {
    deleteAthlete(athleteId);
  }
}

/** Removes one athlete from Local Storage and redraws the page. */
function deleteAthlete(athleteId) {
  const remaining = getAthletes().filter(function (athlete) {
    return athlete.id !== athleteId;
  });

  saveAthletes(remaining);
  renderAthleteList();                       // the card disappears from the DOM
  athleteIdToDelete = null;
}


/* ========= 9. API PAGE: FETCH WITH LOADING AND ERROR HANDLING =========== */

/** Shows the loading box and hides the other two states. */
function showLoadingState() {
  $("#loadingState").hidden = false;
  $("#errorState").hidden = true;
  $("#apiNote").hidden = true;
  $("#productGrid").innerHTML = "";
}

/** Shows the error box and makes sure the loader is gone. */
function showErrorState(message) {
  $("#loadingState").hidden = true;
  $("#apiNote").hidden = true;
  $("#errorState").hidden = false;
  $("#errorMessage").textContent = message;
}

/** Does one request and returns the array of products it contains. */
async function fetchProducts(url) {
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error("The server answered with status " + response.status + " for " + url);
  }

  const data = await response.json();

  // dummyjson returns { products: [...] } for a list and a single object for one item.
  if (Array.isArray(data.products)) return data.products;
  if (data && data.id) return [data];

  throw new Error("The response did not contain any products.");
}

/** Builds one product card with DOM methods. */
function buildProductCard(product) {
  const card = createEl("article", "product-card");

  if (product.thumbnail) {
    const image = document.createElement("img");
    image.src = product.thumbnail;
    image.alt = product.title;
    image.className = "product-image";
    image.loading = "lazy";
    card.appendChild(image);
  }

  const body = createEl("div", "product-body");
  body.appendChild(createEl("h3", "product-title", product.title));
  body.appendChild(createEl("p", "product-category", product.category || "uncategorised"));

  const description = product.description || "";
  body.appendChild(createEl(
    "p", "product-description",
    description.length > 110 ? description.slice(0, 110) + "…" : description
  ));

  const foot = createEl("div", "product-foot");
  foot.appendChild(createEl("p", "product-price", "$" + product.price));
  foot.appendChild(createEl("span", "product-rating", "Rating " + product.rating));
  body.appendChild(foot);

  card.appendChild(body);
  return card;
}

/** Puts all product cards into the grid. */
function renderProducts(products) {
  const grid = $("#productGrid");
  grid.innerHTML = "";

  products.forEach(function (product) {
    grid.appendChild(buildProductCard(product));
  });
}

/**
 * Loads the data for the page.
 * The endpoint written in the project requirements is tried first. That exact
 * address answers with 404, so the corrected address is used as a second try
 * and a short note explains what happened.
 */
async function loadApiData() {
  showLoadingState();

  try {
    const products = await fetchProducts(REQUIRED_API_URL);
    renderProducts(products);
    $("#loadingState").hidden = true;

  } catch (primaryError) {
    console.warn("First request failed:", primaryError.message);

    try {
      const products = await fetchProducts(FALLBACK_API_URL);
      renderProducts(products);
      $("#loadingState").hidden = true;

      const note = $("#apiNote");
      note.textContent =
        "The address " + REQUIRED_API_URL + " answers with 404, because dummyjson reads " +
        "\"limit=10\" as a product id. The same data was then requested from " +
        FALLBACK_API_URL + ", which is the query-string form of the same endpoint.";
      note.hidden = false;

    } catch (fallbackError) {
      showErrorState(
        fallbackError.message + " Check your internet connection and try again."
      );
    }
  }
}

/** The "Test a failed request" button: one request to an address that does not exist. */
async function loadFromBrokenUrl() {
  showLoadingState();
  try {
    const products = await fetchProducts("https://dummyjson.com/this-endpoint-does-not-exist");
    renderProducts(products);
    $("#loadingState").hidden = true;
  } catch (error) {
    showErrorState(error.message + " This was the deliberate error test.");
  }
}


/* ==================== 10. START-UP (EVENT LISTENERS) ==================== */

/** Home page. */
function initHomePage() {
  if (!$("#statTotal")) return;

  renderDashboardStatistics();
  renderFeaturedAthletes();
  renderCategoryTable();
}

/** Athletes page. */
function initAthletesPage() {
  const form = $("#athleteForm");
  if (!form) return;

  renderAthleteList();

  // Form submission.
  form.addEventListener("submit", handleFormSubmit);

  // Clearing the form also clears every error message.
  $("#clearFormBtn").addEventListener("click", function () {
    ["firstName", "lastName", "birthDate", "phone", "email",
     "team", "position", "belt", "status"].forEach(clearFieldError);
    $("#formSuccess").hidden = true;
  });

  // While the user corrects a field, its error message disappears.
  form.addEventListener("input", function (event) {
    if (event.target.id && document.getElementById(event.target.id + "Error")) {
      clearFieldError(event.target.id);
    }
  });

  // Real-time search.
  $("#searchInput").addEventListener("input", renderAthleteList);

  // Filters.
  $("#filterTeam").addEventListener("change", renderAthleteList);
  $("#filterBelt").addEventListener("change", renderAthleteList);
  $("#filterStatus").addEventListener("change", renderAthleteList);
  $("#filterAge").addEventListener("change", renderAthleteList);
  $("#resetFiltersBtn").addEventListener("click", resetFilters);

  // One listener for every delete button, now and in the future.
  $("#athleteList").addEventListener("click", function (event) {
    const button = event.target.closest(".btn-delete");
    if (button) askForDeleteConfirmation(button.dataset.id);
  });

  // The confirm button inside the modal.
  $("#confirmDeleteBtn").addEventListener("click", function () {
    if (athleteIdToDelete) deleteAthlete(athleteIdToDelete);
    if (typeof bootstrap !== "undefined") {
      bootstrap.Modal.getOrCreateInstance($("#deleteModal")).hide();
    }
  });

  // If the page was opened with #addAthlete, put the cursor in the first field.
  if (window.location.hash === "#addAthlete") {
    $("#firstName").focus({ preventScroll: true });
  }
}

/** API page. */
function initApiPage() {
  if (!$("#productGrid")) return;

  loadApiData();

  $("#reloadBtn").addEventListener("click", loadApiData);
  $("#retryBtn").addEventListener("click", loadApiData);
  $("#simulateErrorBtn").addEventListener("click", loadFromBrokenUrl);
}

/** Everything starts here, once the HTML is ready. */
document.addEventListener("DOMContentLoaded", function () {
  seedAthletesOnFirstVisit();
  initHomePage();
  initAthletesPage();
  initApiPage();
});
