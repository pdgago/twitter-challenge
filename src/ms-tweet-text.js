import {html, PolymerElement} from '@polymer/polymer/polymer-element.js';

class MsTweetText extends PolymerElement {

  static get template() {
    return html`
      <style>
        :host {
          display: block;
          word-break: break-word;
        }

        a {
          color: var(--primary-color);
        }

        a:visited {
          color: var(--dark-primary-color);
        }
      </style>

      <div id="content"></div>
    `;
  }

  static get properties() {
    return {

      text: {
        type: String,
        observer: '_textChanged',
      },

    };
  }

  _textChanged(text) {
    const str = text
      .replace(/^RT\s@[^:]+:/, '')
      .replace(/(http[^\s]+[^\s\.\,])(\,|\.|\s|$)/g, 
        `<a href="$1" target="_blank" rel="noopener">$1</a>$2`)
      .replace(/(@([^\s@:),]+))/g,
        `<a href="https://twitter.com/$2" target="_blank" rel="noopener">$1</a>`);
    this.$.content.innerHTML = str;
  }

}

window.customElements.define('ms-tweet-text', MsTweetText);