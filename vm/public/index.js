import { LitElement, html } from "../lit.js";
import "./settings/settings.tab.js";

export class Home extends LitElement {
  constructor() {
    super();
  }

  render() {
    return html` <app-settings-tab />`;
  }
}

customElements.define("app-home", Home);
