export type BrowserStoreOptions<Value> = {
  key: string;
  initialValue: Value;
  parse: (serialized: string | null) => Value;
  serialize: (value: Value) => string;
};
