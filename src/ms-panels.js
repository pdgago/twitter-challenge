import {html, PolymerElement} from '@polymer/polymer/polymer-element.js';
import '@polymer/polymer/lib/elements/dom-repeat.js';
import './ms-user-data.js';
import './ms-panel.js';
import './ms-sortable.js';

class MsPanels extends PolymerElement {

  static get template() {
    return html`
      <style>
        :host {
          display: block;
          overflow-x: auto;
        }

        ms-sortable {
          box-sizing: border-box;
          display: flex;
          flex-wrap: nowrap;
          align-items: flex-start;
          height: 100%;
          padding: 15px 4px;
        }

        ms-panel {
          margin: 0 4px;
        }
      </style>

      <ms-user-data id="userData"></ms-user-data>

      <ms-sortable
          sortable="ms-panel"
          handle=".header"
          scroll-target="[[_scrollTarget]]"
          on-sort-finish="_onSortFinish">
        <dom-repeat items="[[_renderedPanels]]">
          <template>
            <ms-panel panel="[[item]]"></ms-panel>
          </template>
        </dom-repeat>
      </ms-sortable>
    `;
  }

  static get properties() {
    return {

      panels: {
        type: Array,
        observer: '_panelsChanged',
      },

      _renderedPanels: {
        type: Array,
      },

    };
  }

  connectedCallback() {
    super.connectedCallback();
    this._scrollTarget = this;
  }

  _panelsChanged(panels) {
    // Avoid repaints if the panels object is modified with same values.
    if (!this._areObjsEqual(panels, this._renderedPanels)) {
      this._renderedPanels = panels;
    }
  }

  _onSortFinish(evt) {
    const panelElements = Array.from(this.shadowRoot.querySelectorAll('ms-panel'));
    const panels = panelElements.map(p => p.panel);
    this._renderedPanels.length = 0;
    this._renderedPanels.splice(0, 0, ...panels);
    this.$.userData.updateProperty({
      propertyName: 'panels',
      value: panels,
    });
  }

  /**
   * @param  {Object} obj1
   * @param  {Object} obj2
   * @return {Boolean} - Objects content are equal.
   */
  _areObjsEqual(obj1, obj2) {
    return JSON.stringify(obj1 || {}) === JSON.stringify(obj2 || {});
  }

}

window.customElements.define('ms-panels', MsPanels);