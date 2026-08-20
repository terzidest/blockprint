import { commerce } from "./commerce";
import { saas } from "./saas";
import { editorial } from "./editorial";
import broken from "./broken.json";

export interface Preset {
  key: string;
  label: string;
  theme: string;
  /** What this tab proves — shown as a caption strip. */
  note: string;
  /**
   * Typed as unknown on purpose: the Renderer validates untrusted input
   * itself. The valid presets are ConfigFor-typed at their definition site;
   * the broken one can ONLY exist as raw JSON — ConfigFor cannot express an
   * unknown block type.
   */
  config: unknown;
}

export const presets: Preset[] = [
  {
    key: "commerce",
    label: "Commerce",
    theme: "theme-commerce",
    note: "A storefront, rendered entirely from the config on the left. Same <Renderer/>, same registry as every other tab.",
    config: commerce,
  },
  {
    key: "saas",
    label: "SaaS",
    theme: "theme-saas",
    note: "A completely different page from the same code path — only the JSON changed. The hero block is the same component as Commerce's, with different props.",
    config: saas,
  },
  {
    key: "editorial",
    label: "Editorial",
    theme: "theme-editorial",
    note: "Third vertical, same renderer. The newsletter block is shared with Commerce; its heading here comes from the config, there from a schema default.",
    config: editorial,
  },
  {
    key: "broken",
    label: "Broken config",
    theme: "theme-commerce",
    note: "Two entries are corrupt: a typo'd block type and a number where a string belongs. Both land in the fallback — the rest of the page doesn't care. This config can't even be written in ConfigFor<…>; it only exists as untrusted JSON.",
    config: broken,
  },
];
