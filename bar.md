# Bar: busybeehoney.com — mechanisms a critic can check by looking

Reference studied live (DOM + computed styles + keyframes) and via screen recording frames.
Palette they run: dark cocoa #3B2722, cream #F2EBD0, honeycomb gold #FFCA50, barn red #A0342A, sky blue #6AACC2.

## Story page target — Busy Bee Honey About Us, measured 2026-09-02

1. **The opening is exactly one viewport, with navigation over the image.** At 1440×900 the hero
   image is 1425×900; at 390×844 it is 375×844. The headline is centered over the image while two
   small captions sit at the lower corners on desktop and regroup above/below the title on mobile.
2. **Only two editorial display scales carry the page.** The hero is 135px/108px line-height on
   desktop and 74px/59px on mobile. Major section titles are 90px/74px desktop and 50px/40.5px
   mobile. Kicker text stays 13–14px with generous tracking.
3. **The story alternates centered chapters with 60/40 image splits.** Full-width cream chapters
   use a roughly 1000px centered headline; split chapters use a 60% image plane (~855px) beside a
   40% copy plane (~553px). Hard edges, not cards, define the sections.
4. **Small circular portraits interrupt the oversized geometry.** A 265px desktop / 279px mobile
   circular image appears before the origin chapter and again before the brand-way chapter, giving
   the eye a compact human-scale pause between full-bleed images.
5. **Principles are a numbered editorial list, not feature cards.** Five rows use a small 01–05
   index, a 32px desktop / 28px mobile title and fine horizontal rules. The list shares a split
   section with one oversized statement rather than sitting in an equal three-card grid.
6. **Section rhythm is intentionally tall and cinematic.** The measured desktop page runs ~6849px:
   900px hero, ~810px origin, 1080px mission split, ~900px principles, 1080px brand-way split, then
   a statement/slider and product close. Mobile remains ~6945px because columns serialize instead
   of compressing the content into shorter bands.
7. **Mobile preserves the hierarchy by stacking, not shrinking the composition.** The hero remains
   full-screen; content margins are ~16–24px; circular images stay near 72vw; wide media becomes a
   full-width ~375×267 crop; split headings and lists become separate vertical blocks with centered
   major text and left-aligned numbered rows.

1. **Full-bleed color bands, never white.** Every section is a solid band from a 5-color
   palette. Adjacent bands never repeat a color. Section transitions are hard edges or
   a marquee strip — no gradients between sections.

2. **One display face at three sizes, crushed line-height.** All headings are the same
   chunky condensed serif: hero ~200px edge-to-edge, section ~75–110px. Line-height is
   ≤0.85× the font size. Headings are cream-on-dark-band or cocoa-on-light-band, nothing else.

