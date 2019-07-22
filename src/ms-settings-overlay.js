import {html, PolymerElement} from '@polymer/polymer/polymer-element.js';
import {MsOverlayMixin} from './ms-overlay-mixin.js';
import './ms-user-data.js';
import './shared-styles.js';
import './ms-user-data.js';

class MsSettingsOverlay extends MsOverlayMixin(PolymerElement) {

  static get template() {
    return html`
      <style include="form-styles">
        :host {
          padding: 20px;
          width: 400px;
        }

        h3, p {
          margin: 0 0 16px 0;
        }
      </style>

      <ms-user-data
          id="userData"
          theme="{{theme}}"
          seconds-ago-filter="{{secondsAgoFilter}}"></ms-user-data>

      <div class="header">
        <button class="icon-btn" on-click="_onBackClick">
          <svg style="width:24px;height:24px" viewBox="0 0 24 24">
            <path fill="currentColor" d="M20,11V13H8L13.5,18.5L12.08,19.92L4.16,12L12.08,4.08L13.5,5.5L8,11H20Z" />
          </svg>
        </button>
        <div>Settings</div>
      </div>


      <h3>Appareance</h3>
      <p>
        <label class="checkbox-container">
          <input type="checkbox" checked$="[[_computeCheckedDarkMode(theme)]]" on-change="_onCheckboxChanged">
          <span class="checkbox"></span>
          Dark theme
        </label>
      </p>
      <h3>Tweets Time Range Limit</h3>
      <p>
        <select id="range" class="select" on-change="_onRangeChanged" value="{{secondsAgoFilter}}">
          <option value="-1">All time</option>
          <option value="3600">Last Hour</option>
          <option value="10800">Last 3 Hours</option>
          <option value="86400">Last Day</option>
          <option value="259200">Last 3 Days</option>
          <option value="604800">Last Week</option>
        </select>
      </p>
    `;
  }

  static get properties() {
    return {

      theme: {
        type: String,
      },

      secondsAgoFilter: {
        type: Number,
      },

    };
  }

  _onCheckboxChanged(evt) {
    const {checked} = evt.currentTarget;
    const theme = checked ? 'dark' : 'light';
    this.$.userData.updateProperty({
      propertyName: 'theme',
      value: theme,
    });
  }

  _onRangeChanged(evt) {
    const {value} = evt.currentTarget;
    const secondsAgoFilter = value ? parseInt(value) : null;
    this.$.userData.updateProperty({
      propertyName: 'secondsAgoFilter',
      value: secondsAgoFilter,
    });
  }

  _onBackClick() {
    this.opened = false;
  }

  _computeCheckedDarkMode(theme) {
    return theme === 'dark';
  }

}

window.customElements.define('ms-settings-overlay', MsSettingsOverlay);
