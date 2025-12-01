export const shallowEqual = (obj1: any, obj2: any): boolean =>
  Object.keys(obj1).every((key) => obj1[key] === obj2[key]);

export const isAnyDefault = (
  obj: Record<string, any>,
  defaultValues: Record<string, any>,
  ignore: string[] = []
): boolean =>
  Object.keys(obj).some(
    (key) => !ignore.includes(key) && obj[key] === defaultValues[key]
  );

export const isRowExists = (
  rows: Record<string, any>[],
  newRow: Record<string, any>,
  ignore :string[] = []
): boolean => {
  return rows.some((row) => shallowEqual(row, newRow));
};

export const unChangedKeys = (
  obj1: Record<string, any>,
  obj2: Record<string, any>,
  ignore: string[] = []
): string[] => {
  return Object.keys(obj1)
    .filter((key) => !ignore.includes(key)) // 🚫 ignore these keys
    .filter((key) => obj1[key] === obj2[key]); // compare remaining keys
};

export const getChangedKeys = (
  obj1: Record<string, any>,
  obj2: Record<string, any>,
  ignore: string[] = []
): string[] => {
  return Object.keys(obj1)
    .filter((key) => !ignore.includes(key)) // 🚫 ignore these keys
    .filter((key) => obj1[key] !== obj2[key]); // compare remaining keys
};

export const deepEqual = (obj1: any, obj2: any): boolean => {
  if (obj1 === obj2) return true;
  if (
    typeof obj1 !== "object" ||
    typeof obj2 !== "object" ||
    obj1 == null ||
    obj2 == null
  ) {
    return false;
  }
  const keys1 = Object.keys(obj1);
  const keys2 = Object.keys(obj2);
  if (keys1.length !== keys2.length) return false;
  for (const key of keys1) {
    if (!keys2.includes(key) || !deepEqual(obj1[key], obj2[key])) {
      return false;
    }
  }
  return true;
};
