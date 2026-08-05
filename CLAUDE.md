# CLAUDE.md — Selapan

Javanese calendar and *weton* engine. Four interlocking cycles, visible arithmetic, correct *kurup* handling across history, and a hard separation between what is computed and what is tradition. Static site, GitHub Pages, no backend.

Read `PRD.md` before starting any task — **§4 in particular**. It fixes scope; this file describes how to work in the repo.

**Three things shape everything:**

1. **Computation and interpretation are separate, in the code and in the palette.** Dates, cycles, and neptu sums are arithmetic and render in indigo. Primbon interpretations are documented tradition, always attributed, and render in rubric red. Never blur them, never generate an interpretation, never phrase one as a statement about the user.
2. **Julian Day Number is the internal representation.** Integer day counts, modulo cited anchors. **No `Date` objects anywhere in the engine** — no timezones, no DST, no locale.
3. **Validity ranges are per-subsystem.** The 5-, 7-, and 210-day cycles are continuous and unbounded. The lunar year system begins in 1633 CE and means nothing before it. Refuse outside range; never extrapolate.

---

## Stack

- Next.js 14, App Router, `output: 'export'` — static only
- TypeScript, `strict: true`
- Tailwind CSS
- Zod for anchor and citation schema validation
- Vitest
- pnpm
- **No date library.** Not date-fns, not Luxon, not Temporal polyfills. JDN arithmetic is integers.

## Commands

```bash
pnpm dev
pnpm build                  # static export to ./out; runs data:validate first
pnpm preview                # serve ./out under the production basePath
pnpm test                   # vitest watch
pnpm test:run               # vitest once — before every commit
pnpm test:cycles            # cycle-period invariants over a century
pnpm test:anchors           # cited anchor fixtures
pnpm test:kurup             # kurup boundaries, Aboge/Asapon divergence
pnpm data:validate          # anchor + primbon citation presence, schema
pnpm typecheck
pnpm lint
```

`pnpm data:validate` gates the build and CI. Do not weaken it.

## Layout

```
app/
  [locale]/                 # id (default), en
    ubah/                   # conversion + cycle wheels
    kalender/               # month grid
    kurup/                  # divergence view + sources
    mangsa/                 # pranata mangsa
    primbon/                # cited interpretation tables — M6, gated
components/
  wheels/                   # concentric cycle rings
  trace/                    # expandable derivation
  grid/                     # wall-calendar layout
lib/
  jdn/                      # Gregorian ↔ JDN. Integers only.
  cycles/                   # pasaran, dina, weton, wuku, neptu. Unbounded.
  lunar/                    # windu, tahun, months, kurup. From 1633 CE.
  trace/                    # CalendarTrace types, derivation steps
  range/                    # per-subsystem validity + structured refusals
data/
  anchors/                  # cited date correspondences
  kurup/                    # kurup definitions + transitions + sources
  primbon/                  # interpretation tables, attributed per entry
  mangsa/
tests/
  anchors/
  cycles/
  kurup/
  range/
```

## Invariants

1. **No `Date` object in `lib/`.** Input is parsed to JDN at the UI boundary; everything downstream is integer arithmetic. No timezone handling, no DST, no `toLocaleDateString`, no clock. "Today" is resolved in the UI and passed in as a parameter.

2. **Every cycle is a modulo against a cited anchor.** Anchors live in `data/anchors/` with a source and a verification date. Never hardcode an epoch in a `.ts` file, never derive one from a `Date`.

3. **Validity ranges are enforced per subsystem, not globally.** A pre-1633 request returns a lunar refusal *and* a valid *pasaran* and *wuku*. Both halves of that behaviour are asserted. Never extrapolate a system outside its range, never clamp, never return a nearest match.

4. **Refusals are structured.** `{ subsystem, reason, validFrom, validTo }`. Never a thrown string, never a silent null, never a plausible wrong date.

5. **Never hardcode the current kurup.** Kurup applicability is looked up from `data/kurup/` by date. Assuming Asapon is exactly why existing implementations return wrong historical dates.

6. **Aboge and Asapon are both first-class.** Neither is "correct" and the other "legacy". Where they diverge, present both with the mechanism. Communities reckon by both, and the app must not contradict a user's own tradition.

7. **The engine is pure.** `(jdn, options) → CalendarTrace`. No React, no DOM, no clock, no randomness, no module-level mutable state.

8. **Every trace step records its derivation** — anchor, offset, modulus, result, citation. All expandable values are built from this. A step without a derivation is unfinished.

