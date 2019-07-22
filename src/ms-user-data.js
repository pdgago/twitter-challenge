import {html, PolymerElement} from '@polymer/polymer/polymer-element.js';

const INSTANCES = [];

/**
 * This element provides the logged user data.
 */
class MsUserData extends PolymerElement {

  static get properties() {
    return {

      /**
       * @typedef {Object} Panel
       * @property {String} screenName - Twitter username.
       * @property {Number} count - Tweet limit.
       */

      /**
       * @type {Panel.<>}
       */
      panels: {
        type: Array,
        notify: true,
        readOnly: true,
      },

      /**
       * Max number of seconds ago of the tweet creation date.
       * @type {Number?}
       */
      secondsAgoFilter: {
        type: Number,
        notify: true,
        readOnly: true,
      },

      /**
       * @type {String}
       */
      theme: {
        type: String,
        notify: true,
        readOnly: true,
      },

    };
  }

  static get defaultData() {
    return {
      panels: [
        {screenName: 'chromiumdev', count: 8},
        {screenName: 'newsycombinator', count: 8},
        {screenName: 'ycombinator', count: 30},
      ],
      theme: 'light',
      secondsAgoFilter: -1,
    };
  }

  connectedCallback() {
    super.connectedCallback();
    this.style.display = 'none';
    INSTANCES.push(this);
    this.restore();
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    INSTANCES.splice(INSTANCES.indexOf(this), 1);
  }

  /**
   * Updates the given property and value on the localStorage.
   *
   * @throws {Error}
   * @param {String} propertyName It can be 'panels' or 'theme'
   * @param {String|Object} value The property value
   */
  updateProperty({propertyName, value}) {
    const defaultData = this.constructor.defaultData;
    const validPropertyNames = Object.keys(defaultData);
    if (validPropertyNames.indexOf(propertyName) === -1) {
      throw new TypeError('MsUserData.UpdateProperty.InvalidParams');
    }
    const localStorageData = localStorage.getItem('ms-user-data');
    const data = localStorageData ? JSON.parse(localStorageData) : {};
    data[propertyName] = value;
    localStorage.setItem('ms-user-data', JSON.stringify(data));
    // Propagate to all 'ms-user-data' instances
    INSTANCES.forEach(inst => inst.restore());
  }

  /**
   * Restore user data from localstorage. If data doesn't exists it creates
   * the default data an calls restore() again.
   */
  restore() {
    this._restoreFromLocalStorage() ||
    this._initializeWithDefaultValues();
  }

  _initializeWithDefaultValues() {
    const defaultData = this.constructor.defaultData;
    localStorage.setItem('ms-user-data', JSON.stringify(defaultData));
    this.setProperties(defaultData, true);
  }

  _restoreFromLocalStorage() {
    const dataStr = localStorage.getItem('ms-user-data');
    if (dataStr) {
      const data = JSON.parse(dataStr);
      this.setProperties(data, true);
      return true;
    }
    return false;
  }

}

window.customElements.define('ms-user-data', MsUserData);
