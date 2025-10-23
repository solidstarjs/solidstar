import "solid-devtools";
import { customElement, noShadowDOM } from "solid-element";
import { createSignal } from "solid-js";
import { signals } from "../dist";
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
    </>
  );
});
