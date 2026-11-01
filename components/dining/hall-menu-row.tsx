import { DiningHallSelectionRow } from "./hall-selection-row";
import { getMenu } from "@/services/dining/get-menu";
import { getEntreeFoods } from "@/lib/dining/entree-tags";
import { getMenuAvailability } from "@/lib/dining/availability";
import { resolveMealPeriod } from "@/lib/dining/meal-periods";
import { getHighProteinFoods } from "@/lib/dining/protein-options";
import type { DiningHallMenuRowProps } from "./types";

export async function DiningHallMenuRow({
  hall,
  selectedMeal,
  isSelected,
  isWeekend,
}: DiningHallMenuRowProps) {
  const menu = hall.link ? await getMenu(hall).catch(() => null) : {};
  const availability = getMenuAvailability(menu);
  const hallMeal = resolveMealPeriod(selectedMeal, isWeekend, menu);
  const entreeFoods =
    menu === null ? [] : getEntreeFoods(menu, hallMeal, isWeekend);
  const highProteinFoods =
    menu === null ? [] : getHighProteinFoods(menu, hallMeal, isWeekend);

  return (
    <DiningHallSelectionRow
      hallName={hall.name}
      selectedMeal={hallMeal}
      isSelected={isSelected}
      availability={availability}
      entreeFoods={entreeFoods}
      highProteinFoods={highProteinFoods}
    />
  );
}
