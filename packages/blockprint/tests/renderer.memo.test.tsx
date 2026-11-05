// @vitest-environment jsdom
import { expect, test } from "vitest";
import { act } from "react";
import { createRoot } from "react-dom/client";
import { createRegistry, Renderer } from "../src";
import type { StandardSchemaV1 } from "../src";

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT =
  true;

const Block = ({ n }: { n: number }) => <p>{n}</p>;

test("schema validation is memoised per (config, registry) identity", async () => {
  let validateCalls = 0;
  const schema: StandardSchemaV1<unknown, { n: number }> = {
    "~standard": {
      version: 1,
      vendor: "test",
      validate: (value) => {
        validateCalls++;
        return { value: value as { n: number } };
      },
    },
  };
  const registry = createRegistry({ block: { component: Block, schema } });
  const config = [{ type: "block", props: { n: 1 } }];

  const container = document.createElement("div");
  const root = createRoot(container);

  await act(async () => {
    root.render(<Renderer config={config} registry={registry} />);
  });
  expect(container.innerHTML).toBe("<p>1</p>");
  expect(validateCalls).toBe(1);

  // Same identities: re-render must not re-validate.
  await act(async () => {
    root.render(<Renderer config={config} registry={registry} />);
  });
  expect(validateCalls).toBe(1);

  // New config identity: validation runs again.
  await act(async () => {
    root.render(<Renderer config={[...config]} registry={registry} />);
  });
  expect(validateCalls).toBe(2);

  root.unmount();
});
