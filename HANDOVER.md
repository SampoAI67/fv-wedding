# Federica & Valentino — wedding invitation site

A fantasy-epic invitation for Federica & Valentino's wedding (Mon 30 Aug 2027, Ristorante «La Betulla», Serle BS).
It is themed on Tolkien's world but uses no film assets: the doors, the map and the copy are all original.

Stack: **Astro 7 + GSAP (ScrollTrigger, DrawSVG) + Lenis**, static. Dev: preview `fv-wedding`, port **4340**. Copy is in Italian (guest-facing).

## The experience
1. **The gate** (`Gate.astro`, `DoorArt.astro`, `scripts/gate.ts`). Moonlit stone. The engraving draws itself in ithildin silver: two birches (for "La Betulla"), interlocked rings, 7 stars, lavender, and the names in Elder Futhark runes on the arch. "Dite, amici, ed entrate". The guest taps **Mellon** (or just types `mellon`). The runes turn to fire, the stone rumbles and drops dust, the leaves swing inward in 3D, and the camera flies into the light.
2. **Dawn hero** (`Hero.astro`, `scripts/hero.ts`). The Higgsfield landscape with god-rays, drifting mist, pollen and the names. Scrolling rises into the clouds.
3. **The map journey** (`Journey.astro`, `data/map.ts`, `scripts/journey.ts`). A generated hand-inked map, "La Terra di Federica e Valentino". The section pins and the scroll drives a camera (the SVG `viewBox`, so the ink stays sharp) along a dotted route. There is one parchment card per stop:
   - I · La Contea dei Due Sorrisi: the invitation and the couple's portrait
   - II · Il Colle della Luna: a live countdown plus "moon-letters" that decode from runes
   - III · I Monti dei Fuochi: the 5 beacons light one by one, one per programme item
   - IV · Il Bosco delle Betulle: the venue, plus a Google Maps button
   - final overview: "Il viaggio è tracciato" → RSVP

   Directional snapping lands on each stop. The `start`/`end` labels exist so the pin releases at both ends; don't remove them.
4. **RSVP** (`Rsvp.astro`, `scripts/rsvp.ts`). A parchment letter with a lavender wax seal. On submit it composes a WhatsApp message and stamps a seal.
5. **Finale**: the Milky Way, fireflies, "E vissero felici e contenti…", Namárië.

## PLACEHOLDERS — confirm with the client before sharing (all in `src/data/content.ts`)
- **Ceremony time** (`WEDDING.iso`, 16:00) and the **whole programme** (times and titles)
- **RSVP deadline** (30 giugno 2027) and the **WhatsApp number** (`RSVP.whatsapp`). While it contains X's the form runs in demo mode and shows a toast instead of sending.
- Whether ceremony and reception are both at La Betulla (the copy currently implies one place)
- The portrait is cropped from the printed save-the-date (low-res). A proper photo would help: replace `public/img/coppia.webp` (square).

## Assets
- `public/img/hero.webp`: Higgsfield (nano_banana_2_lite). It used the account's last credit (balance was 1.5 → 0.5).
- `stone.webp` (Pexels 3707669), `paper.webp` (Pexels 7952505), `sky.webp` (Pexels 8148893): Pexels licence, free to use.
- Sources in `assets-src/`. Re-run `tools/prep-images.mjs` / `tools/prep-pexels.mjs` to regenerate.

## Gotchas
- **Astro dev serves stale component CSS** after edits to `<style>` blocks. Restart the preview server. (This also happened on Seba's Farm, so it isn't about the apostrophe.)
- The Browser pane doesn't play animations. QA uses Playwright with system Edge: `tools/qa.py` (full walk), `qa2.py W H TAG STEPS` (journey steps), `qa3.py` (RSVP). Run them with the Gabriel venv python; screenshots go to `qa/`.
- On a resize the journey timeline replays to the same progress, so the camera re-fits (`refresh` listener).

## Deploy
- **Live: https://sampoai67.github.io/fv-wedding/**. Repo: https://github.com/SampoAI67/fv-wedding. It's **public**, because Pages needs that on the free plan, and the page itself is `noindex`.
- Every push to `main` rebuilds and deploys via `.github/workflows/deploy.yml` (withastro/action, path `./site`).
- `astro.config.mjs` sets `base: '/fv-wedding'`. Public files referenced from markup must go through `asset()` (`src/lib/asset.ts`). CSS `url('/img/…')` is rewritten automatically.
- Git's stored credential is the Echelonn account. Push with
  `git -c credential.helper= -c "credential.helper=!gh auth git-credential" push` (gh's active account is SampoAI67).

## Not done / ideas
- No music. An optional ambient track toggle would suit the gate, if the couple has a song.
- A gift-list (IBAN) section: only if the couple wants it.
