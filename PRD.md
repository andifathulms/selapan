# PRD — Selapan

**The Javanese calendar computed properly: four overlapping cycles, the arithmetic shown, the historical corrections honoured, and the parts that are tradition kept visibly separate from the parts that are arithmetic.**

> *selapan* (Javanese) — the 35-day cycle produced by the five-day *pasaran* running against the seven-day week. The cycle a *weton* names.
> Alternatives if preferred: **Windu**, **Pawukon**. Slug used throughout as `selapan`.

| | |
|---|---|
| **Status** | Draft — pre-implementation |
| **Owner** | Andi Fathul Mukminin Salahuddin |
| **Type** | Personal portfolio project, open source, cultural |
| **Deployment** | GitHub Pages (static export, no server) |
| **Language** | Indonesian-first UI; Javanese terminology throughout; English secondary |

---

## 1. Why this is a real engineering problem

*Weton* looks like a lookup. It is four interlocking cycles with a historical correction system layered on top, and getting it right is genuinely hard.

**Four independent cycles run simultaneously:**

| Cycle | Length | Elements |
|---|---|---|
| *Pasaran* | 5 days | Legi, Pahing, Pon, Wage, Kliwon |
| *Dina* (week) | 7 days | Ahad, Senen, Selasa, Rebo, Kemis, Jemuwah, Setu |
| *Wuku* | 210 days | 30 named weeks — Sinta, Landep, Wukir … Watugunung |
| Lunar year | 354/355 days | 12 months, Sura through Besar |

*Weton* is the pairing of the first two, repeating every 35 days — *selapan*. The *wuku* cycle is shared with the Balinese *pawukon*, which is a useful cross-check.

**The lunar year carries corrections.** Sultan Agung replaced the Saka solar calendar with a lunar one in 1633 CE while continuing the Saka year count, so AJ 1555 began in that year. Years run in an eight-year *windu* — Alip, Ehe, Jimawal, Je, Dal, Be, Wawu, Jimakir — with a fixed pattern of 354- and 355-day years. Because a fixed pattern drifts against the true lunar month, the system applies a correction every 120 years: the ***kurup***.

**The kurup is where implementations fail, and where communities actually differ.** Each kurup is named by a mnemonic fixing which weton the year Alip begins on. *Aboge* — Alip, Rebo, Wage. *Asapon* — Alip, Selasa, Pon. The current kurup is Asapon; Aboge preceded it. Some communities continue reckoning by Aboge, which is precisely why Aboge villages sometimes observe Idul Fitri on a different day from the national determination. That divergence is real, socially significant, well documented, and absent from every weton site on the internet.

**Most implementations are wrong in three predictable ways:** they hardcode Asapon and so return wrong dates for anything historical, they happily convert dates before 1633 where the lunar system did not exist, and they show no method at all so the error is undetectable.

## 2. Prior art

There are many weton sites. They are advertising-supported, show no method, cite no sources, and disagree with each other. There are also a few libraries, mostly implementing Asapon only.

Nothing shows the arithmetic. Nothing handles the kurup correctly across history. Nothing surfaces the Aboge/Asapon divergence. And nothing distinguishes what is computed from what is interpreted, which is the ethical problem in §4.

## 3. Product thesis

**Compute the cycles exactly, show the arithmetic, and cite the anchors.**

The output is a trace, as in the sibling projects: for any date, which cycle, what offset from which anchor, what modulo, what result. Every conversion is checkable by hand from what the screen shows.

**Separate validity ranges, honestly.** The five- and seven-day cycles are continuous and can be projected in either direction indefinitely. The *wuku* cycle likewise. The lunar year system begins in 1633 CE and has no meaning before it. **Different subsystems get different validity ranges, and outside them the engine refuses rather than extrapolating.** This alone puts it ahead of the field.

**Show the divergence rather than picking a winner.** Aboge and Asapon side by side, with the mechanism explained. A user in an Aboge community should be able to see their own reckoning represented rather than contradicted.

## 4. Cultural and ethical framing — read before building

*Weton* is used for character reading, marriage compatibility, choosing auspicious days, and calculating *slametan* after a death. This is *primbon*: a living tradition that many people take seriously, and that many others regard as superstition or as religiously problematic.

**The design response is a hard separation, carried in the code, the data, and the palette:**

- **Computed values** — dates, cycles, neptu sums, cycle positions — are arithmetic. They are verifiable, and they render in one colour.
- **Interpretations** — compatibility categories, character readings, good and bad days — are **documented tradition**, attributed to a named source, rendered in a different colour, and never phrased as prediction or advice.

**Rules that follow from this:**

- Never phrase an interpretation as a statement about the user's life or future. Not "your marriage will end in separation" but "in the *Pegatan* reckoning, this neptu total falls in the category *Pegat*; source: …".
- Never rank, score, or recommend. No "compatibility: 34%". No "best day to marry".
- Never generate an interpretation. Every one is a lookup into cited data; if it is not in the source, it does not appear.
- The *slametan* calculator is included because it serves a real need at a difficult time, and it is arithmetic — but it is presented as date calculation, plainly, with no interpretation attached.
- The site states plainly that primbon material is presented as cultural documentation, that traditions vary regionally, and that the app is not an authority.

