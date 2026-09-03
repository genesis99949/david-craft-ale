# Design Loop — Live Progress

## Product quick-view modal — implemented and verified

The Full Lineup now has a dynamic quick-view for all 20 catalog products. A card click or
keyboard activation opens a responsive two-column composition with a glass-like product stage,
the reused Plushie glow/ring/star/bob motion language, product-specific copy, live price and
package metadata, and the existing quantity-aware Add to cart path. The overall composition is
transparent over a blurred/dimmed page rather than sitting inside an opaque panel.

Dismissal and accessibility checks cover the 44px close button, backdrop click, Escape, initial
close-button focus, trapped Tab navigation, focus restoration, `aria-modal`, and scroll locking
coordinated with the menu and cart drawer. The existing direct Add to cart buttons still bypass
the modal, while carousel drags still scroll and do not trigger quick-view after the drag.

Runtime verification in headless Chrome at 1440 × 1000 and 390 × 844 confirmed: 20/20 cards
populate and open dynamically, 20 matching descriptions exist, the modal CTA increments the
shared cart, all three close paths work, pointer drag remains isolated from click, keyboard open
and focus restoration work, desktop resolves to two columns, mobile resolves to one, there is no
horizontal page overflow, and no console or page errors were emitted.

Individual bottle assets receive a modal-only scale treatment because their tall source canvases
read oversized at the generic product scale. A definite inner media frame occupies 52% × 72% of
the stage on desktop and 50% × 70% on mobile; the image then fills that frame with
`object-fit: contain`. This avoids the browser's unresolved percentage-height behavior on the
replaced image itself while preserving its natural aspect ratio. The other 16 product types retain
the shared frame. Computed-bounds checks and fresh screenshots at both viewports confirm the full
bottle is centered inside the ring with breathing room on every side and no stage-edge clipping.

**Bar:** busybeehoney.com → [bar.md](bar.md) · **System:** [design-system.md](design-system.md)
**Character:** Hopper, the flying hop cone (leaf-wing puppet)
**Round:** 15 · **Pieces:** 4 · **Builder:** complete · **Critics:** done (see below)

## If you're resuming this in a fresh conversation
Read this file top to bottom, then [index.html](index.html) if you need the actual
markup. Everything below is real history, not aspirational — treat "MEETS"/"PASS" as
what a fresh critic said about a specific past render, not a permanent property of
the current build, since the build keeps changing. If in doubt, re-run the round-10
blind critic trio (prompts are the pattern used every round below) against fresh
Playwright captures before trusting an old verdict.

| Piece | R7 | R8 Brief | R8 Craft | R8 Sys | R9 Craft | R10 |
|---|---|---|---|---|---|---|
| 1. Hero + marquee | PASS / BELOW | PASS | BELOW | PASS | BELOW | running |
| 2. Product showcase | FAIL / MEETS | PASS | **MEETS** | PASS | **MEETS** | running |
| 3. Story film + reviews | PASS / MEETS | PASS | BELOW→fixed | FAIL→fixed | **MEETS** | running |
| 4. Statement band | PASS / MEETS | PASS | **MEETS** | FAIL→fixed | **MEETS** | running |

Round 8 brief: **all 4 PASS**, final line "none" — first time the brief critic fully
cleared the site. Round 9 craft: **overall winner flipped to Site A** for the first
time (every prior round called Busy Bee better crafted overall). Hero remained the
one piece never cleared by craft, across rounds 7–9, for a real reason each time —
see below.

### The hero-mascot saga — six rounds, now closed with a measured fix
Hero Hopper failed craft rounds 7, 8, and 9 running. The size dial got pushed both ways
(60→124→190→140→208px) chasing brief-critic notes, but craft kept failing it for a
different reason each time: leaf crossing the "A" of "AGE", crowding the CTA on desktop,
literally sitting on top of the button and eating "MEET THE FOUR" on mobile.

**Root cause, found by reading the actual CSS in round 10:** `.hero-cta .hover-hopper`
was `position:absolute` with hand-picked `right`/`bottom` offsets — coordinates guessed
against an assumed button width and headline height, correct at no more than one
viewport size at a time. "Mirroring the side" for mobile (round 7) treated the symptom;
the element was still floating free of real layout, so it could still land anywhere
depending on font metrics, button label length, or viewport width.

**Fix:** took Hopper out of absolute positioning and made him a normal flex sibling of
the button inside `.hero-cta` (`display:flex; gap:clamp(6px,1.6vw,16px)`), sized
`clamp(56px,7.2vw,92px)`, tilted -9deg for personality. This makes the two failure modes
*structurally impossible* rather than tuned-around:
- Can't overlap the headline — he's in a separate flex row below it, with 50px+ of
  padding between `.hero-title` and `.hero-cta`.
- Can't overlap the button — flex lays them out side by side, not stacked; there is no
  coordinate math that can make two adjacent flex children intersect.

Verified with `getBoundingClientRect()` overlap checks (not just a screenshot glance) at
both 1425px and 375px: zero overlap, gap-to-headline 52px desktop / 25px mobile,
gap-to-button 14px both. See round-10 verdicts below for the critics' read on it.

**Lesson recorded for real this time:** when a critic keeps failing the same element for
shifting reasons, stop tuning the numbers on top of the existing approach and go back to
what mechanism is producing the position at all. An absolutely-positioned element with
guessed offsets will always have a viewport width where it collides with something;
normal flow with real siblings can't.

### Round 13 — two real measured findings, both fixed with hard floors
Brief: **all 4 PASS**, third consecutive clean sweep. Only non-blocking notes.

