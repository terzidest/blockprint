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

test("a caught block recovers when its entry changes", async () => {
  const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});
  const Flaky = ({ ok }: { ok: boolean }) => {
    if (!ok) throw new Error("boom");
    return <p>recovered</p>;
  };
  const registry = createRegistry({ flaky: Flaky });

  const container = document.createElement("div");
  const root = createRoot(container);
  await act(async () => {
    root.render(
      <Renderer
        config={[{ type: "flaky", props: { ok: false } }]}
        registry={registry}
        fallback={Fallback}
        catchBlockErrors
      />,
    );
  });
  expect(container.innerHTML).toContain('data-reason="render-error"');

  await act(async () => {
    root.render(
      <Renderer
        config={[{ type: "flaky", props: { ok: true } }]}
        registry={registry}
        fallback={Fallback}
        catchBlockErrors
      />,
    );
  });
  expect(container.innerHTML).toBe("<p>recovered</p>");
  root.unmount();
  consoleError.mockRestore();
});

test("onFallback dedupes across unstable config identities", async () => {
  const registry = createRegistry({ safe: Safe });
  const events: string[] = [];

  const container = document.createElement("div");
  const root = createRoot(container);
  const renderInline = () =>
    act(async () => {
      root.render(
        <Renderer
          // new array identity every render — the memo misses, telemetry must not re-fire
          config={[{ type: "mystery" }]}
          registry={registry}
          fallback={Fallback}
          onFallback={(info) => events.push(info.reason)}
        />,
      );
    });

  await renderInline();
  await renderInline();
  await renderInline();
  expect(events).toEqual(["unknown-type"]);
  root.unmount();
});