**Recruit a reviewer** familiar with Javanese calendrical practice before shipping the primbon layer. The calendar arithmetic can ship without one; the interpretive layer should not.

## 5. Non-goals

- **No fortune telling, no advice, no recommendations.** See §4. This is binding.
- **No horoscope-style daily readings.**
- **No Balinese *pawukon* system in v1.** It shares the *wuku* cycle but has its own concurrent cycles (*wewaran*) and its own ritual calendar. A serious addition, not a free one.
- **No Hijri calendar computation.** The Javanese lunar calendar is arithmetic and fixed; the Hijri calendar as observed involves sighting. Show the relationship, do not conflate them.
- **No prayer times, no qibla.** Different project.
- **No accounts, no server.** State shares by URL hash.
- **No ML.** Every interpretation is cited data; every number is arithmetic.

## 6. Features

### 6.1 The cycle wheels — signature view
Concentric rings for the 5-, 7-, and 30-*wuku* cycles, with the current position marked on each. Stepping a day advances every ring by one, and the rings visibly realign at 35 days and again at 210. This makes modular arithmetic something you watch rather than something you are told.

### 6.2 Conversion with a visible trace
Gregorian in, full Javanese reckoning out: *dina*, *pasaran*, *weton*, neptu, *wuku*, lunar date, *tahun* and its *windu* name, and the active *kurup*. Every value expandable to show its derivation — anchor date, day offset, modulus, result — plus the citation for the anchor.

Bidirectional: Javanese date in, Gregorian out.

### 6.3 Kurup and divergence view
Which kurup applies to the requested date, why, and what the same date yields under Aboge and Asapon. For dates where the two diverge, say so prominently and explain the mechanism. This is the feature that makes the project worth building.

### 6.4 Neptu calculator
Day and *pasaran* values summed, with the arithmetic shown. Values are traditional and cited. The sum is arithmetic; anything derived from it is interpretation and rendered as such.

### 6.5 Selapanan and slametan dates
Recurring *selapanan* dates from a given weton, and *slametan* reckoning — *nelung dina*, *mitung dina*, *matang puluh*, *nyatus*, *nyewu* — as date calculation with the counting rule stated and cited. Presented plainly, without interpretation.

### 6.6 Pranata mangsa
The agricultural solar calendar: twelve *mangsa* of unequal length tied to the tropical year, with their traditional agricultural markers. Solar and therefore independent of everything above — which is itself worth showing, since it is the piece most people don't know exists.

### 6.7 Primbon reference
Cited tables presented as ethnographic documentation, per §4. Regional variation shown where sources differ, in the manner of Rinci's contradiction ledger.

### 6.8 Calendar view
A month grid with Gregorian, Javanese lunar, *pasaran*, and *wuku* — the layout of the wall calendar found in every Indonesian home, but with every figure traceable to its derivation.

## 7. Architecture

Static Next.js 14 App Router export. No backend, no runtime fetches.

```
gregorian date
  → JDN (integer)
  → cycles (pure)   → pasaran, dina, wuku      [unbounded validity]
  → lunar (pure)    → kurup → windu → tahun → month → day   [from 1633 CE]
  → CalendarTrace   → wheels | conversion view | calendar grid
```

**Julian Day Number is the internal representation.** An integer day count, no timezones, no DST, no `Date` arithmetic. Every cycle is a modulo against a cited anchor JDN. This is what makes the whole thing testable and exactly reproducible.

**No `Date` objects in the engine.** Input parsing converts to JDN at the boundary; everything downstream is integer arithmetic.

**Anchors are cited data.** JSON, each anchor recording the correspondence, its source, and its date of verification — the Rinci pattern. The build fails on an uncited anchor.

**Validity ranges are per-subsystem and enforced.** Requesting a lunar Javanese date for 1500 CE returns a structured refusal naming why; the *pasaran* and *wuku* for the same date compute fine, because those cycles are continuous. Never extrapolate a system outside its range.

**The engine is pure.** `(jdn, options) → CalendarTrace`. No clock — "today" is resolved in the UI and passed in. No randomness, no module state.

**Day boundary is an explicit option.** Javanese days traditionally begin at sunset, as Hijri days do, so a date after sunset belongs to the following *weton*. Most implementations silently ignore this. Make it an option, default it to midnight for predictability, and document the choice.

## 8. Testing

**Anchor fixtures from published calendars.** Known correspondences transcribed from printed Javanese calendars and government sources, cited per entry. This is the closest thing to an oracle.

**Cycle invariants over long ranges.** Across a century of consecutive days: *pasaran* repeats with period exactly 5, *weton* exactly 35, *wuku* exactly 210. Consecutive days advance every cycle by exactly one, with no gaps and no repeats.

**Round-trip.** Gregorian → Javanese → Gregorian returns the original, across the full supported range.

**Kurup boundary tests.** Dates either side of a kurup transition must produce the documented change. Aboge and Asapon must diverge exactly where the sources say they diverge, and agree everywhere else.

