Olympic-Art — fonts folder

The site uses two weights of the Barlow family:
  - Barlow Condensed  (headings, buttons, statistics)
  - Barlow            (body text)

They are loaded from Google Fonts in the <head> of every page.
If the project has to work without an internet connection, download the
.woff2 files into this folder and replace the Google Fonts <link> with a
@font-face rule in styles/style.css. The stylesheet already falls back to
Segoe UI / Arial when Barlow is unavailable.
