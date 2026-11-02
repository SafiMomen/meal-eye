import { createBrowserStore } from "../storage/browser-store.ts";
import {
  DEFAULT_FITNESS_DATA,
  FITNESS_STORAGE_KEY,
  parseFitnessData,
  serializeFitnessData,
} from "./persistence.ts";

export const fitnessStore = createBrowserStore({
  key: FITNESS_STORAGE_KEY,
  initialValue: DEFAULT_FITNESS_DATA,
  parse: parseFitnessData,
  serialize: serializeFitnessData,
});
