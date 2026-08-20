import type { ConfigFor } from "blockprint";
import type { DemoRegistry } from "../registry";

// Authored in TypeScript via ConfigFor: block names and props are fully
// checked at compile time. At runtime this is just data — the Renderer
// treats it exactly like JSON fetched from a CMS.
export const commerce: ConfigFor<DemoRegistry> = [
  {
    type: "hero",
    props: {
      eyebrow: "Summer drop 24",
      title: "Gear that carries its weight",
      subtitle:
        "Field-tested packs, bottles, and layers for people who measure trips in trailheads.",
      ctaLabel: "Shop the collection",
      align: "left",
      badge: "Free shipping over $60",
    },
  },
  {
    type: "categoryGrid",
    props: {
      categories: [
        { name: "Packs", emoji: "🎒", count: 24 },
        { name: "Bottles", emoji: "🥤", count: 13 },
        { name: "Layers", emoji: "🧥", count: 31 },
        { name: "Footwear", emoji: "🥾", count: 18 },
        { name: "Camp", emoji: "⛺", count: 22 },
        { name: "Tools", emoji: "🔦", count: 9 },
      ],
    },
  },
  {
    type: "featuredProducts",
    props: {
      title: "Bestsellers",
      products: [
        { name: "Ridgeline 28L", price: "$148", emoji: "🎒", tag: "New" },
        { name: "Thermal Flask", price: "$34", emoji: "🥤" },
        { name: "Storm Shell", price: "$189", emoji: "🧥", tag: "Low stock" },
        { name: "Trail Runner II", price: "$129", emoji: "🥾" },
      ],
    },
  },
  {
    type: "cta",
    props: {
      title: "Members get early access",
      subtitle: "New drops hit member inboxes 48 hours before anyone else.",
      buttonLabel: "Join free",
      tone: "contrast",
    },
  },
  {
    type: "newsletter",
    props: {
      subtext: "One email a month. Trail notes, drops, and nothing else.",
    },
  },
];