Craft: overall B again (4-3, alternating with A each round now — 9:A, 10:B, 11:A, 12:A,
13:B). Hero the one BELOW, on a complaint repeated independently in rounds 10, 11, and
now 13: the corner-flanking "EST. 2023" / "BREWED WITH LOVE & HOPS" labels don't read as
a *stacked* kicker directly above the headline, unlike every other section. Three
independent hits on the same specific note is a pattern, not noise — added a real
centered kicker ("Small Batch. Big Personality.") directly above the H1, keeping the
corner tags as a separate decorative layer rather than replacing them.

System: **two real, measured FAILs** — the most useful system round yet:
1. Hero mascot measured at ~85–92px desktop (`clamp(56px,7.2vw,92px)` maxes out at 92px
   on wide viewports) and ~56px mobile — **short of the 96px anchor floor on desktop,
   and only ambient-scale on mobile**, meaning the site had zero anchor-scale instances
   on narrow viewports despite the spec requiring exactly one. Root-caused the same way
   as the original hero fix: the clamp's *preferred* value could fall below spec on some
   viewports because only the max was bounded, not the min. Changed to
   `clamp(96px,10vw,144px)` — a hard 96px **floor**, not just a ceiling, so the anchor
   instance is spec-compliant at every viewport width by construction, not by luck.
2. Products' new "NOW POURING" kicker sat above the star row, not directly above
   "BLONDE" — the stars intervened, breaking the "directly above" pattern every other
   section follows with zero exceptions. Reordered: stars now sit first, kicker
   immediately above the heading with nothing between them.

Both fixes verified by measurement (`getBoundingClientRect`, confirmed 96px floor holds
at 375px and 1425px, confirmed zero overlap with headline/button at both) before
spending round 14 on them.

### Round 16 — personality/motion gap audit (no builder round, comparison only)
User's own read: the site "feels a little hollow" against busybeehoney despite round 15's
craft critic having Site A winning 3 of 4 pieces. Re-audited the reference specifically for
*mechanisms that read as "alive"* rather than static/composition quality, since that's a
different axis than what round 15 measured.

Verified against the live DOM, not memory:
1. The bee mascot repeats **~13 times** across the full page (bar.md mechanism 4 says "at
   least 3 sections" — they run far past their own stated floor). Ours currently repeats in
   **2** sections (hero + reviews) — but that's not an oversight, it's the user's own explicit
   instruction two rounds ago ("too repetitive... hero and reviews, that's it"). Not treating
   this as a gap to close; the user outranks the bar on their own brand's mascot frequency.
2. Busy Bee runs **one real photographic autoplaying video loop** — a bottle-on-a-table shot
   with an interactive "trace the bottle" batch-lookup card — placed early, right after the
   hero. We run exactly one video too (`story-loop.mp4`), but it's mid-page in the Story
   section, not near the top. This is a real, actionable gap: nothing on our page loops in
   the first two screens.
3. ~40% of Busy Bee's imagery is **real macro/lifestyle photography** (bee-on-sunflower,
   product-in-hand shots) interleaved with the illustrated mascot. Not directly portable —
   design-system.md's Media section bans photorealism in illustration slots by design
   (flat vintage-print only), and that rule has held for 16 rounds on purpose. Noted as the
   real, structural reason a 1:1 match isn't the right target here, not a gap to close.

Not actioned yet: any new generation. User asked for a ruthless comparison first and to
be asked before spending anything via the Higgsfield/Seedance connector — proposal for
where new video/illustration would close gap #2 was given in-chat, pending their pick.

### Round 15 — resumed after real photography + Plushie section, one live edit mid-round
Resumed the loop after out-of-loop work replaced the flat SVG bottles with real product
photography, added a full-width Plushie merch section, and fixed a 7-item punch list
(band-drip seam, marquee loop, beer-tab spacing, star color sync, since-band removal,
deal-list sizing, lineup clipping). `design-system.md` updated first: Bottles entry now
describes real photography, Stars entry documents live beer-ink coloring, and a new
Merch Feature entry documents the Plushie poster module.

Brief: **3 of 4 PASS.** Hero, products, story/reviews all clean. Plushie **FAIL** — no
price anywhere on the module; the beer section backs its CTA with concrete ABV/IBU/volume
facts, this one didn't.

System: **1 of 4 PASS, 2 real findings — one mine, one code.**
1. Products FAIL, stars row: inactive stars sampled `--ink` not `--cocoa`. Investigated —
   this is **my own doc bug**, not a code bug. The code (`var(--ink)` on inactive stars)
   is unchanged and correct; I'd sloppily written "rest cocoa-ink" in this session's
   earlier doc edit when I only meant "ink." Fixed the wording, left the code alone —
   same "spec drifted, not the design" pattern as round 11.
2. Plushie FAIL, wordmark mismatch: the merch spec says the section "reuses the
   `.wordmark` lockup," but it rendered "DAVID / CRAFT ALE" against every other instance
   of that exact component (header, footer) rendering "DAVID / CRAFT BEER." Real,
   confirmed against the live DOM — fixed by changing the plushie instance's text to
   match (line-level fix, not a design change). Left the bottle-label/rotating-badge
   "CRAFT ALE" usages alone — those read as product-line voice, not the site wordmark,
   and weren't part of the flagged component.

Craft: **Site A wins 3, Site B wins 1** — hero, products, story/reviews all MEETS, the
best margin yet. Hero's one "BELOW" mark does **not** hold up: it complained about a
missing marquee ticker and rotating badge, but both exist — my capture script only
screenshot the first 900px viewport of the hero piece and cropped them out before the
critic ever saw them. Confirmed by re-capturing at 1500px height. Recorded as a false
negative from my own harness, not the critic; not actioned as a design fix. Fixed the
harness for future rounds instead (`capture.py` now includes `#plushie`).