3. **Kicker over every heading.** 10–12px uppercase, letter-spacing ≥0.2em, sits 12–20px
   above the display heading ("FROM OUR FAMILY TO YOURS", "FROM THEIR BUSY HIVE TO YOUR
   BUSY HOME").

4. **The mascot is small, alive, and everywhere.** The bee is a layered PNG puppet
   (body + left wing + right wing) with independent CSS wing-flap keyframes, drifting
   through at least 3 different sections at ~24–40px. It is never a big static illustration.
   It also invades UI chrome: the loader is a rotating bee with "GATHERING NECTAR… %".

5. **Motion is ambient and looping, never one-shot decoration.** One autoplaying muted
   looping hero video; a marquee ticker band ("MADE IN THE USA 🐝" repeated, with glyph
   separators); a slowly rotating circular badge stamp overlapping a heading. Loops are
   seamless — no visible restart.

6. **Scroll-triggered entrances, once, 400–700ms.** Headings and grid cards slide-fade up
   (their `GridsItem_slideInFadeUp` / masked text reveal) the first time they enter the
   viewport. Nothing animates for under 400ms; nothing re-triggers on every scroll.

7. **Pill buttons + brand-voiced chrome.** Every CTA is a full pill (border-radius 500px),
   tiny tracked uppercase label, solid cocoa or gold, usually with a trailing →. Utility
   copy carries the voice ("REAL HONEST REVIEWS", loader text) — no generic UI strings.

Bonus mechanism worth stealing: reviews are four rounded-corner cards, each in a different
brand color, quotes set in the display face — content sections reuse the palette as a system.

## Products page addendum — busybeehoney.com/products

Studied live via full-page scroll capture. The 7 mechanisms above still hold (same
palette-band, kicker+heading, marquee, pill-button rules) — this adds what's distinctive
to a *products* page specifically, which the homepage bar didn't need to cover.

8. **Atmospheric photo hero, not the graphic hero.** The products-page hero swaps the
   homepage's illustrated/graphic treatment for a full-bleed blurred macro photo
   (bees mid-flight, shallow depth of field) with the display headline overlaid in
   cream, plus one small tracked caption line beneath it. No product is shown yet —
   the hero sells mood, not merchandise.

9. **Horizontal-scroll product carousel, repeated with different theming.** The core
   mechanism of the whole page: a kicker+heading+small rotating badge stamp, then a
   single-row horizontal-scroll strip of product cards (photo, name, pill "LEARN MORE"
   button), with dot pagination beneath. It runs *twice* — once on a light band showing
   product-format variety ("Our Very Best Sellers": jar, bottle, bear-bottle, squeeze,
   travel packets), once on a dark band showing the same format sliced by a different
   axis (region). Same carousel component, two different sorting principles, two bands.

10. **A retail-availability statement band, not just a CTA band.** Before the footer, a
    solid-color band states specifically *where* to buy ("AVAILABLE AT AMAZON, KROGER…")
    with a "FIND STORE →" pill — concrete retail proof, not generic "shop now" copy.

Where this can't be copied literally: their carousel's second pass uses region as the
sorting axis because they're a nationally-distributed product; we have one flavor family,
not fifty regional SKUs. The mechanism to steal is "same carousel, second pass sorted by
a different axis, different band color" — the axis itself has to be something we actually
have (format, not geography).

## Full Lineup grouped-carousel target — direction revised 2026-08-21

1. **The section is full-bleed and split into three tonal bands; the catalog remains constrained.**
   Bottles uses cocoa, Cans uses teal-star, and Accessories uses honey, with clear breathing room
   between bands. Each product carousel stays in the established 1320px content frame.
2. **Three semantic carousels divide the catalog.** Bottles, Cans, and Accessories each have
   a centered display heading matching Full Lineup and their own centered scroll-snap rail.
3. **Viewport counts are deterministic.** Desktop shows four cards, tablet two, mobile one;
   pointer drag, native touch swipe, and keyboard arrows reveal the remaining products.
4. **Product objects carry the composition.** Transparent product cutouts are normalized
   inside equal-height image stages; names, price/package labels, and purchase CTAs keep common
   baselines even when the source packaging has different proportions.
5. **Hierarchy names both the umbrella and the format.** Full Lineup remains the centered
   umbrella heading. Bottles, Cans, and Accessories repeat its centered display treatment inside
   their own colored bands, with proportionate spacing and responsive, overflow-safe sizing.
6. **Contrast is handled per band using only the established palette.** Cocoa uses cream;
   honey uses cocoa; teal uses cream for large/bold type while small pricing copy sits on cocoa,
   keeping text, focus states, and CTAs at AA contrast.
7. **Cards remain David, not Busy Bee clones.** Cocoa, cream, honey, beer-color accents,
   tracked pill buttons, and restrained lift motion provide the visual language.
8. **David content follows the approved seventeen-item catalog.** The carousels contain four
   individual beer bottles, four flavor-specific bottle six-packs, four flavor-specific
   individual cans, four flavor-specific can six-packs, and Hopper Plushie. Generic Single
   Bottle, Six-Pack, and Cans cards are intentionally excluded. Every item has a clear
   flavor-plus-format name, price treatment, stable future slug, and working Add to cart action.
   Beer cards also expose quantity without arithmetic: `500 ml` for individuals and
   `6 × 500 ml` for six-packs. Hopper is priced independently as merchandise.

## Product quick-view modal target — reference image + `#plushie`

1. **The modal is a two-column composition, not a centered card stack.** On desktop the product
   stage occupies roughly 55% of the width and the information column 45%; mobile collapses to
   one column with the product first and the CTA still visible without horizontal scrolling.
2. **Only the product stage reads as glass.** The left box uses a translucent cream-to-honey
   gradient, a 1–2px cocoa-tinted border, a second inset rule, a soft inner highlight, and a
   restrained shadow. The overall modal has no opaque panel behind both columns.
3. **The page itself becomes the backdrop.** Opening the quick view adds blur plus a gentle dark
   wash to the page, while the modal remains crisp; the modal closes by X, outside click, or
   Escape, and focus returns to the product that opened it.
4. **The product is framed by reusable `#plushie` motion.** A radial glow and dashed rotating ring
   sit behind the cutout; four small corner stars twinkle; the product cutout bobs slowly. Every
   loop freezes under `prefers-reduced-motion`.
5. **Information hierarchy is deliberately sparse.** One tracked kicker, one oversized display
   product name, a short readable description, price/package metadata, then one prominent cocoa
   pill CTA. No secondary links or decorative text compete with Add to cart.
6. **Motion resolves as one opening gesture.** Backdrop fades/blur increases while the two modal
   columns rise and scale into place over roughly 450–600ms using the established pop easing;
   closing reverses the same direction rather than introducing a separate animation.
7. **The close affordance stays independent.** A minimum-44px circular X sits at the viewport's
   upper-right edge of the modal composition, above both columns, with clear hover and focus
   treatment and no collision with the product or headline.
