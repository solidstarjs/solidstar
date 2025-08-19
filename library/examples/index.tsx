import "solid-devtools";
import { customElement, noShadowDOM } from "solid-element";
import { createSignal, Show } from "solid-js";
import { signals } from "../src";
import "./index.css";

customElement("my-component", { count: 0 }, (props: { count: number }) => {
  noShadowDOM();
  const [count, setCount] = createSignal(props.count ?? 0);

  return (
    <>
      <button onClick={() => setCount(count() + 1)}>{count()}</button>
      <div>
        {signals.count} + {count()} = {signals.count + count()}
      </div>
      <Show when={count() >= 5}>
        <div data-computed-count2="$count * 2" />
      </Show>
    </>
  );
});