**Range refusal.** Lunar conversion before 1633 CE returns a structured refusal. *Pasaran* and *wuku* for the same date succeed. Both directions asserted.

**Cross-check against the Balinese pawukon** for the shared *wuku* cycle, using published Balinese calendar data as an independent source.

**Determinism.** Same JDN and options produce a byte-identical trace.

## 9. Design direction

The material world is the **printed primbon**: letterpress on aged paper, dense tables, and rubrication — the traditional use of red ink for emphasis alongside black.

**That two-colour tradition carries the ethical distinction in §4.** Rubric red `#A83C28` is used *only* for the primbon layer — traditional interpretation, quoted from a source. Indigo `#2B4470` is used *only* for computed, verifiable values. The reader learns within seconds which is which, without being lectured, and the palette makes it impossible to blur them.

**Palette.** Aged paper `#EFE8D8`. Ink `#201C16` for structure and prose. Indigo `#2B4470` for computation. Rubric red `#A83C28` for tradition. Ochre `#B08A3E` for cycle markers on the wheels. Muted grey `#8C8578` for out-of-range and unverified values.

**Type.** Tables are the content, so tabular figures throughout. **Petrona** for prose and headings — a text serif with vernacular warmth, in the register of a printed almanac. **Sometype Mono** for dates, numbers, and the arithmetic trace, with a typewriter quality that reads as working-out. **Karla** for controls.

**Structure.** Dense tables with hairline rules, in the manner of an almanac page — the density is authentic and appropriate, not something to design away. The calendar grid follows the familiar Indonesian wall-calendar layout, with secondary dates in small print beneath each Gregorian day.

**Motion.** One orchestrated moment: stepping a day rotates all three cycle rings by one position, and the rings visibly return to alignment at 35 days. That single animation teaches the modular arithmetic more effectively than any explanation. Nothing else moves.

**Copy.** Indonesian first, Javanese terminology always — *weton*, *pasaran*, *neptu*, *wuku*, *windu*, *kurup*, *selapanan*, *mangsa* — glossed on first use, never replaced with English approximations. Interpretations are always attributed: *"Menurut Primbon [sumber], …"* Never *"Anda akan …"*.

## 10. Milestones

| | | |
|---|---|---|
| **M0** | Scaffold | Static export deploying, JDN conversion, anchor schema and build-time validator. |
| **M1** | Cycles | *Pasaran*, *dina*, *weton*, neptu, *wuku* from cited anchors. Invariant tests over a century. Console only. |
| **M2** | Lunar year | *Windu*, year names, month lengths, kurup handling, Aboge/Asapon, validity ranges and refusals. |
| **M3** | UI | Cycle wheels, conversion with expandable trace, calendar grid. **Ship publicly here** — calendar only, no primbon layer. |
| **M4** | Divergence | Kurup explanation, Aboge/Asapon side-by-side, sources page. The differentiator. |
| **M5** | Mangsa + selapanan | *Pranata mangsa*, *selapanan* dates, *slametan* reckoning. |
| **M6** | Primbon | Cited interpretation tables, regional variation, reviewer sign-off required. |

**M3 ships without the interpretive layer deliberately.** The calendar engine stands alone as a correct, useful, honest tool. The primbon layer needs a reviewer and needs the visual separation working properly first.

## 11. Success criteria

- Every anchor fixture reproduces exactly.
- Cycle periods hold exactly across a century of consecutive days.
- Round-trip holds across the full supported range.
- Aboge and Asapon diverge exactly where sources say, and nowhere else.
- Pre-1633 lunar requests refuse; *pasaran* and *wuku* for the same dates succeed.
- Every anchor and every primbon entry carries a citation, enforced by the build.
- No `Date` object anywhere in the engine.
- A user can see the full derivation of any value in one tap.
- Fully offline after first load. JS ≤ 200 KB gzipped.

## 12. Deployment

`output: 'export'`, `basePath` matching the repository name, `images.unoptimized`, `trailingSlash: true`, `.nojekyll` in the output root. Anchor and citation validation gates the deploy. Verify under the production `basePath` with `pnpm preview` before pushing.

## 13. Risks

| Risk | Mitigation |
|---|---|
| **Sources disagree, and the app becomes another undocumented weton site.** | Cited anchors, visible arithmetic, divergence shown rather than resolved. If sources conflict, publish the conflict. |
| **Primbon presented as prediction.** | §4 is binding: attribution always, no ranking, no recommendation, no generated interpretation, colour separation enforced in the palette. Reviewer gate on M6. |
| **Kurup handling wrong for historical dates.** | Boundary fixtures either side of every documented transition. Never hardcode the current kurup. |
| **Extrapolating the lunar system before 1633.** | Per-subsystem validity ranges, structured refusal, asserted in both directions. |
| **Day-boundary ambiguity (sunset vs midnight).** | Explicit option, documented default, never silently assumed. |
| **No reviewer for the primbon layer.** | Then M6 does not ship. M3–M5 is a complete and defensible product without it. |
| **Scope creep into Balinese pawukon or Hijri computation.** | §5 is binding. Both are serious separate projects. |
