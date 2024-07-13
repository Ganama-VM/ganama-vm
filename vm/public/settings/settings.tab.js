import { LitElement, css, html } from "../lit.js";
import { getServices, getSettingsForService } from "../services/vm-service.js";
import "../settings/components/single-setting-editor.component.js";

export class SettingsTab extends LitElement {
  static properties = {
    allServices: [],
    initialSettings: {},
  };

  static styles = css`
    :host {
      display: flex;
      flex-direction: column;
    }

    hr {
      width: 100%;
    }

    article {
      display: flex;
      flex-direction: column;
      gap: 10px;
    }
  `;

  constructor() {
    super();
    this.allServices = [];
    this.initialSettings = {};
  }

  render() {
    return html`
      <h1>Settings</h1>
      ${this.allServices.map((service) =>
        this.renderSettingsForService(service.uniqueId)
      )}
    `;
  }

  renderSettingsForService(serviceUniqueId) {
    const serviceSettings = this.initialSettings[serviceUniqueId];
    return html`
      <h2>${serviceUniqueId}</h2>

      <article>
        ${Object.keys(serviceSettings).map((settingKey) =>
          this.renderSingleSetting(
            serviceUniqueId,
            settingKey,
            serviceSettings[settingKey]
          )
        )}
      </article>
      <hr />
    `;
  }

  renderSingleSetting(serviceUniqueId, settingKey, initialValue) {
    return html`
      <app-single-setting-editor
        service-unique-id=${serviceUniqueId}
        setting-key=${settingKey}
        initial-value=${initialValue}
      ></app-single-setting-editor>
    `;
  }

  async connectedCallback() {
    super.connectedCallback();

    const services = await getServices();
    for (const service of services) {
      this.initialSettings[service.uniqueId] = await getSettingsForService(
        service.uniqueId
      );
    }

    this.allServices = services;
  }
}

customElements.define("app-settings-tab", SettingsTab);
