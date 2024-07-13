import { LitElement, css, html } from "../../lit.js";
import { setSettingForService } from "../../services/vm-service.js";

export class SingleSettingEditor extends LitElement {
  static properties = {
    serviceUniqueId: {
      type: String,
      attribute: "service-unique-id",
    },
    settingKey: {
      type: String,
      attribute: "setting-key",
    },

    initialValue: {
      attribute: "initial-value",
    },
  };

  static styles = css`
    input {
      padding: 5px;
    }
  `;

  constructor() {
    super();
  }

  render() {
    return html`
      <label
        for="single-setting-editor-${this.serviceUniqueId}-${this.settingKey}"
        >${this.settingKey}</label
      >
      <input
        @keyup=${this.onValueChanged}
        @paste=${this.onValueChanged}
        id="single-setting-editor-${this.serviceUniqueId}-${this.settingKey}"
        .value=${this.initialValue}
      />
    `;
  }

  onValueChanged(event) {
    const value =
      typeof this.initialValue === "number"
        ? parseFloat(event.target.value)
        : event.target.value;

    return setSettingForService(this.serviceUniqueId, this.settingKey, value);
  }
}

customElements.define("app-single-setting-editor", SingleSettingEditor);
