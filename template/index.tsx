import { customElement } from "solid-element";
import { signals } from "solidstar";

customElement("my-counter", () => (
  <button onClick={() => signals.count++}>{signals.count}</button>
));
