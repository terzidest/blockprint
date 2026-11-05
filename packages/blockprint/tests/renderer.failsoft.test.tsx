// @vitest-environment jsdom
import { expect, test, vi } from "vitest";
import { act } from "react";
import { createRoot } from "react-dom/client";
import { createRegistry, Renderer } from "../src";
import type { FallbackProps } from "../src";

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT =
  true;

const Bomb = (): never => {
  throw new Error("block exploded");
};
const Safe = ({ text }: { text: string }) => <p>{text}</p>;

const Fallback = (props: FallbackProps) => (
  <div data-reason={props.reason}>{props.type}</div>
);

test("catchBlockErrors contains a throwing block as a render-error fallback", async () => {
  // React logs caught boundary errors; keep test output clean.
  const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});
  const registry = createRegistry({ bomb: Bomb, safe: Safe });
  const events: string[] = [];

  const container = document.createElement("div");
  const root = createRoot(container);
  await act(async () => {
    root.render(
      <Renderer
        config={[
          { type: "safe", props: { text: "before" } },
          { type: "bomb", props: {} },
          { type: "safe", props: { text: "after" } },
        ]}
        registry={registry}
        fallback={Fallback}
        catchBlockErrors
        onFallback={(info) => events.push(info.reason)}
      />,
    );
  });

  expect(container.innerHTML).toBe(
    '<p>before</p><div data-reason="render-error">bomb</div><p>after</p>',
  );
  expect(events).toEqual(["render-error"]);
  root.unmount();
  consoleError.mockRestore();
});
