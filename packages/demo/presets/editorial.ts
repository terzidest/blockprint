import type { ConfigFor } from "blockprint";
import type { DemoRegistry } from "../registry";

export const editorial: ConfigFor<DemoRegistry> = [
  {
    type: "articleHero",
    props: {
      kicker: "Engineering",
      title: "The quiet case for boring architecture",
      deck: "Every system that survived a decade did so by being unremarkable in exactly the right places. A field guide to choosing where to be clever.",
      author: "Maya Lindholm",
      date: "Aug 18, 2026",
      readTime: "9 min read",
    },
  },
  {
    type: "richText",
    props: {
      paragraphs: [
        "There is a moment in every system's life when someone proposes the interesting version. The event-sourced rewrite. The homegrown query language. The framework nobody else uses yet. The room leans in, because interesting is magnetic — and because nobody ever got promoted for choosing the obvious thing.",
        "But the obvious thing is obvious precisely because a thousand teams broke themselves discovering it. Boring technology is not a lack of ambition; it is ambition redirected at the problem instead of the plumbing.",
      ],
    },
  },
  {
    type: "pullQuote",
    props: {
      quote: "Boring technology is ambition redirected at the problem instead of the plumbing.",
      attribution: "from this article",
    },
  },
  {
    type: "richText",
    props: {
      paragraphs: [
        "The teams that endure pick one, maybe two, places to be genuinely novel — the places where novelty is the product. Everywhere else they choose tools their next hire already knows, failure modes already documented on someone else's status page, and upgrade paths they didn't have to invent.",
      ],
    },
  },
  {
    type: "relatedArticles",
    props: {
      title: "Keep reading",
      articles: [
        { title: "Migrations that don't wake anyone up", category: "Databases", readTime: "7 min" },
        { title: "The maintenance budget nobody writes down", category: "Teams", readTime: "5 min" },
        { title: "Choosing a stack for the team you'll have in two years", category: "Hiring", readTime: "11 min" },
      ],
    },
  },
  {
    type: "newsletter",
    props: {
      heading: "The Ledger, weekly",
      subtext: "Essays on building software that outlives its authors.",
      buttonLabel: "Read next Sunday",
    },
  },
];