**Mid-round interruption:** the user completely rebuilt the Plushie section by hand
(new markup/CSS — `.plushie-shell`/`.plushie-grid`/`.plushie-badge-new`/`.plushie-chip`
etc., new asset `Plushie_nobg.png`) partway through this round, after the critics had
already been dispatched against the old poster-frame version. Per standing instruction,
treated the on-disk rewrite as deliberate and did not revert it. This means:
- Brief's "no price" and craft's plushie verdict were judged against a version that no
  longer exists — **not reliable for the current build**, not re-litigated this round.
- System's wordmark finding happened to name a defect (`CRAFT ALE` vs `CRAFT BEER`) that
  carried over unchanged into the new markup too — verified still true, fixed as above.
- Plushie has **not yet had a fresh critic pass** against the current design. Next round
  should open by re-running brief + craft (not system — its one open item is fixed) on
  Plushie alone before touching anything else.

Open, not actioned: whether "no price shown" is even a real gap on the new Plushie
markup — its CTA reads "Take Hopper Home" / "Join the waitlist" with toast copy implying
a pre-launch/restock state, where omitting a price may be intentional rather than a
miss. Flagged to the user rather than guessed at.

### Round 14 — system's first fully-false round; loop reaches a strong stopping point
Brief: **all 4 PASS**, fourth consecutive clean sweep. Standing note across rounds
12–14 is a stretch goal, not a gap: Hopper could vary pose/scale and appear in the
story section too. Never framed as blocking; not actioned as a "fix."

Craft: **overall winner Site A, 5 mechanisms to 2 — the best margin of any round.**
Hero, story/reviews, statement all MEETS. Products BELOW on the ghost "BLONDE"
watermark, called "washed out to near-illegibility" — the same element round 13 called
"too legible, a redundant double-label" (dismissed there as tonal). Opposite complaints
about the same unchanged element across consecutive rounds is the signature of a
genuinely subtle, reasonable-either-way choice, not a real defect. Not actioned.

System: **three FAILs, all three verified false against the live DOM** — not against my
own re-reading of a screenshot, but against the rendering engine's own ground truth:
1. "Mobile hero mascot ~72–90px, under the 96px floor" — `getComputedStyle` +
   `getBoundingClientRect` both read 96–98px. At/above the floor.
2. "Reviews teal card byline uses the forbidden #2F8577, ~3.9:1" — computed background
   is `rgb(31,90,80)` = `#1F5A50` (the correct token) with cream text at full opacity,
   ≈7.6:1. Not the forbidden combination at all.
3. "Statement stat-pill values render in a Georgia fallback, not Alfa Slab One" —
   computed `font-family` is `"Alfa Slab One", Georgia, serif` and
   `document.fonts.check('16px "Alfa Slab One"')` returns `true`: the font is loaded
   and is the browser's actual choice, not a fallback.

Three-for-three false in one round is new — worth naming plainly: as the design gets
more refined, a vision-based critic reading fine detail off a compressed screenshot
(exact px counts, close-shade color matching, distinguishing two serif-family renders
at 19px) becomes measurably less reliable than the DOM itself. None of these were
actioned; all three are backed by reproducible browser measurements recorded above.

**Where this leaves the loop:** every verified finding from every critic across 14
rounds is resolved. What's left is (a) brief's explicit stretch goal, (b) craft's
self-contradicting note on one decorative element, (c) this round's three false
positives. No open, confirmed defect remains. This is the natural stopping point per
the loop's own exit rule ("winning, or the user stopping the run") — reported back to
the user rather than continuing to manufacture more rounds against diminishing signal.

### Round 12 — brief and system both fully clean; one concrete craft gap left, fixed
Brief: **all 4 PASS.** Only note was a stretch suggestion (Hopper could vary pose across
sections), explicitly not a blocking gap — Story passed despite his absence there.

System: **all 4 PASS, "worst violation overall: none found."** First fully clean system
round, and it explicitly confirmed both round-11 doc corrections read right: quotes
recognized as sanctioned uppercase, stat pills recognized as the sanctioned natural-case
exception, mascot count verified at exactly one anchor + correctly-scaled ambients.

