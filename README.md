# Meal Eye

A compact Princeton dining-menu browser with nutrition cards and configurable
religious dietary indicators.

## Development

```sh
npm install
npm run dev
```

Open http://localhost:3000. Tests use Node's built-in TypeScript support and
were validated with Node 24.

## Checks

```sh
npm run test
npm run typecheck
npm run lint
npm run format:check
```

Run `npm run format` to apply the repository's formatting conventions.

## Code organization

- `app/`: route entry points and the root layout.
- `components/dining/`: hall selection, meal controls, menu display, and
  workspace.
- `components/nutrition/`: nutrition cards, summaries, and nutrient groups.
- `components/dietary/`: preference state, tag displays, and explanations.
- `components/motion/`: shared animation components.
- `hooks/`: client-side hooks.
- `types/`: shared dining, dietary, nutrition, and parsing models.
- `lib/dining/` and `lib/dietary/`: domain rules and explanation formatting.
- `lib/parsing/`: pure HTML parsers, independent of network requests.
- `lib/nutrition/`: nutrient definitions and formatting.
- `lib/motion/`: named animation settings.
- `services/dining/`: server-only cached requests.
- `tests/`: domain and parser tests grouped by feature.

## Conventions

Keep one React component per file. Place component props in the feature's
`types.ts`; derive them from shared domain types instead of repeating fields.
Keep providers, contexts, and hooks separate.

Use explicit imports rather than broad barrel exports, especially across
server/client boundaries. Client components must not import request services.
Pure library modules use explicit relative `.ts` imports so the Node test runner
can load them without an additional transpiler.

Prefer descriptive identifiers and named settings for animation timings, stagger
calculations, and layout offsets. Keep related pure helpers together; do not
create a new component or abstraction for every expression.

Formatting targets 80 columns, with a lint limit of 100 columns except URLs.
Split long signatures, expressions, and Tailwind class groups across lines.
Within `clsx`, keep layout, spacing, appearance, and interaction classes
grouped.

The cache policy and request headers live in `config/dining.ts`. Keep parsing
tests free of live network access. Dietary tags are menu-based indicators, not
independent religious certification.

## Meal schedules

Meal options follow the selected hall's published periods and the current date
in Princeton's `America/New_York` time zone. On weekends, halls with Breakfast
retain their Breakfast and Lunch labels. Halls without Breakfast display their
Lunch period as Brunch. A genuine Brunch period takes precedence over that
alias. Cards, hall links, and sidebar dietary warnings share this schedule;
cached source menus remain unchanged.

The lightning icon to the left of a hall indicates that its displayed meal has
at least one item with 20 g or more protein per serving and no active dietary
warnings. Changing religious-tag or restriction preferences updates the icon
immediately. Its tooltip names qualifying foods. Unknown religious
classifications remain uncertain under the same rules as the cards; the icon
does not certify them. Qualifying rows also receive a muted yellow gradient
fading toward the right.

Abbreviated H, NK, and R badges summarize Haram, Non-Kosher, and selected
restriction matches among the hall's entrées for its displayed meal. They use
the food cards' badge styles and explanation dialogs, and follow active
preferences without classifying every food in the hall.

## Dietary restrictions

Restriction preferences add a single clickable Restricted badge to matching
foods. Matching checks declared allergens first, then ingredient text, then the
food name. Multiple restrictions share one badge, with the matching terms shown
in its explanation. Preferences stay in client memory across hall and meal
navigation and start with no restrictions selected.

The keyword groups use the
[FDA major-allergen categories](https://www.fda.gov/food/food-allergensgluten-free-guidance-documents-regulatory-information/frequently-asked-questions-food-allergen-labeling-guidance-industry)
and
[gluten-containing grains](https://www.fda.gov/food/nutrition-food-labeling-and-critical-foods/questions-and-answers-gluten-free-food-labeling-final-rule)
as references. Alcohol reuses the existing conservative religious-tag keyword
list. These are menu-text matches, not allergy or cross-contact certification;
absence of a badge does not establish that food is safe for an allergy.

Visible Haram, Non-Kosher, and Restricted badges enable a dark red gradient on
the food card. Turning off the corresponding preference removes that warning.
