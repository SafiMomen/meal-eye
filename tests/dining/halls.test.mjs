import assert from "node:assert/strict";
import { test } from "node:test";

import {
  findDiningHall,
  getDiningHallDisplayName,
  getDiningHallMenuSources,
  getDiningHallSidebarLabel,
} from "../../lib/dining/halls.ts";
import { parseDiningLocations } from "../../lib/parsing/locations.ts";
import {
  createDiningHref,
  resolveMealPeriod,
} from "../../lib/dining/meal-periods.ts";

const rocky = {
  name: "Rockefeller College",
  link: "https://example.test/rocky",
};
const mathey = { name: "Mathey College", link: "https://example.test/mathey" };
const forbes = { name: "Forbes College", link: "https://example.test/forbes" };

test("only Mathey supplies the combined hall menu, with source records unchanged", () => {
  const halls = [forbes, rocky, mathey];
  const snapshot = structuredClone(halls);
  const sources = getDiningHallMenuSources(halls);

  assert.deepEqual(sources, [forbes, mathey]);
  assert.equal(sources[1], mathey);
  assert.equal(sources[1].link, "https://example.test/mathey");
  assert.deepEqual(halls, snapshot);
});

test("raw location parsing retains the original names and links", () => {
  const html = `
    <ul id="residential">
      <li class="residential"><a href="rocky">Rockefeller College</a></li>
      <li class="residential"><a href="mathey">Mathey College</a></li>
      <li class="residential"><a href="forbes">Forbes College</a></li>
    </ul>
  `;
  const locations = parseDiningLocations(html, "https://example.test/");
  assert.deepEqual(locations, [rocky, mathey, forbes]);
  assert.deepEqual(getDiningHallMenuSources(locations), [mathey, forbes]);
});

test("Rocky aliases are ignored as source records, regardless of case or spacing", () => {
  const halls = [
    { name: " ROCKEFELLER   College ", link: "rocky" },
    { name: "Rocky College", link: "rocky" },
    mathey,
  ];
  assert.deepEqual(getDiningHallMenuSources(halls), [mathey]);
});

test("combined label remains Rocky & Mathey even when Rocky is absent", () => {
  for (const halls of [[mathey], [rocky, mathey]]) {
    const sources = getDiningHallMenuSources(halls);
    assert.deepEqual(
      sources.map((hall) => getDiningHallSidebarLabel(hall.name)),
      ["Rocky & Mathey"],
    );
  }
});

const sidebarLabels = [
  ["Mathey College", "Rocky & Mathey"],
  ["Forbes College", "Forbes"],
  ["Graduate College", "Graduate"],
  ["Whitman College & Butler College", "Whitman & Butler"],
  ["Yeh & Huo Colleges", "Yeh & Huo"],
  ["Center for Jewish Life", "Center for Jewish Life"],
  ["Collegiate Dining", "Collegiate Dining"],
];

for (const [sourceName, label] of sidebarLabels) {
  test(`sidebar label: ${sourceName}`, () => {
    assert.equal(getDiningHallSidebarLabel(sourceName), label);
  });
}

test("menu titles retain source names except for the combined Mathey location", () => {
  assert.equal(getDiningHallDisplayName(mathey.name), "Rocky & Mathey");
  assert.equal(getDiningHallDisplayName(forbes.name), "Forbes College");
  assert.equal(
    getDiningHallDisplayName("Yeh & Huo Colleges"),
    "Yeh & Huo Colleges",
  );
});

test("legacy Rocky links and the new label resolve to Mathey's original record", () => {
  const sources = getDiningHallMenuSources([rocky, mathey, forbes]);
  const aliases = [
    "Rockefeller College",
    "Rockefeller",
    "Rocky",
    "Rocky & Mathey",
    "Mathey College",
    "Mathey",
    "  ROCKY & MATHEY  ",
  ];

  for (const requestedName of aliases) {
    const selected = findDiningHall(sources, requestedName);
    assert.equal(selected, mathey);
    assert.deepEqual(createDiningHref("Lunch", selected.name), {
      pathname: "/",
      query: { hall: "Mathey College", meal: "lunch" },
    });
  }
});

test("Mathey remains the source even when Rocky has additional meal periods", () => {
  const menus = new Map([
    [rocky.link, { Breakfast: {}, Lunch: {}, Dinner: {} }],
    [mathey.link, { Dinner: {} }],
  ]);
  const selected = findDiningHall(
    getDiningHallMenuSources([rocky, mathey]),
    "Rockefeller College",
  );

  assert.equal(selected.link, mathey.link);
  assert.equal(
    resolveMealPeriod("Lunch", false, menus.get(selected.link)),
    "Dinner",
  );
  assert.equal(getDiningHallSidebarLabel(selected.name), "Rocky & Mathey");
});

test("missing sources do not fall back to a Rocky menu request", () => {
  const sources = getDiningHallMenuSources([rocky, forbes]);
  assert.equal(findDiningHall(sources, "Rocky & Mathey"), undefined);
  assert.equal(findDiningHall(sources, "Rockefeller College"), undefined);
  assert.equal(findDiningHall(sources, "Unknown Hall"), undefined);
  assert.equal(findDiningHall(sources, undefined), undefined);
  assert.equal(findDiningHall(sources, "Forbes"), forbes);
});
