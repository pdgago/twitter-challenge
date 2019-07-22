import {html, PolymerElement} from '@polymer/polymer/polymer-element.js';
import {setPassiveTouchGestures, setRootPath} from '@polymer/polymer/lib/utils/settings.js';
import './ms-user-data.js';
import './ms-panels.js';
import './ms-settings-overlay.js';
import './ms-add-panel-overlay.js';

// Gesture events like tap and track generated from touch will not be
// preventable, allowing for better scrolling performance.
setPassiveTouchGestures(true);

// Set Polymer's root path to the same value we passed to our service worker
// in `index.html`.
setRootPath('/');

class MsApp extends PolymerElement {

  static get template() {
    return html`
      <style>
        :host {
          --primary-color: #0084ff;
          --dark-primary-color: #1565c0;
          background: #f2f2f2;
          color: #444;
          display: grid;
          grid-template-areas: "header" "panels";
          grid-template-columns: 1fr;
          grid-template-rows: 55px 1fr;
          height: 100%;
        }

        :host([theme="dark"]) {
          color: white;
          --theme-100-color: #777;
          --theme-200-color: #666;
          --theme-300-color: #555;
          --theme-400-color: #444;
          --theme-500-color: #333;
          --theme-600-color: #222;
          --theme-700-color: #111;
          --theme-800-color: #000;
          --theme-link-color: #00bcd4;
          --theme-link-color-visied: #b2ebf2;
          background: #111;
        }

        /* Header Block */
        .header {
          align-items: center;
          background: var(--theme-600-color, #fff);
          box-shadow: 0 1px 1px 0 rgba(0,0,0,0.1);
          box-sizing: border-box;
          display: flex;
          grid-area: header;
          padding: 0 20px;
        }

        .header-nav {
          display: flex;
          height: 100%;
          margin-left: auto;
        }

        .header-logo {
          font-size: 18px;
        }

        .header-nav-item {
          align-items: center;
          background: 0;
          border: 0;
          color: currentColor;
          cursor: pointer;
          display: flex;
          font-family: inherit;
          font-size: inherit;
          outline: none;
          padding: 0 10px;
        }

        .header-nav-item:hover {
          color: var(--theme-100-color, #111);
        }

        .header-nav-item > svg {
          margin-right: 6px;
        }

        ms-panels {
          grid-area: panels;
          min-height: 0; /* prevent grid content to expand https://www.w3.org/TR/css3-grid-layout/#min-size-auto */
        }
      </style>

      <header class="header">
        <div class="header-logo">My dashboard</div>
        <nav class="header-nav">
          <button class="header-nav-item" on-click="_onAddPanelClick">
            <svg width="24" height="24" viewBox="0 0 24 24">
              <path fill="currentColor" d="M17,13H13V17H11V13H7V11H11V7H13V11H17M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2Z" />
            </svg>
            <span>Add panel</span>
          </button>
          <button class="header-nav-item" on-click="_onSettingsBtnClick">
            <svg width="24" height="24" viewBox="0 0 24 24">
              <path fill="currentColor" d="M3,17V19H9V17H3M3,5V7H13V5H3M13,21V19H21V17H13V15H11V21H13M7,9V11H3V13H7V15H9V9H7M21,13V11H11V13H21M15,9H17V7H21V5H17V3H15V9Z" />
            </svg>
            <span>Settings</span>
          </button>
        </nav>
      </header>

      <!-- This element provides the user settings from the localStorage -->
      <ms-user-data id="userData" theme="{{theme}}" panels="{{panels}}"></ms-user-data>
      <!-- This element renders the tweets panels -->
      <ms-panels panels="[[panels]]"></ms-panels>
    `;
  }

  static get properties() {
    return {

      panels: {
        type: Array,
      },

      theme: {
        type: String,
        value: 'light',
        reflectToAttribute: true,
      },

    };
  }

  connectedCallback() {
    super.connectedCallback();
    this.removeAttribute('unresolved');
  }

  _onAddPanelClick(evt) {
    if (this.shadowRoot.querySelector('ms-add-panel-overlay')) {
      return;
    }
    const overlay = document.createElement('ms-add-panel-overlay');
    this.shadowRoot.appendChild(overlay);
    overlay.setProperties({
      positionTarget: evt.currentTarget,
      opened: true,
    });
  }

  _onSettingsBtnClick(evt) {
    if (this.shadowRoot.querySelector('ms-settings-overlay')) {
      return;
    }
    const overlay = document.createElement('ms-settings-overlay');
    this.shadowRoot.appendChild(overlay);
    overlay.setProperties({
      positionTarget: evt.currentTarget,
      opened: true,
      theme: this.theme
    });
  }

}

window.customElements.define('ms-app', MsApp);
