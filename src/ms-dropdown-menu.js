import {html, PolymerElement} from '@polymer/polymer/polymer-element.js';
import {MsOverlayMixin} from './ms-overlay-mixin.js';

class MsDropdownMenu extends PolymerElement {

  static get template() {
    return html`
      <style>
        :host {
          display: inline-block;
        }
        #container {
          display: flex;
        }
      </style>
      <div id="container" on-click="_open">
        <slot></slot>
      </div>
    `;
  }

  static get properties() {
    return {
      items: Array
    };
  }

  constructor() {
    super();
    this._overlay = null;
  }

  _open() {
    if (!this._overlay) {
      this._overlay = document.createElement('ms-dropdown-menu-overlay');
      this.shadowRoot.appendChild(this._overlay);
      this._overlay.setProperties({
        opened: true,
        items: this.items,
        positionTarget: this.$.container,
        onDetach: _ => {
          this._overlay = null;
        }
      });
    }
  }
}

class MsDropdownMenuOverlay extends MsOverlayMixin(PolymerElement) {

  static get template() {
    return html`
      <style>
        :host {
          display: block;
        }

        .items {
          display: flex;
          flex-direction: column;
          margin: 4px 0;
        }

        .item {
          background: 0;
          border: 0;
          color: inherit;
          cursor: pointer;
          font-family: inherit;
          font-size: inherit;
          outline: 0;
          padding: 10px 20px;
          text-align: left;
          width: 100%;
        }

        .item:hover {
          background: var(--theme-400-color, #f5f5f5);
        }
      </style>
      <div class="items">
        <dom-repeat items="[[items]]">
          <template>
            <button class="item" on-click="_onItemClick">[[item.label]]</button>
          </template>
        </dom-repeat>
      </div>
    `;
  }

  static get properties() {
    return {

      items: {
        type: Array
      },

      /* @override */
      noResponsive: {
        type: Boolean,
        value: true,
      },

    };
  }

  _onItemClick(evt) {
    this.dispatchEvent(new CustomEvent('submit', {
      composed: true,
      bubbles: true,
      detail: {item: evt.model.item},
    }));
    this.opened = false;
  }

}

window.customElements.define('ms-dropdown-menu', MsDropdownMenu);
window.customElements.define('ms-dropdown-menu-overlay', MsDropdownMenuOverlay);
