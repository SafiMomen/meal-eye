import { formatNutrient } from "@/lib/nutrition/format";
import { nutritionStyles as styles } from "./styles";
import type { NutrientGroupProps } from "./types";

export function NutrientGroup({ nutrition, definition }: NutrientGroupProps) {
  return (
    <dl className={styles.macroPanel}>
      <div className={styles.macroHeader}>
        <dt className={styles.macroValue}>{definition.label}</dt>
        <dd className={styles.macroValue}>
          {formatNutrient(nutrition[definition.field], definition.unit)}
        </dd>
      </div>
      <div className={styles.macroDetails}>
        {definition.details.map((detail) => (
          <div key={detail.field}>
            <dt className={styles.inlineDefinition}>{detail.label} </dt>
            <dd className={styles.inlineDefinition}>
              {formatNutrient(nutrition[detail.field], detail.unit)}
            </dd>
          </div>
        ))}
      </div>
    </dl>
  );
}