Craft: **overall winner Site A, 4 mechanisms to 3** — same score as round 11, second
consecutive win. Three of four areas MEETS; only Products BELOW, on one *concrete*
(critic's own word) gap: the "BLONDE" heading has no text kicker, only the star row —
unlike every other heading on the site, which pairs a tracked kicker with the headline.
This element (stars above beer name) has been unchanged since round 1 and never flagged
before, but the complaint is specific and cheap to satisfy without touching it — added a
"Now Pouring" kicker above the stars, in flow, verified no collision before spending
another round. Round 13 launched to confirm.

### Round 11 — products fixed, a doc error caught and corrected
Brief: 3 PASS, 1 FAIL — products, for Hopper's total absence from "the section a
first-time visitor will spend the most time in." Concrete and specific; fixed by adding
a ~44px **ambient** Hopper between the beer-selector row and the bottle/glass, in normal
document flow (not absolute — same lesson as the hero fix, applied preemptively this
time). Verified no collision by inspection before spending a round on it.

System: PASS ×3, FAIL on reviews — quotes rendered uppercase, which it read as
contradicting the round-10 doc edit claiming quotes use "natural sentence case." I
checked the actual CSS: `.review-card .q{text-transform:uppercase}`, unchanged since
round 3, silently passed by ~6 prior system-critic rounds. **My round-10 doc edit was
the error, not the code** — I'd conflated "added curly quote marks" (a real round-6 fix)
with "changed to sentence case" (never happened) while writing from memory instead of
re-reading the CSS. Corrected the doc to match the actual, long-stable, already-approved
behavior: quotes are uppercase heading-weight statements; only the statement band's
stat-pill values use natural case. No design changed — only the record of it.

Craft: **overall winner flipped back to Site A, 4 mechanisms to 3** — hero and products
both MEETS. Story/reviews and statement marked BELOW, but on tonal grounds ("thinner
than B's illustration," "reads like a bolted-on B2B program") with no concrete defect
named, and contradicted the same round by brief and system both passing those pieces
outright. Not actioned — recorded as noted, not as a fail to fix. Launched round 12 as
a synchronized read (all three critics against the same, fully-corrected build) rather
than continuing to patch against staggered async results.

### Round 10 — a swing, and a deliberate non-fix
Round 10 brief: **all 4 PASS again**, explicitly confirming the hero fix — "clean on
both breakpoints... no overlap with headline or button on either desktop or mobile."
Round 10 system: PASS ×3, FAIL on statement (see below). Round 10 craft: **overall
winner flipped back to B**, with hero/products/statement all BELOW — a real reversal
from round 9's all-time-best result, worth taking seriously rather than averaging away.

I checked each craft claim against the actual renders and the exact prompt I'd sent
before acting, because two of the three area-level complaints didn't survive that check:

1. **Hero "BELOW"** — reasoning included "generic flat-vector bottles can't compete with
   a distinctively-shaped, photographed product object." That is a direct violation of
   the explicit instruction I gave this critic: *"Neither medium is inherently better
   craft — judge execution within the chosen medium, not the choice of medium."* Combined
   with brief and system both freshly passing hero the same round, I did not action this —
   noted, not fixed, and re-briefed the round-11 craft critic to name that exact failure
   mode as one it had made before.
2. **Products "BELOW"** — "ghost watermark collides illegibly with the bottle." Same
   design, unchanged, had been called MEETS by craft in rounds 8 and 9 and PASS by brief
   and system this round too. One dissenting read against a two-round stable trend,
   with no corroboration — treated as critic variance, not actioned.
3. **Statement "BELOW"**, "flat and text-only with no supporting image" — this one I
   *did* action, because it's a real, first-time-visible consequence of my own previous
   edit: I'd removed the mascot badge in round 8 to satisfy the system critic's "second
   anchor-scale instance" violation, and nothing filled the resulting gap until this
   craft pass caught it. Fixed by adding a ~50px **ambient**-scale Hopper between the
   stat pills and the CTA — spec-compliant (ambient instances are unlimited), so it
   doesn't reopen the violation the badge removal fixed.

**System's statement FAIL** was also partly wrong, not just harsh: it described the
"DAVID" wordmark as "a mixed-case serif/slab font matching neither sanctioned face" —
verified false against the actual render (screenshot shows a plain sans-serif, which is
Archivo, exactly per spec). The other half of its claim — stat-pill values set in Alfa
Slab One at natural case, not uppercase — is real but was already an established,
unflagged pattern (review-card quotes do the same thing and passed four prior system
rounds). Rather than silently overriding a fail, clarified `design-system.md`'s Type
section to state explicitly that the uppercase rule governs headings, and natural-case
display-face use for quote/value micro-copy is sanctioned — documenting existing,
consistent behavior rather than the "I'll allow it" pattern that would defeat the point
of having a critic. Nothing about the working design changed for this half of the finding.

Principle this enforces: not every critic sentence earns a code change. A finding gets
actioned when it's real (verified against the render or the exact prompt given) and
either new or repeat-confirmed. A finding that rests on an instruction the critic was
told not to use, or contradicts two fresh independent passes with no changed variable
to explain the flip, gets recorded and skipped — with the reasoning written down so it's
checkable, not just asserted.

### Round-8/9 findings and fixes (besides the hero saga above)
| Finding | Source | Fix |
|---|---|---|
| Statement mascot badge = a *second* anchor-scale instance; spec says exactly one | system (R8) | Removed the badge/video entirely rather than re-editing the spec to allow it — the badge was also independently called "an unmasked asset tile" by brief and craft |
| "SINCE 2023" scrim read as "a drop shadow… the only shadowed type on the site, an ad-hoc patch" | craft (R8) | Replaced the gradient scrim with a hard-edged solid cocoa band — a real band, not a shadow |
| Statement stat pills mismatched width, one wrapped to two lines | brief (R8) | Restructured to a uniform stacked-centre layout, all three identical |
| Amber review byline 3.88:1, statement kicker 4.15:1 — both opacity-dimmed cream | system (R6, recurred R7 on stale render) | Full-opacity cream on both; verified 5.24:1 by sampling the actual rendered plate colour, not by eye |
| Hero/selector bottle order mismatched (hero Dark→Blonde, selector Blonde→Dark) | brief (R8) | Both now light→dark |
| Mobile Hopper sat on the CTA, ate the arrow glyph | brief (R8) | Superseded by the round-10 flex rewrite below — mirroring the side was a partial fix, not the real one |
| Review card quotes centre-aligned, breaking mid-phrase | craft (R8) | Left-aligned, attribution pinned to card bottom |

### Round-6 findings and fixes
| Finding | Source | Fix |
|---|---|---|
| **No appetite appeal** — flat vector bottle, no poured glass, no foam, no liquid colour (raised in rounds 4, 5 *and* 6) | brief (named as *the* fix) | Generated four flat-print poured-glass illustrations (one per beer, correct liquid + foam colour), chroma-keyed and paired with the bottle; each bobs on its own loop |
| Hero headline "not one edge-to-edge mass" — line 1 inset ~200px, line 2 nearly bleeding | craft | Lines split into spans and independently scaled (1.26em / 1em) so both run flush to the gutters |
| Oversized mascot "crashing into" / "jammed behind the letters AGE" | brief + craft | Cut to clamp(84px, 9.6vw, 140px) and CTA row pushed down so he clears the type |
| Gold blob "bleeds off-canvas, anchors to nothing", "leftover debris", hard square-cut corner | brief + craft | Rewritten as a closed organic path and moved *inside* `.product-stage`, so it sits behind the bottle and glass at every breakpoint — matching the client PDF |
| "SINCE 2023" burying the clink point of the two bottles | brief | Type moved to the lower band; scrim re-weighted to the bottom |
| "Send cases our way" implied the affiliate ships the beer | brief | "Send drinkers our way and Hopper sends you a cut of every case they buy" |
| Straight quotes, ragged card bottoms | craft | Curly quotes; quotes rewritten to uniform length |

### Round-5 findings and fixes
| Finding | Source | Fix |
|---|---|---|
| Teal review card: cream on `#2F8577` = **3.93:1**, fails 4.5:1 (even white only reaches 4.44:1) | system (computed) | Card surface darkened to `#1F5A50` → **7.0:1** |
| Hero headline lines colliding — red "NEW AGE" into the descenders above | brief | line-height .80 → .92 |
| Hero Hopper "a ~90px doodle parked beside the CTA" | brief | Anchor scale: clamp(96px, 13vw, 190px), now overlaps the headline |
| Bottles left "huge dead yellow gutters" | brief + craft | Gap widened to 4.4vw, bottles span the full band |
| Footer "Drink Responsibly" wrong colour and off-baseline | brief + craft + system (three independent) | Styled with the sibling links |
| Statement chip "a pasted sticker" — hard drop shadow on the red field | brief | Shadow removed |
| Straight typewriter quotes; variable dead gap per review card | craft | Curly quotes via `::before/::after`; quotes rewritten to uniform length |
| Product blob "bleeds off-canvas, contains nothing", clipping the ghost word | craft | Cut to 27% width, clear of the bottle |
| Kicker named "Hopper" before the visitor met him | brief | Reverted to "Straight from the taproom" |

### Spec changed rather than design — flagged deliberately
The system critic failed two pieces against **my own** `design-system.md`, where the doc
had gone stale against deliberate improvements:
1. **Mascot ceiling 24–56px.** The brief critic had twice failed the hero for Hopper being
   too small to read as a character. Rather than shrink him back and fail the user's actual
   goal, I revised the doc to sanction two scales: ambient 24–56px (the default, used
   repeatedly) and exactly one hero-scale *anchor* placement, which must animate.
2. **"Thumb rail: 64×80 buttons."** Superseded in round 3 when the brief critic showed the
   thumbnail rail hid three of four beers. Doc now describes the named selector.

Both are spec edits made in the open, with the reason recorded — not verdicts argued away.
The contrast failure was fixed in the design, not the doc.

### Round-4 findings and fixes
| Finding | Source | Fix |
|---|---|---|
| **Mobile products structurally broken** — kicker sliced to a stray "w", tabs illegible on the blob, bottle stranded bottom-left, no copy or CTA | brief + craft (both named it *the* fix) | **Root cause found by measurement:** a stale `@media (max-width:420px)` rule still forced `grid-template-columns:64px 241px 50px` from the deleted thumb rail. Removed; kicker given `position:relative;z-index:3` so the blob stops painting over it; tabs made solid `--paper`; blob moved to `bottom:6%` so it never sits under the selector |
| Desktop Hopper "too small and crowded to register as a character" | brief | Scaled to clamp(76px, 8.4vw, 124px), offset further off the pill |
| "SINCE 2023" needed an off-system drop shadow to stay legible over the busiest part of the art | craft | Shadow removed; replaced with a designed scrim gradient over the film band |
| Stat cards "read like a SaaS pricing table", breaking the site's solid-shape/pill language | craft | Rebuilt as cream pills matching every other pill on the site |
| Mascot chip still reading as a "big static illustration" | craft | Cut again to 196px (~13% of viewport) |
| "HOPPER'S FAVOURITE REVIEWS" (British) vs "a favorite shelf" (US) in the card below it | craft | Standardised on US spelling |

### Round-3 findings and fixes
| Finding | Source | Fix |
|---|---|---|
| Selector hid 3 of 4 beers — unlabelled 30px thumbnails, "a visitor sees one beer, not a range" | brief (named as *the* fix) | Replaced with a named selector: colour swatch + BLONDE / AMBER / IPA / DARK + style, all four visible at once |
| Lone chevron sat on the ghost word; sliced by the right edge on mobile | brief | Chevron removed — named tabs make it redundant |
| Hero headline sat inside ~250px gutters, not edge-to-edge | craft | Scaled to 8.9vw / 136px max, gutters cut to ~14px |
| Mascot inside the CTA flex group threw the pill 33px off-axis | craft | Hopper absolutely positioned off the pill; pill now dead-centre |
| Desktop Hopper a "~40px speck", mobile version proved it undersized | brief | Scaled to clamp(56px, 6vw, 84px) |
| Reviews band within a hair of the page cream — "cards float on mush" | craft | Band committed to cocoa; cream/gold/brick/teal cards now snap against it |
| Statement heading undersized; ghost text duplicated behind it invisibly | craft | Heading to 8.4vw / 104px max; ghost removed |
| Deal cards near-invisible translucent panels, sub-13px text failing contrast | brief | Solid #8E2A1A cards, 2px border, 14px body |
| Redundant second 30px Hopper between cards and CTA | brief | Removed |
| Review quotes top-aligned leaving dead band at card bottom | brief | Quotes centred, attribution pinned to bottom |

### Round-2 findings and fixes
| Finding | Source | Fix |
|---|---|---|
| "Since 2023" set in body sans, not the display slab — "reads as fallback text" | brief + craft | **Confirmed by measurement** (Hanken Grotesk vs Alfa Slab One); now display face |
| Same Blonde bottle rendered twice at two sizes in one viewport | craft | Removed the decorative float-bottle |
| Products right half was dead space; switcher read as decoration | brief + craft | Two-column desktop layout; detail + CTA now fill the right |
| Hero had no CTA and no mascot above the fold | brief | Hopper + "Meet the Four →" pill sit under the headline |
| Drip wave amputated all four bottles mid-label | brief | Bleed cut from −70px to −30px; labels stay whole |
| Affiliate offer had no rate, terms or proof | brief | Added 15% / 30-day cookie / paid-monthly deal cards |
| ~35px cream sliver between reviews and statement bands | craft | Removed a stray `margin-top` on #affiliate |
| Mascot card ~39% of viewport — the "big static illustration" the bar forbids | craft | Chip cut to 240px max (~17%) |
| Announcement bar broke the tracked-uppercase chrome rule | craft | Now uppercase, 0.2em tracked |
| Ghost word amputated by the sticky header | craft | Billboard recentred behind the bottle |
| Story band had no kicker | craft | Added kicker + "Brewed by People Who Drink It" |

### Bugs found by my own verification (not by critics)
- `margin:0 auto` on the hero mascot resolved to a **564px flex auto-margin**, throwing
  the CTA to the far right edge. Measured, then zeroed inside `.hero-cta`.
- The generated artwork has a cream paper border baked in, showing as side strips on
  the story band. Cropped with `transform:scale(1.06)`.
- Thumb rail clipped under the sticky header on mobile → `scroll-margin-top` on all
  sections + top padding on #products; capture harness now offsets by header height.

\* Round-1 verdicts for pieces 2–4 were **invalid**: the headless capture ignored
hash navigation, so all five "desktop" renders were the same hero frame. The
critics correctly flagged this ("did not render"), and the brief critic explicitly
caveated it. Rebuilt the harness on Playwright with real section scrolling and
device emulation before re-running.

### Round-1 findings that WERE real, and what changed
| Finding | Source | Fix |
|---|---|---|
| Rotating badge printed on top of the marquee, both illegible | craft + system | Marquee raised to z-6; badge moved into the cream band below |
| "ONE FOR EVERYONE." was an orphan kicker with no heading | craft | Added display heading "Four Brews. No Compromises." |
| Ghost "DAVID" clipped by the announcement bar, read as a bug | craft | Removed from hero (billboard ghost still used in products) |
| Bottles floated small in a sea of gold — no edge-to-edge confidence | craft | Bottles scaled up ~40%, now bleed past the band edge into the drip |
| Bottle art had gradients, specular highlights and drop shadows | system | Re-cut as flat clip-path bands; all drop-shadow filters removed |
| Mascot absent from every frame (drifters were off-screen at capture) | all three | Added stationary bobbing Hopper above hero, reviews and affiliate CTAs |
| "over 55$!" malformed price, generic e-comm voice | craft | "Free shipping on orders over $55 · Drink responsibly" |
| CTAs lacked the trailing arrow of the bar's pills | craft | Added → to primary CTAs |

**Mobile overflow was NOT real** — headless Chrome ignored the viewport meta and
rendered at desktop width. Playwright on an emulated iPhone 13 reports
scrollWidth 390 = clientWidth 390, clean.

## Assets generated (Higgsfield, 86 credits of 273 spent)
- [x] Hopper 2-pose sprite sheet → chroma-keyed to `assets/hopper-up.png` / `hopper-down.png`
- [x] Hopper hugging a bottle → `assets/hopper-hero.png` (menu)
- [x] Sunset barley-field clink poster → `assets/story-poster.png`
- [x] Hopper + foaming mug poster → `assets/mug-poster.png`
- [x] Seedance 2.5 loop: sunset clink → `assets/story-loop.mp4` (6s, silent, seamless)
- [x] Seedance 2.5 loop: Hopper + mug → `assets/mug-loop.mp4` (6s, silent, seamless)

## Built this round
- Loader: rotating star + live % counter + "POURING THE FIRST ROUND…"
- Hero: billboard headline over honey band, corner tags, ghost "DAVID", bobbing bottles
- Marquee ticker band (cocoa) with star separators, seamless -50% loop
- Rotating "DAVID CRAFT BEER · SMALL BATCH · EST 2023" badge stamp
- 4 Hopper flight paths across hero / products / statement, wing-flap sprite swap
- Story band now plays the generated sunset loop behind "Since 2023"
- New reviews section: 4 cards in 4 brand colors, display-face quotes
- Statement band "Pour With Us" with the Hopper+mug video chip
- Scroll reveals (once, 600ms, IntersectionObserver), full reduced-motion support
- `?noloader=1` test hook for clean captures

## Verified
No console errors · both loops playing · 4 Hopper sprites airborne · renders captured
at 1440px and 390px for all five sections.

## Next
Re-run the three critics once credits are available, then fix on the named gaps.

## Products page — Full Lineup grid builder round (2026-08-21)

**Direction changed after reference review:** the approved output is a wrapping catalog
grid, not the Busy Bee-style carousel. Busy Bee remains a composition reference only.

### Built
- Replaced the Full Lineup horizontal rail with a constrained `max-width: 1320px` grid
  inside the existing full-bleed cocoa band.
- Deterministic responsive columns: 4 desktop, 2 tablet, 1 mobile; no horizontal scrolling,
  drag behavior, partial crops, or dot navigation.
- Final approved seven-item catalog: Blonde Ale, Amber Pale Ale, IPA, Dark Lager, Six-Pack,
  Cans, and Hopper Plushie. Single Bottle was explicitly removed after the first grid pass.
- All seven cards retain stable future slugs without linking to nonexistent product pages,
  show the existing 3.99 USD price treatment, and use functional Add to cart buttons.
- Cart rows now inherit each card's package label (`Full case`, `Six-pack`, `Can pack`, or
  `Limited plushie`) instead of hard-coding every item as a full case.

### Builder verification
- Headless Chrome via DevTools at 1440×1000: grid width 1320px, 4 columns / 2 rows,
  7 cards, page `scrollWidth` equals `clientWidth` (1425px), no grid overflow, no dots.
- Mobile emulation at 390×844: 1 column / 7 rows, page `scrollWidth` equals
  `clientWidth` (390px), no grid overflow, no dots.
- Runtime catalog names match all seven approved products in order; no Single Bottle.
- Clicked Hopper Plushie's Add to cart: badge `1`, total `3.99 USD`, cart item
  `Hopper Plushie`, package `Limited plushie`.
- JavaScript syntax parsed successfully; DevTools recorded zero runtime exceptions.
- Fresh desktop and mobile section captures visually confirm the David type, cocoa/cream
  palette, equal image stages, common card baselines, and ordinary vertical wrapping.

### Image-stage QA revision
- Removed every visible image tile treatment from Full Lineup: no panel background, border,
  rounded frame, or card surface remains behind the product cutouts.
- Measured alpha bounds for all seven source PNGs. Beer bottles, Six-Pack, and Cans have
  0.3–1.8% transparent canvas below their visible pixels; Hopper Plushie has 7.8%.
- Kept one shared square media stage, bottom-aligned every undistorted `object-fit: contain`
  cutout, and applied a product-specific 7% vertical compensation only to Hopper's known
  transparent lower margin. This aligns visible product bases without arbitrary card padding.
- Final Chrome measurements: all four desktop first-row media stages are 282×282px and every
  bottle image ends exactly at the shared stage baseline (0px bottom offset). Mobile uses a
  350×350px stage with the same 0px bottom offset. The page remains overflow-free at both sizes.
- Fresh visual capture confirms there are no remaining tiles/frames behind any cutout and the
  seven objects read as one clean catalog on the cocoa band.

**Builder status:** ready for three fresh-context critics.

## Products page — flavor-specific catalog extension (2026-08-21)

### Built
- Expanded Full Lineup from 7 to 17 approved cards without changing the constrained grid:
  four individual bottles, four bottle six-packs, four individual cans, four can six-packs,
  and Hopper Plushie.
- Replaced generic Six-Pack and Cans entries with flavor-specific Blonde, Amber, IPA, and
  Dark assets. Generic Single Bottle remains excluded.
- Every card has a unique stable slug, explicit flavor-plus-format name, 3.99 USD treatment,
  and one of five package-aware cart labels: `Individual bottle beer`, `Bottle six-pack`,
  `Individual can`, `Can six-pack`, or `Limited plushie`.
- Preserved the max-1320px, 4/2/1 wrapping grid; transparent bottom-aligned media stages;
  no image tile, border, slider, dots, product-page links, or horizontal scrolling.

### Verification
- Static audit: 17 cards, 17 unique slugs, 17 Add to cart buttons, 8 individual `500 ml`
  labels, 8 `6 × 500 ml` labels, and one `1 plushie` label. No generic Single Bottle,
  Six-Pack, or Cans card; no dots or product links.
- Chrome 1440×1000: 4 columns / 5 rows, 1320px grid, four 282×282px first-row media
  stages, page `scrollWidth` = `clientWidth` = 1425px, no grid overflow.
- Chrome 390×844: 1 column / 17 rows, 390px grid, 350×350px media stages, page
  `scrollWidth` = `clientWidth` = 390px, no grid overflow.
- Added one example from each format to the cart: individual bottle beer, bottle six-pack,
  individual can, can six-pack, and Hopper Plushie. Badge = 5 and total = `45.95 USD`
  (four × 3.99 USD + Hopper at 29.99 USD); all five package labels rendered correctly.
- JavaScript parses and the browser recorded zero runtime exceptions.

### Known asset blocker — visual approval pending
- Pixel alpha audit found real transparency only in `sixpack-bottles-amber.png` and
  `sixpack-bottles-ipa.png` among the 12 newly supplied assets.
- Opaque baked white/checkerboard backgrounds remain in all four `can-*.png` files,
  `sixpack-bottles-blonde.png`, `sixpack-bottles-dark.png`, and all four
  `sixpack-cans-*.png` files. Every sampled pixel, including all corners, is alpha 255.
- Structure, commerce behavior, responsive layout, and media-stage geometry are verified;
  final visual approval must wait for transparent replacements for those 10 files.

### Final typography and asset replacement pass
- Scoped Hanken Grotesk to `.full-lineup-grid .prod-card-name` only. The Four Brews
  section heading and every other display heading remain on Alfa Slab One.
- The 10 previously opaque assets were replaced in place; final alpha and visual checks
  follow below.
- Re-audited all 12 new PNGs: every file now reaches alpha 0 and all four corners are
  transparent. No opaque white/checkerboard source remains.
- Fresh Chrome captures of the bottle, bottle-six-pack, can, and can-six-pack rows show
  clean cutouts directly on the cocoa band with no tile, panel, or baked checkerboard.
- Computed-font verification: Full Lineup product name = `Hanken Grotesk`; The Four Brews
  heading = `Alfa Slab One`. The type change is correctly limited to catalog names.
- Final browser audit: all 17 assets loaded, 4 columns / 5 rows desktop, no page overflow,
  quantities correct on all 17 cards, five-format cart total `45.95 USD`, zero runtime errors.

**Final status:** asset blocker resolved; implementation and visual verification complete.

### Final card-alignment pass
- Product copy now uses a fixed two-part grid: a 3.2em title reservation plus a stable price
  row. One-line and wrapped product names therefore cannot move prices or CTAs.
- The existing square media stage remains identical per breakpoint and all cutouts retain
  their intrinsic aspect ratio through `object-fit: contain`; card buttons stay pinned to the
  bottom by the card flex layout.
- Desktop/tablet/mobile coordinate checks and screenshot paths are recorded in the terminal
  verification report for this pass.

### Grouped carousel revision
- Split Full Lineup into Bottles (8), Cans (8), and Accessories (1), each with an oversized
  horizontal full-bleed heading, a centered max-1320px scroll-snap rail, accessible labelled
  previous/next buttons, and Left/Right keyboard support.
- Deterministic visible counts: four desktop, two tablet, one mobile. Card media/copy/CTA
  alignment, commerce data, transparent assets, hover/focus treatment, and trailing Hopper
  remain scoped to Full Lineup.
- Final Chrome metrics: Bottles/Cans/Accessories contain 8/8/1 cards; visible counts are
  4/4/1 at 1440px, 2/2/1 at 820px, and 1/1/1 at 390px. Page scroll width equals client
  width at all three sizes; six labelled controls are present; zero runtime exceptions.
- QA captures: `qa-full-lineup-desktop.png`, `qa-full-lineup-tablet.png`, and
  `qa-full-lineup-mobile.png` in the project root.

### Density and product-presence iteration
- Tightened each lineup band's vertical padding, rail top padding, card gaps, and responsive
  gutters to remove dead space without changing carousel semantics.
- Increased product cutout limits from 88%/92% to 96%/98% of the shared media stage (Hopper to
  100% max height), preserving intrinsic aspect ratios and existing bottom-alignment offsets.
- Kept the 4/2/1 responsive model, intentional fifth-card peek beneath the right-edge
  `:not(.is-at-end)` fade, watermark headings, controls, copy/CTA alignment, and cart behavior.

### Centered group headings and direct-manipulation rails
- Replaced the absolute watermark labels with centered Bottles, Cans, and Accessories headings
  using the same display family, scale, line-height, and spacing logic as Full Lineup.
- Removed all carousel-control markup and CSS. Desktop fine-pointer rails now expose grab/grabbing
  cursors and pointer-captured drag-to-scroll with a movement threshold that suppresses accidental
  Add to cart clicks after dragging.
- Preserved native touch swipe, focusable ArrowLeft/ArrowRight operation, reduced-motion behavior,
  and direct scroll/resize calculation of `is-at-end`; the 150px right fade no longer depends on
  previous/next button state.

### Distinct Full Lineup bands
- Separated Bottles, Cans, and Accessories into full-bleed cocoa, teal-star, and honey bands,
  with deliberate vertical spacing while keeping every rail centered at max 1320px.
- Category headings are now absolute, horizontal background typography with a small viewport-edge
  inset; they no longer consume layout height. Controls and product rails stay above the labels.
- Preserved the right-edge carousel fade, card hover/focus treatment, aligned media/copy/CTA rows,
  cart behavior, and the desktop trailing Hopper.
- Contrast treatment uses only existing tokens: cream/cocoa 11.41:1, cocoa/honey 8.07:1,
  and cream/teal-star 3.90:1 for large/bold type. Small Cans pricing copy is placed on cocoa
  for 11.41:1 contrast.
- Added centered two-state navigation below the Bottles and Cans rails. Each pager jumps between the first four individual products and the four six-packs, stays synchronized with drag/scroll/keyboard navigation, and exposes its active state accessibly.
- Added matching reveal kickers above the Cans and Accessories headings, with category-aware contrast and the same entrance behavior as Bottles.
# Portfolio context

David Craft Beer is a fictional, conceptual brand created exclusively as a portfolio project. None of the products presented on the website exist or are available for purchase. The project is intended to showcase graphic-design, brand-system, art-direction, interaction-design, responsive-design, accessibility, and front-end development skills.

## Planned next phase — The Four Brews

- Create a shared product-page system for Blonde Ale, Amber Pale Ale, IPA, and Dark Lager.
- Treat every page as a visual product study rather than a real commercial listing.
- Use richer brand storytelling, packaging details, motion, responsive behavior, and accessible interactions to demonstrate both graphic-design and web-development craft.
- Include a clear portfolio/concept disclaimer wherever purchase intent could otherwise be inferred.
- Added a layered footer-reveal treatment: the footer stays beneath the page while the rounded, shadowed retail band reads as the upper card and reveals the footer at the end of the scroll. The treatment is CSS-only and retains normal footer semantics and link behavior.
- Removed the rounded lower corners from the Products retail band and applied the same square-edged card-over-card footer reveal to `index.html`, using the Affiliate section as the foreground layer.
- Integrated the approved editorial "taproom shelf" Products redesign into `index.html`. The original rotating top-right badge remains in use. Desktop shows all four beers at once; mobile uses a snap carousel with swipe, synchronized position indicators, and large left/right edge-tap controls that select and center the adjacent beer. Product copy, metadata, hero links, keyboard selection, reduced-motion behavior, and the existing CTA toast remain connected to the original beer data.
- Replaced every dead Terms/Privacy link in `index.html` and `products.html` with real destinations. Added responsive, branded `terms.html` and `privacy.html` pages plus shared `legal-pages.css`; both explain that David Craft Beer is a fictional portfolio concept and avoid claiming real commerce or data collection. A standard local-build audit is recorded in `qa-report-2026-09-01.md`.
- Completed the wider dead-end navigation remediation on the homepage. Added `beer.html` (four query-driven beer variants), `hopper.html`, `story.html`, `affiliate.html`, `search.html`, `account.html`, and shared `editorial-pages.css`. The selected beer CTA updates its destination dynamically; Hopper, affiliate, menu, footer, search, account and cart controls now navigate to functioning destinations. `products.html?cart=open` opens the existing cart drawer automatically.
- Consolidated the header/menu experience across all eight newly created pages using shared `site-chrome.css` and `site-chrome.js`. The component reproduces the homepage header structure (burger, search, centered Hopper, account, cart, announcement bar) and fullscreen menu, with Escape close, focus trapping, focus restoration, scroll locking, responsive sizing and reduced-motion support. Legacy `page-head` and `legal-header` variants are removed at runtime to prevent future visual drift.
