import {html, PolymerElement} from '@polymer/polymer/polymer-element.js';
import {MsOverlayMixin} from './ms-overlay-mixin.js';
import './ms-user-data.js';
import './shared-styles.js';

class MsPanelConfigOverlay extends MsOverlayMixin(PolymerElement) {

  static get template() {
    return html`
      <style include="form-styles">
        :host {
          display: flex;
          flex-direction: column;
          padding: 20px;
          width: 300px;
        }

        .submit-btn {
          margin-top: 10px;
          width: 100%;
        }

        h3, p {
          margin: 0 0 16px 0;
        }
      </style>

      <ms-user-data id="userData"></ms-user-data>

      <div class="header">
        <button class="icon-btn" on-click="_onCloseClick">
          <svg style="width:24px;height:24px" viewBox="0 0 24 24">
            <path fill="currentColor" d="M20,11V13H8L13.5,18.5L12.08,19.92L4.16,12L12.08,4.08L13.5,5.5L8,11H20Z" />
          </svg>
        </button>
        <div>Panel Configuration</div>
      </div>

      <h3>Twitter Username</h3>
      <p>
        <input
            id="screenNameInput"
            type="text"
            class="input"
            value$="[[panel.screenName]]"
            on-keyup="_onInputKeyup"
            placeholder="Type a Twitter valid username">
      </p>
      <h3>Maximun Tweet Count</h3>
      <p>
        <input
            id="countInput"
            min="0"
            type="number"
            class="input"
            on-keyup="_onInputKeyup"
            value$="[[panel.count]]">
      </p>
      <button class="button submit-btn" on-click="_submit">Save changes</button>
    `;
  }

  static get properties() {
    return {

      panel: {
        type: Object
      },

    };
  }

  _onInputKeyup(evt) {
    if (evt.key === 'Enter') {
      this._submit();
    }
  }

  _submit() {
    const screenName = this.$.screenNameInput.value;
    const count = this.$.countInput.value;
    if (screenName.length && Number(count) >= 0) {
      const panels = this.$.userData.panels;
      const panel = panels.find(panel => {
        return panel.screenName === this.panel.screenName
      });
      Object.assign(panel, {screenName, count});
      this.$.userData.updateProperty({
        propertyName: 'panels',
        value: panels,
      });
      this.opened = false;
    }
  }

  _onCloseClick() {
    this.opened = false;
  }

}

window.customElements.define('ms-panel-config-overlay', MsPanelConfigOverlay);
