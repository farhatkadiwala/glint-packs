# Glint Packs

A card pack you tear open. Drag along the top strip (or press Enter), watch the burst, then hover the five cards.

Live: https://glint-packs.vercel.app

Single `index.html`; the mascots are rendered with Three.js at load.

## Structure

```
index.html        page shell, import map for Three.js
css/style.css     pack, card, face and button styles
js/main.js        layout, pack tear, cards, particles, main loop
js/data.js        pack colours and the five characters
js/mascots.js     Three.js models, rendered once to images
js/faces.js       SVG faces and expressions
js/motion.js      springs, easing, helpers
assets/           favicon
```

Run locally: `python3 -m http.server` in this folder, then open http://localhost:8000.
