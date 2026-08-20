import type { ConfigFor } from "blockprint";
import type { DemoRegistry } from "../registry";

export const saas: ConfigFor<DemoRegistry> = [
  {
    type: "hero",
    props: {
      eyebrow: "Pulseboard",
      title: "Your metrics, one calm dashboard",
      subtitle:
        "Pulseboard pulls every product signal into a single view your whole team actually reads.",
      ctaLabel: "Start free trial",
      align: "center",
    },
  },
  {
    type: "logoCloud",
    props: {
      caption: "Trusted by teams at",
      logos: ["Northwind", "Acme Corp", "Globex", "Initech", "Umbrella"],
    },
  },
  {
    type: "featureGrid",
    props: {
      title: "Everything in one place",
      subtitle: "Stop stitching screenshots into slide decks.",
      features: [
        {
          icon: "📈",
          title: "Live funnels",
          description: "Conversion steps update in real time, straight from your event stream.",
        },
        {
          icon: "🔔",
          title: "Smart alerts",
          description: "Get pinged when a metric moves, not when a threshold guesses.",
        },
        {
          icon: "🧩",
          title: "40+ integrations",
          description: "Warehouse, CRM, billing — connected in minutes, not sprints.",
        },
      ],
    },
  },
  {
    type: "stats",
    props: {
      stats: [
        { value: "99.99%", label: "Uptime SLA" },
        { value: "12ms", label: "Median query" },
        { value: "4,200+", label: "Teams onboard" },
        { value: "SOC 2", label: "Type II certified" },
      ],
    },
  },
  {
    type: "pricing",
    props: {
      title: "Simple pricing",
      plans: [
        {
          name: "Starter",
          price: 0,
          period: "mo",
          features: ["3 dashboards", "1M events/mo", "Community support"],
        },
        {
          name: "Growth",
          price: 49,
          period: "mo",
          features: ["Unlimited dashboards", "50M events/mo", "Smart alerts", "SSO"],
          highlighted: true,
        },
        {
          name: "Scale",
          price: 199,
          period: "mo",
          features: ["Everything in Growth", "Unlimited events", "Dedicated support"],
        },
      ],
    },
  },
  {
    type: "cta",
    props: {
      title: "Ship your first dashboard today",
      buttonLabel: "Start free — no card required",
    },
  },
];
