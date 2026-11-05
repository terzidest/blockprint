/**
 * React-free config types. Everything reachable from the `blockprint/config`
 * entry must resolve without React's type definitions installed — keep this
 * module (and its importers in config land) free of react imports, even
 * type-only ones.
 */

/**
 * A single entry as it arrives from a CMS. Deliberately open: `type` is any
 * string, because untrusted configs may contain types the registry has never
 * seen — those route to the fallback instead of crashing.
 */
export interface BlockConfig {
  type: string;
  props?: unknown;
  id?: string | number;
}
