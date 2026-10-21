/* 
internal linking of dining hall pages
on the website: https://menus.princeton.edu/dining/_Foodpro/online-menu/
*/ 
export type DiningHallElement = {
    name: string,
    link?: string
}

export type ReligiousTag = "Halal" | "Haram" | "Kosher" | "Non-Kosher";

/* 
Food or item included in the menu.
*/
export type FoodElement = {
    /* food meta-data */
    foodName: string,
    servingSize: string | null,
    ingredients: string[],
    allergens: string[],
    religiousTags: ReligiousTag[],

    /* important categories */
    calories: number | null,
    proteinGrams: number | null,
    sodiumMilligrams: number | null,

    /* macro-nutrients */
    totalFatGrams: number | null,
    saturatedFatGrams: number | null,
    transFatGrams: number | null,

    totalCarbohydratesGrams: number | null,
    dietaryFiberGrams: number | null,
    sugarsGrams: number | null,

    cholesterolMilligrams: number | null,
}

/* 
Dining Hall menu's include period i.e. breakfast, brunch, lunch, or dinner

Each period includes categories of food e.g. Entree, Side, etc

Each of these categories then include food items.
*/
export type DiningHallMenu = {
    [period: string]: {
        [category: string]: FoodElement[]
    };
};
