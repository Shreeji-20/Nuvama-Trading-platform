import { get as lodashGet, set as lodashSet } from "lodash";
import { produce } from "immer";

// Helper function to set nested property immutably
export const setNestedProperty = (obj: any, path: string, value: any): any => {
  const keys = path.split(".");
  if (keys.length === 1) {
    return { ...obj, [path]: value };
  }

  const [firstKey, ...restKeys] = keys;
  return {
    ...obj,
    [firstKey]: setNestedProperty(
      obj[firstKey] || {},
      restKeys.join("."),
      value
    ),
  };
};

// Helper function to flatten nested objects into dot-notation paths
export const flattenObject = (
  obj: any,
  prefix: string = "",
  result: Record<string, any> = {}
): Record<string, any> => {
  Object.keys(obj).forEach((key) => {
    const value = obj[key];
    const fullPath = prefix ? `${prefix}.${key}` : key;

    if (value !== null && typeof value === "object" && !Array.isArray(value)) {
      // Recursively flatten nested objects
      flattenObject(value, fullPath, result);
    } else {
      // Add primitive values
      result[fullPath] = value;
    }
  });

  return result;
};

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
  ignore: string[] = []
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

export const getChangedKeysDeep = (
  obj1: any,
  obj2: any,
  ignore: string[] = []
): string[] => {
  const changed: string[] = [];

  const isObject = (v: any) =>
    v !== null &&
    typeof v === "object" &&
    !Array.isArray(v) &&
    !(v instanceof Date);

  const isDate = (v: any) => v instanceof Date;

  const equals = (a: any, b: any) => {
    if (isDate(a) && isDate(b)) return a.getTime() === b.getTime();
    return a === b;
  };

  /** FULL path-based ignore check */
  const shouldIgnore = (path: string) => {
    return ignore.includes(path);
  };

  const visit = (a: any, b: any, basePath = "") => {
    const aKeys = a && typeof a === "object" ? Object.keys(a) : [];
    const bKeys = b && typeof b === "object" ? Object.keys(b) : [];

    const keys = Array.from(new Set([...aKeys, ...bKeys]));

    for (const key of keys) {
      const path = basePath ? `${basePath}.${key}` : key;

      // ⛔ full path ignore
      if (shouldIgnore(path)) continue;

      const va = a?.[key];
      const vb = b?.[key];

      // Handle arrays
      if (Array.isArray(va) || Array.isArray(vb)) {
        if (!Array.isArray(va) || !Array.isArray(vb)) {
          changed.push(path);
          continue;
        }

        if (va.length !== vb.length) {
          changed.push(path);
          continue;
        }

        for (let i = 0; i < va.length; i++) {
          const idxPath = `${path}[${i}]`;

          if (shouldIgnore(idxPath)) continue;

          const eA = va[i];
          const eB = vb[i];

          if (isObject(eA) && isObject(eB)) {
            visit(eA, eB, idxPath);
          } else if (!equals(eA, eB)) {
            changed.push(idxPath);
          }
        }

        continue;
      }

      // Nested objects
      if (isObject(va) && isObject(vb)) {
        visit(va, vb, path);
        continue;
      }

      // If primitive comparison fails
      if (!equals(va, vb)) {
        changed.push(path);
      }
    }
  };

  visit(obj1, obj2);

  return Array.from(new Set(changed));
};

// utils/getChangedKeysDeep.ts

export function getChangedKeysDeepWithValues(
  original: any,
  updated: any,
  parentKey = ""
): Record<string, any> {
  let changes: Record<string, any> = {};

  for (const key in updated) {
    const fullKey = parentKey ? `${parentKey}.${key}` : key;

    const oldVal = original?.[key];
    const newVal = updated[key];

    const bothObjects =
      typeof oldVal === "object" &&
      typeof newVal === "object" &&
      oldVal !== null &&
      newVal !== null &&
      !Array.isArray(oldVal) &&
      !Array.isArray(newVal);

    // Recursively check nested objects
    if (bothObjects) {
      const nestedChanges = getChangedKeysDeep(oldVal, newVal, fullKey);
      Object.assign(changes, nestedChanges);
    } else {
      if (oldVal !== newVal) {
        changes[fullKey] = newVal;
      }
    }
  }

  return changes;
}
