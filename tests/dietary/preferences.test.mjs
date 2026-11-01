import assert from "node:assert/strict";
import { test } from "node:test";

import { getVisibleReligiousTags } from "../../lib/dietary/preferences.ts";

const both = { muslim: true, jewish: true };
const muslim = { muslim: true, jewish: false };
const jewish = { muslim: false, jewish: true };
const neither = { muslim: false, jewish: false };

const cases = [
  ["unknown food gets a Muslim uncertainty tag", [], muslim, ["Halal?"]],
  ["Halal stays confirmed", ["Halal"], muslim, ["Halal"]],
  ["Haram stays prohibited, not uncertain", ["Haram"], muslim, ["Haram"]],
  ["Muslim hides Kosher tags", ["Halal", "Kosher"], muslim, ["Halal"]],
  [
    "Kosher alone does not establish Halal",
    ["Kosher"],
    both,
    ["Halal?", "Kosher"],
  ],
  [
    "Non-Kosher alone does not establish Haram",
    ["Non-Kosher"],
    both,
    ["Halal?", "Non-Kosher"],
  ],
  [
    "both selections show both classifications",
    ["Haram", "Non-Kosher"],
    both,
    ["Haram", "Non-Kosher"],
  ],
  ["Jewish hides Muslim tags", ["Halal", "Kosher"], jewish, ["Kosher"]],
  [
    "Jewish preserves Non-Kosher",
    ["Haram", "Non-Kosher"],
    jewish,
    ["Non-Kosher"],
  ],
  ["Jewish does not invent an unknown Kosher tag", [], jewish, []],
  ["neither selection hides all tags", ["Haram", "Kosher"], neither, []],
  ["neither selection hides uncertainty", [], neither, []],
];

for (const [name, tags, preferences, expected] of cases) {
  test(name, () => {
    assert.deepEqual(getVisibleReligiousTags(tags, preferences), expected);
  });
}

test("display preferences do not mutate source classifications", () => {
  const tags = Object.freeze(["Kosher"]);
  getVisibleReligiousTags(tags, both);
  assert.deepEqual(tags, ["Kosher"]);
});
