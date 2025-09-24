import { render } from "preact";
import { App } from "./elements/app.js";

import "./style.css";

render(<App />, document.getElementById("app")!);
