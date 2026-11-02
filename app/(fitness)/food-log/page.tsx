import type { Metadata } from "next";
import { FitnessPage } from "@/components/fitness/page";
import { FoodLog } from "@/components/fitness/food-log";

export const metadata: Metadata = {
  title: "Food Log | Meal Eye",
};

export default function FoodLogPage() {
  return (
    <FitnessPage title="Today’s food log">
      <FoodLog />
    </FitnessPage>
  );
}
