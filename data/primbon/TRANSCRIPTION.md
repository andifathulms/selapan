# Transcribing primbon entries

This directory is empty on purpose. M6 is gated on a reviewer (PRD §4, §10), and
nothing here should be filled in before that person is recruited and has agreed
to be credited by name.

What follows is the shape the data must take when that happens, so that the
transcription work can be done — by hand, from a printed page — without having
to rediscover the constraints. `pnpm data:validate` enforces every rule marked
**enforced** below, and it runs before the build. It is not a style guide.

## The source

The reference edition is:

> Tjakraningrat, Kangjeng Pangeran Harya. *Kitab Primbon Betaljemur Adammakna:
> ngewrat ilmu-ilmu Jawi 337 bab*. Yogyakarta: Soemodidjojo Mahadewa.

A complete 260-page scan is on Wikimedia Commons as
`File:Kitab Primbon Betaljemur Adammakna.pdf`, tagged `PD-IDOld-Art58`. The work
is also catalogued by UGM's rare-book library (`langka.lib.ugm.ac.id`, record
1681), WorldCat, and Open Library, so a library record can be cited alongside
the scan rather than the scan alone.

Two cautions before relying on that tag. The public-domain claim rests on
Tjakraningrat's death date and is an uploader's assertion, not a determination;
and the modern Soemodidjojo typesetting may carry an editorial copyright
separate from the underlying text. Short attributed table entries are quotation
either way, but the site should not itself claim the book is public domain.

The book is organised into 337 numbered *bab*. That numbering is the natural
`locator`, and it is stable across printings in a way page numbers are not — so
cite the bab, and add the page of the edition actually consulted.

## One entry, one file

```jsonc
{
  "id": "primbon.<table>.<key>",
  "table": "<name of the reckoning, e.g. watak-weton>",
  "key": "<what indexes it, e.g. rebo-wage>",
  "category": "<the name the source gives this outcome>",
  "text": "<the source's description, in the third person>",
  "attribution": "Menurut <source>, ...",
  "source": {
    "title": "Kitab Primbon Betaljemur Adammakna",
    "author": "Kangjeng Pangeran Harya Tjakraningrat",
    "publisher": "Soemodidjojo Mahadewa",
    "year": 0,
    "locator": "bab <n>, hlm. <n>",
    "url": "<optional, the Commons scan>"
  },
  "regionalVariant": "<optional, where a tradition differs — see below>",
  "status": "unverified"
}
```

## Rules the validator enforces

1. **`attribution` must begin with the literal word `Menurut`.** Enforced by
   the schema, not by review. There is no entry without an attributed voice.
2. **No second person, anywhere in `text`, `category`, or `attribution`.** The
   check covers `anda`, `kamu`, `kowe`, `panjenengan`, `sampeyan`, `you`, and
   `your`. An interpretation is a statement about a reckoning, never about the
   reader (PRD §4).
3. **No ranking, scoring, or recommendation** in `text`: percentages, *paling
   baik*, *terbaik*, and *skor* all fail the build (PRD §5).
4. **`source.locator` is required** and must name a place in the work.
5. **`id` must be unique** across the directory.

## Rules the validator cannot enforce

These are the ones a human has to hold, which is exactly why the reviewer gate
exists.

- **Transcribe, never paraphrase, and never fill a gap.** If the source has no
  entry for a key, that key has no entry here. There is no interpolation and no
  nearest match. An absent combination should read as absent.
- **Translate only into the third person you were already given.** The source is
  largely in Javanese; rendering it into Indonesian is unavoidable, and it is
  the single place where a transcriber can silently turn description into
  prediction. Keep the grammatical subject the reckoning or the category, never
  a person.
- **Categories are named, not ordered.** *Pegat* is not worse than *Ratu*; it is
  a different name in the same table. Nothing in the data should imply a
  sequence, and the UI must be able to show all categories at once without one
  of them being the answer.
- **Where sources disagree, add both entries** and distinguish them with
  `regionalVariant`. Do not choose. Publishing the disagreement is the point
  (CLAUDE.md working style), and a second source that contradicts Betaljemur is
  more valuable than a third that agrees with it.
- **`status` stays `unverified`** until a second, independent source or the
  reviewer confirms the entry, exactly as with anchors.

## Tables worth transcribing first

In the order they are most useful, and least prone to being misread as advice:

| `table` | Indexed by | Notes |
|---|---|---|
| `watak-weton` | `<dina>-<pasaran>`, 35 keys | Character description per weton. The largest table and the plainest to present. |
| `watak-wuku` | wuku name, 30 keys | Independent of the above; useful for showing that the systems are separate. |
| `pasangan` | the sum of two neptu | The *Pegatan* eight-fold reckoning. Present as a table with the computed sum marking a row — never as a verdict on a pair. |

The neptu arithmetic feeding the third of these is already computed, traced, and
rendered indigo. Only the category name and its description come from here, and
they render rubric red. If a screen ever shows those two in the same colour,
something has gone wrong upstream of the data.
