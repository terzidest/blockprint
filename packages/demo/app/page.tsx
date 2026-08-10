import { createRegistry, Renderer } from "blockprint";

const Hello = ({ name }: { name: string }) => <h1>Hello, {name}</h1>;
const Note = ({ text }: { text: string }) => <p>{text}</p>;

const registry = createRegistry({ hello: Hello, note: Note });

// Simulates a CMS response: valid blocks plus one type the registry has
// never seen, which must land in the fallback rather than crash the page.
const config = [
  { type: "hello", props: { name: "blockprint" } },
  { type: "note", props: { text: "This page is rendered entirely from config." } },
  { type: "mystery", props: { anything: true } },
];

export default function Page() {
  return <Renderer config={config} registry={registry} />;
}
