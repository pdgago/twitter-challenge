import {html, PolymerElement} from '@polymer/polymer/polymer-element.js';
import {MsOverlayMixin} from './ms-overlay-mixin.js';
import './ms-user-data.js';
import './shared-styles.js';

class MsAddPanelOverlay extends MsOverlayMixin(PolymerElement) {

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
      </style>

      <ms-user-data id="userData"></ms-user-data>

      <div class="header">
        <button class="icon-btn" on-click="_onCloseClick">
          <svg style="width:24px;height:24px" viewBox="0 0 24 24">
            <path fill="currentColor" d="M20,11V13H8L13.5,18.5L12.08,19.92L4.16,12L12.08,4.08L13.5,5.5L8,11H20Z" />
          </svg>
        </button>
        <div>Add Panel</div>
      </div>

      <input
          id="input"
          type="text"
          class="input"
          placeholder="Type a Twitter valid username"
          on-keydown="_onInputKeydown">
      <button class="button submit-btn" on-click="_submit">Add Panel</button>
    `;
  }

  static get properties() {
    return {

      /** @override */
      noAutoFocus: {
        type: Boolean,
        value: true
      },

    };
  }

  /** @override */
  __openedChanged(opened, old) {
    super.__openedChanged(opened, old);
    if (opened) {
      this.$.input.focus();
    }
  }

  _onInputKeydown(evt) {
    if (evt.keyCode === 13) {
      this._submit();
    }
  }

  _submit() {
    const screenName = this.$.input.value;
    if (screenName.length) {
      const panels = this.$.userData.panels;
      const alreadyAdded = Boolean(panels.find(panel => {
        return panel.screenName.toLowerCase() === screenName.toLowerCase();
      }));
      if (alreadyAdded) {
        // ignore...
      } else {
        panels.push({screenName, count: 30});
        this.$.userData.updateProperty({
          propertyName: 'panels',
          value: panels
        });
      }
      this.opened = false;
    }
  }

  _onCloseClick() {
    this.opened = false;
  }

}

window.customElements.define('ms-add-panel-overlay', MsAddPanelOverlay);