9. **Interpretation is data, never code, never generated.** Every primbon entry is a lookup into `data/primbon/` with an attributed source. If it is not in the source, it does not appear. There is no fallback, no interpolation, no "closest match".

10. **Interpretations are never phrased as statements about the user.** Always attributed: "Menurut [sumber], …". Never "Anda akan …". No second-person predictions anywhere in the copy or the data.

11. **No ranking, scoring, or recommendation.** No percentages, no "best day", no compatibility scores, no ordering of outcomes as better or worse. Categories are named and attributed, nothing more.

12. **Colour carries the computed/tradition distinction and is not decorative.** `indigo` for computed values only. `rubric` red for primbon material only. Never use either for anything else, never mix them in one element. See PRD §9.

13. **The slametan calculator presents dates only.** Counting rules stated and cited. No interpretation attached — it serves people during bereavement and must stay plain.

14. **Day-boundary handling is an explicit option**, defaulting to midnight, documented. Never silently assume sunset reckoning, never silently ignore it.

15. **Javanese terminology is preserved** in identifiers, comments, and UI: `weton`, `pasaran`, `neptu`, `wuku`, `windu`, `kurup`, `selapanan`, `mangsa`, `tahun`. Do not substitute English approximations.

16. **Nothing is computed in a component.**

## Working style

- **Anchors before arithmetic.** Transcribe and cite the anchor fixture, then implement the cycle against it.
- **Cycle invariants are the cheapest strong test you have.** Assert period exactness over long ranges early — they catch off-by-one anchor errors immediately.
- **When sources disagree, publish the disagreement.** Do not silently pick. This is the Rinci pattern and it is what makes the project trustworthy.
- **When you don't know a calendrical rule, say so.** Do not infer *kurup* behaviour or month-length patterns from the general shape of the system. Mark it unverified or leave it out and flag it.
- **Build the primbon layer last, and not without a reviewer.** M3 ships as a calendar engine alone and is a complete product. The interpretive layer is gated.
- **Small increments.** One cycle, fully verified, with its anchors cited.
- **Don't touch `next.config.js`, the Actions workflow, or the validator without saying so explicitly.**
- **Don't add a date library.** JDN is integer arithmetic; a library would introduce timezone semantics that are actively wrong here.
- **Never weaken a test or the validator to make something pass.**

## Conventions

- Named exports; defaults only where Next requires them.
- Discriminated unions for trace steps, results, and refusals, keyed on `type`. Exhaustive `switch` with a `never` default.
- No `any`. No non-null `!` in `lib/`.
- Integers throughout. JDN, cycle offsets, neptu, and year numbers are all integers. No floats anywhere in `lib/`.
- Anchor ids stable and readable: `anchor.pasaran.1633`, `anchor.wuku.pawukon`, `kurup.asapon.1936`. They appear in traces and citations.
- Comments cite the source for any rule they implement — the anchor, the kurup transition, the month-length pattern.
- Tailwind utilities inline; semantic tokens in `tailwind.config.ts` — `paper`, `ink`, `indigo`, `rubric`, `ochre`, `unverified`. Never raw hex in components.

## Testing rules

- `pnpm test:run` before every commit; `pnpm test:cycles` and `pnpm test:anchors` before any engine commit.
- New cycle → period-exactness assertion over at least a century of consecutive days, plus consecutive-day advance-by-one with no gaps or repeats.
- New anchor → cited, and a fixture asserting the conversion it fixes.
- New kurup → boundary fixtures either side of its transition, plus a divergence assertion against the neighbouring kurup.
- Round-trip (Gregorian → Javanese → Gregorian) asserted across the full supported range.
- Range refusals asserted in **both** directions: lunar refuses pre-1633, cycles succeed for the same dates.
- Cross-check the *wuku* cycle against published Balinese *pawukon* data as an independent source.
- New primbon entry → citation required, and an assertion that no entry contains second-person phrasing.
- Bug fix → failing test first.

## Deployment

`main` builds and deploys via Actions; anchor and citation validation gates it. `basePath` must match the repository name; `.nojekyll` must exist in `out/`. Verify with `pnpm preview` before pushing.

## Framing

The site states plainly that it is a personal project, not an authority, that traditions vary regionally, and that primbon material is presented as cultural documentation rather than prediction. Sources are cited per entry. A reviewer familiar with Javanese calendrical practice is credited by name, with consent, before the primbon layer ships.

## Current state

M0 — not yet scaffolded. Next: static export deploying to Pages, JDN conversion with test vectors, and the anchor schema plus validator. **No cycle work before the anchors are cited and validated.**
