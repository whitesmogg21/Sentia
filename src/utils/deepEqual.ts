export default function deepEqual(a: any, b: any): boolean {
  if (a === b) return true;

  // Handle NaN case (NaN !== NaN)
  if (typeof a === "number" && typeof b === "number" && isNaN(a) && isNaN(b)) {
    return true;
  }

  // Check for null or different types
  if (a === null || b === null || typeof a !== typeof b) return false;

  // Compare Dates
  if (a instanceof Date && b instanceof Date) {
    return a.getTime() === b.getTime();
  }

  // Compare RegExps
  if (a instanceof RegExp && b instanceof RegExp) {
    return a.toString() === b.toString();
  }

  // Check if both are arrays
  if (Array.isArray(a) && Array.isArray(b)) {
    if (a.length !== b.length) return false;
    return a.every((val, i) => deepEqual(val, b[i]));
  }

  // Check if both are plain objects
  if (typeof a === "object" && typeof b === "object") {
    const keysA = Object.keys(a);
    const keysB = Object.keys(b);

    if (keysA.length !== keysB.length) return false;

    return keysA.every(key => deepEqual(a[key], b[key]));
  }

  // Fallback for functions or unmatched cases
  return false;
}
