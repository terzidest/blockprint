declare const process:
  | { env: { NODE_ENV?: string } }
  | undefined;

/**
 * True outside production builds. Guarded so a browser without a bundler
 * defining `process` gets `false` instead of a ReferenceError.
 */
export function isDev(): boolean {
  return typeof process !== "undefined" && process.env.NODE_ENV !== "production";
}
