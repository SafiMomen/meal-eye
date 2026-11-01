import { DietaryTagList } from "@/components/dietary/tag-list";
import {
  MACRONUTRIENT_GROUPS,
  ADDITIONAL_NUTRIENTS,
} from "@/lib/nutrition/fields";
import { formatNutrient } from "@/lib/nutrition/format";
import { NutrientGroup } from "./nutrient-group";
import { nutritionStyles as styles } from "./styles";
import type { NutritionDetailsProps } from "./types";

export function NutritionDetails({
  nutrition,
  foodName,
  tags,
  reasons,
  restrictionMatches,
}: NutritionDetailsProps) {
  return (
    <div className={styles.expandedInner}>
      <div className={styles.nutrientGrid}>
        {MACRONUTRIENT_GROUPS.map((definition) => (
          <NutrientGroup
            key={definition.field}
            definition={definition}
            nutrition={nutrition}
          />
        ))}

        <dl className={styles.additionalNutrientGrid}>
          {ADDITIONAL_NUTRIENTS.map(({ field, label, unit }) => (
            <div key={field} className={styles.additionalNutrientPanel}>
              <dt className={styles.additionalNutrientLabel}>{label}</dt>
              <dd className={styles.additionalNutrientValue}>
                {formatNutrient(nutrition[field], unit)}
              </dd>
            </div>
          ))}
        </dl>
      </div>

      {tags.length > 0 && (
        <section
          className={styles.religiousSection}
          aria-label="Dietary classifications and restrictions"
        >
          <h3 className={styles.religiousHeading}>Diet</h3>
          <DietaryTagList
            foodName={foodName}
            tags={tags}
            reasons={reasons}
            restrictionMatches={restrictionMatches}
          />
        </section>
      )}
    </div>
  );
}
