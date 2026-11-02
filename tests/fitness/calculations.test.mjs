import assert from "node:assert/strict";
import { test } from "node:test";
import {
  calculateRemainingCalories,
  estimateDailyCalories,
} from "../../lib/fitness/calculations.ts";
import {
  draftToProfile,
  isValidFitnessProfile,
  profileToDraft,
} from "../../lib/fitness/profile.ts";
import { getPrincetonDateKey } from "../../lib/dining/calendar.ts";

const profile = {
  weightKg: 75,
  heightCm: 180,
  age: 30,
  formulaSex: "male",
  activityLevel: "light",
};

test("daily maintenance uses the Mifflin equation and selected activity multiplier", () => {
  assert.equal(estimateDailyCalories(profile), 2768);
  assert.equal(
    estimateDailyCalories({ ...profile, activityLevel: "inactive" }),
    2422,
  );
  const female = {
    ...profile,
    weightKg: 65,
    heightCm: 165,
    formulaSex: "female",
    activityLevel: "inactive",
  };
  assert.ok(Math.abs(estimateDailyCalories(female) - 1918.35) < 0.00001);
});

test("remaining calories can be positive, zero, or negative", () => {
  const totals = {
    calories: 1200,
    protein: 80,
    unknownCalorieItems: 0,
    unknownProteinItems: 0,
  };
  assert.equal(calculateRemainingCalories(2000, totals), 800);
  assert.equal(calculateRemainingCalories(1200, totals), 0);
  assert.equal(calculateRemainingCalories(1000, totals), -200);
  assert.equal(
    calculateRemainingCalories(2000.4, { ...totals, calories: 1200.6 }),
    799,
  );
  assert.equal(calculateRemainingCalories(null, totals), null);
  assert.equal(
    calculateRemainingCalories(2000, { ...totals, unknownCalorieItems: 1 }),
    null,
  );
});

test("profile validation rejects missing inputs and implausible/non-finite values", () => {
  assert.equal(isValidFitnessProfile(profile), true);
  for (const changes of [
    { age: 0 },
    { age: 30.5 },
    { weightKg: -1 },
    { heightCm: Infinity },
    { activityLevel: "__proto__" },
    { formulaSex: "" },
  ]) {
    assert.equal(isValidFitnessProfile({ ...profile, ...changes }), false);
  }
  assert.equal(draftToProfile(profileToDraft(null)), null);
});

test("pounds and feet/inches preserve saved measurements and calorie estimates", () => {
  const draft = profileToDraft(profile);
  assert.equal(draft.heightFeet, "5");
  assert.equal(draft.heightInches, "10.87");
  const restored = draftToProfile(draft);
  assert.ok(Math.abs(restored.weightKg - profile.weightKg) < 0.02);
  assert.ok(Math.abs(restored.heightCm - profile.heightCm) < 0.02);
  assert.ok(
    Math.abs(estimateDailyCalories(restored) - estimateDailyCalories(profile)) <
      1,
  );
});

test("height validates both fields and accepts zero inches", () => {
  const draft = profileToDraft(profile);
  for (const changes of [
    { heightFeet: "" },
    { heightInches: "" },
    { heightFeet: "5.5" },
    { heightInches: "12" },
    { heightInches: "-1" },
    { heightInches: "Infinity" },
    { weightPounds: "" },
  ]) {
    assert.equal(draftToProfile({ ...draft, ...changes }), null);
  }
  const sixFeet = draftToProfile({
    ...draft,
    heightFeet: "6",
    heightInches: "0",
  });
  assert.equal(sixFeet.heightCm, 182.88);
  const roundedHeight = profileToDraft({ ...profile, heightCm: 182.88 });
  assert.equal(roundedHeight.heightFeet, "6");
  assert.equal(roundedHeight.heightInches, "0");
});

test("daily logs use Princeton midnight, including the daylight-saving transition", () => {
  assert.equal(
    getPrincetonDateKey(new Date("2026-11-02T04:59:59Z")),
    "2026-11-01",
  );
  assert.equal(
    getPrincetonDateKey(new Date("2026-11-02T05:00:00Z")),
    "2026-11-02",
  );
  assert.equal(
    getPrincetonDateKey(new Date("2026-07-02T03:59:59Z")),
    "2026-07-01",
  );
  assert.equal(
    getPrincetonDateKey(new Date("2026-07-02T04:00:00Z")),
    "2026-07-02",
  );
});
