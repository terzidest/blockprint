declare const process:
  | { env: { NODE_ENV?: string } }
  | undefined;

/**
 * True outside production builds. Guarded so a browser without a bundler
 * defining `process` gets `false` instead of a ReferenceError — deliberately
 * fail-quiet: a bundler-less browser is treated as production (silent
 * default fallback, no dev warnings).
 */
export function isDev(): boolean {
  return typeof process !== "undefined" && process.env.NODE_ENV !== "production";
}
