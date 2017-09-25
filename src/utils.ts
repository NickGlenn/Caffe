/**
 * Returns true if the given value is a function.
 */
export function isFunc(fn: any): boolean {
  return (typeof fn === "function");
}

/**
 * Returns true if the given number x is between min and max.
 */
export function isBetween(x: number, min: number, max: number): boolean {
  return (x > min && x < max);
}