# Olympic-Art Taekwondo Club — athlete management website

Final project for **Bazat e WEB-it / WEB-i Interaktiv**, September 2026.
Topic chosen from the list: **13. Menaxhimi i Ekipit Sportiv** (sports team management).

Built with HTML5, CSS3, JavaScript, Bootstrap 5, Local Storage and the Fetch API.
No frameworks, no build step, no backend — open `index.html` in a browser and it runs.

---

## Folder structure

```
olympic-art/
├── index.html              Home page / dashboard
├── pages/
│   ├── players.html        Athlete management (form, search, filters, delete)
│   └── api.html            Fetch API page
├── assets/
│   ├── images/
│   │   └── olympic-art-logo.jpg   Official club logo, used exactly as provided
│   └── fonts/README.txt
├── styles/style.css        All custom CSS
├── scripts/script.js       All JavaScript
└── README.md
```

---

## Requirement audit

### Mandatory requirements (WEB-i Interaktiv PDF)

| # | Requirement | Done | Where |
|---|---|---|---|
| 1 | Minimum 2 HTML pages | YES | `index.html`, `pages/players.html`, `pages/api.html` (3 pages) |
| 2 | DOM manipulation | YES | `script.js` — `buildAthleteCard()`, `renderAthleteList()`, `renderCategoryTable()`, `buildProductCard()` |
| 3 | Event listeners | YES | `script.js` §10 — submit, input, change, click, delegated delete |
| 4 | Fetch API | YES | `script.js` §9 — `fetchProducts()`, page `pages/api.html` |
| 5 | Form validation | YES | `script.js` §7 — `validateAthleteForm()` and the individual rules |
| 6 | Responsive design (desktop + mobile) | YES | `style.css` §13 — media queries at 991px and 575px |
| 7 | Local Storage | YES | `script.js` §2 — key `olympicArtAthletes` |
| 8 | Register + delete players via Local Storage | YES | `handleFormSubmit()`, `deleteAthlete()` |
| 9 | Search players by different criteria | YES | `getVisibleAthletes()` — name, email, phone + category, belt, status, age |
| 10 | API page with `https://dummyjson.com/products/limit=10` | YES | `pages/api.html`, `REQUIRED_API_URL` in `script.js` |

### HTML / CSS requirements (Bazat e WEB-it PDF)

| Requirement | Done | Where |
|---|---|---|
| `<html>`, `<head>`, `<body>` structure | YES | all three pages |
| Headings `<h1>`–`<h3>` | YES | hero, section heads, card titles |
| Paragraphs, lists `<ul>`/`<li>` | YES | About section, athlete card details, footer nav |
| Text formatting `<strong>`, `<em>` | YES | About section, navbar brand, API page intro |
| Links `<a>` for navigation | YES | navbar, footer, quick actions |
| Images `<img>` | YES | logo in navbar/hero/footer, product thumbnails |
| Tables `<table>`, `<tr>`, `<th>`, `<td>` | YES | "Athletes by category" table on `index.html` |
| Forms `<form>`, `<input>`, `<select>`, `<textarea>` | YES | registration form on `pages/players.html` |
| Semantic HTML5 tags | YES | `<header> <nav> <main> <section> <article> <footer>` — `<article>` is also created by JS for every card |
| External CSS file | YES | `styles/style.css` |
| Selectors: element, class, id | YES | `body`, `.athlete-card`, `#productGrid` etc. |
| Colours and backgrounds (hex + rgba) | YES | `:root` variables and section backgrounds |
| Text properties | YES | `font-family`, `font-weight`, `font-size`, `letter-spacing`, `text-align` |
| Box model | YES | `width`, `height`, `padding`, `border`, `margin` on cards, form, toolbar |
| Positioning | YES | `position: sticky` (navbar), `position: absolute` (hero decoration), `relative` |
| Flexbox **and** Grid | YES | Flexbox: navbar, hero, cards, toolbar. Grid: stats, card grid, product grid, footer |
| Media queries | YES | `style.css` §13 |
| Bootstrap 5 | YES | navbar + collapse, grid `row/col`, form classes, alert, modal, spinner |
| Folder structure (`assets/`, `assets/images`, `assets/fonts`, `styles/`, `scripts/`, `pages/`) | YES | see above |

---

## How the JavaScript is organised

`scripts/script.js` is one file split into ten numbered sections:

1. Constants and helpers — storage key, API URLs, `calculateAge()`, `formatDate()`
2. Local Storage layer — `getAthletes()`, `saveAthletes()`, first-visit example data
3. Statistics — `calculateStatistics()`
4. Home page — dashboard numbers, featured athletes, category table
5. Athletes page — building cards with `document.createElement`
6. Search and filters — `getVisibleAthletes()`, `resetFilters()`
7. Validation and saving — one small function per rule, then `handleFormSubmit()`
8. Deleting — confirmation modal, then `deleteAthlete()`
9. API page — `fetchProducts()`, `loadApiData()`, loading and error states
10. Start-up — every `addEventListener()` call lives here

---

## Note about the API endpoint

The requirements give this address:

```
https://dummyjson.com/products/limit=10
```

dummyjson reads everything after `/products/` as a product **id**, so that exact
address answers with **404 Not Found**. The page therefore:

1. calls the required address first, exactly as written in the requirements;
2. when it returns 404, calls `https://dummyjson.com/products?limit=10`, which is
   the query-string form of the same endpoint, and shows a short note explaining why;
3. if both fail (no internet), hides the loader and shows an error box with a retry button.

The **Test a failed request** button on the page forces the error path on purpose,
so the error handling can be demonstrated during the presentation.

---

## Quick test script

1. Open `index.html` — six example athletes are written into Local Storage on the first visit.
2. Go to **Athletes**, press **Save athlete** with an empty form — every field shows a message.
3. Type `12` as phone and `abc` as email — both are rejected.
4. Fill everything correctly and save — success message, form clears, card appears.
5. Refresh — the athlete is still there (Local Storage).
6. Search for the name, then combine it with the category filter.
7. Press **Reset filters**.
8. Press **Remove** on a card, confirm in the dialog, refresh — it stays deleted.
9. Open **Team data** — loader, then ten product cards from the API.
10. Press **Test a failed request** — error box appears; **Try again** brings the data back.

To start from an empty roster, run `localStorage.removeItem("olympicArtAthletes")`
in the browser console and refresh.
