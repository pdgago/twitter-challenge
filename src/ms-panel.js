import {html, PolymerElement} from '@polymer/polymer/polymer-element.js';
import '@polymer/polymer/lib/elements/dom-repeat.js';
import '@polymer/polymer/lib/elements/dom-if.js';
import './ms-user-data.js';
import './ms-tweets-data.js';
import './ms-dropdown-menu.js';
import './ms-panel-config-overlay.js';
import './ms-tweet-text.js';
import './shared-styles.js';
import {timeAgo} from './helpers.js';

class MsPanel extends PolymerElement {

  static get template() {
    return html`
      <style>
        :host {
          background: var(--theme-600-color, #ddd);
          border-radius: 6px;
          display: flex;
          flex-direction: column;
          max-height: 100%;
          min-width: 280px;
          width: 280px;
        }

        :host([updating]) .tweet {
          background: var(--theme-600-color);
        }

        [hidden] {
          display: none !important;
        }

        .header {
          align-items: center;
          display: flex;
          justify-content: space-between;
          min-height: 42px;
          padding: 0 8px;
        }

        .header-title {
          cursor: pointer;
          flex: 1;
          font-weight: 500;
          font-size: 16px;
          color: var(--theme-100-color, #666);
          margin: 0 0 0 8px;
          user-select: none;
        }

        .header-btn {
          color: var(--theme-100-color, #666);
          background: transparent;
          border: 0;
          cursor: pointer;
          outline: 0;
          padding: 2px;
        }

        #tweets {
          overflow-y: auto;
          padding: 0 4px;
          margin: 0 4px 8px 4px;
        }

        #tweets::-webkit-scrollbar {
          background: var(--theme-600-color, #d1d1d1);
          width: 8px;
          border-radius: 15px;
        }

        #tweets::-webkit-scrollbar-thumb {
          background: var(--theme-400-color, #bbb);
          border-radius: 15px;
        }

        .tweet,
        .load-error-message {
          background: var(--theme-500-color, #fff);
          border-radius: 4px;
          box-shadow: 0 1px 2px rgba(9,45,66,.2);
          box-sizing: border-box;
          font-size: 14px;
          margin-bottom: 8px;
          padding: 10px;
          cursor: pointer;
        }

        .tweet:hover {
          background: var(--theme-400-color, #e5f3ff);
        }

        #tweets .tweet:nth-last-child(2) {
          margin-bottom: 1px;
        }

        .tweet-date {
          color: var(--theme-100-color, #999);
          font-size: 13px;
          margin-top: 2px;
        }

        /* retweet */
        .rt-user {
          align-items: center;
          color: inherit;
          display: flex;
          margin-bottom: 6px;
          text-decoration: none;
          white-space: nowrap;
        }

        .rt-user:hover .rt-username {
          text-decoration: underline;
        }

        .rt-avatar {
          border-radius: 25px;
          height: 24px;
          width: 24px;
          min-width: 24px;
        }

        .rt-username {
          font-weight: 500;
          margin: 0 4px 0 8px;
        }

        .rt-screen-name {
          color: var(--theme-100-color, #999);
          text-overflow: ellipsis;
          overflow: hidden;
        }

        .rt-label {
          align-items: center;
          color: var(--theme-100-color, #999);
          display: flex;
          font-size: 13px;
          margin-bottom: 4px;
        }

        .rt-label > svg {
          margin-right: 5px;
        }

        .load-error-message {
          margin: 0 10px 10px 10px;
          color: var(--theme-100-color, #666);
          font-style: italic;
        }
      </style>

      <ms-user-data id="userData" seconds-ago-filter="{{secondsAgoFilter}}"></ms-user-data>
      <ms-tweets-data
          screen-name="[[panel.screenName]]"
          error-key="{{_errorKey}}"
          seconds-ago-filter="[[secondsAgoFilter]]"
          count="[[panel.count]]"
          tweets="{{_tweets}}"></ms-tweets-data>

      <div class="header">
        <h2 class="header-title">[[panel.screenName]]</h2>
        <ms-dropdown-menu id="optionsDropdownMenu" items="[[_optionsItems]]" on-submit="_onDropdownMenuSubmit">
          <button class="header-btn">
            <svg style="width:24px;height:24px" viewBox="0 0 24 24">
              <path fill="currentColor" d="M12,16A2,2 0 0,1 14,18A2,2 0 0,1 12,20A2,2 0 0,1 10,18A2,2 0 0,1 12,16M12,10A2,2 0 0,1 14,12A2,2 0 0,1 12,14A2,2 0 0,1 10,12A2,2 0 0,1 12,10M12,4A2,2 0 0,1 14,6A2,2 0 0,1 12,8A2,2 0 0,1 10,6A2,2 0 0,1 12,4Z" />
            </svg>
          </button>
        </ms-dropdown-menu>
      </div>

      <div id="tweets" on-click="_onTweetsClick" hidden$=[[_errorKey]]>
        <dom-repeat id="domRepeat" items="[[_tweets]]" as="tweet" initial-count="5">
          <template>
            <div class="tweet">
              <dom-if if="[[tweet.retweeted_status]]">
                <template>
                  <div class="rt-label">
                    <svg style="width:16px;height:16px" viewBox="0 0 24 24">
                      <path fill="currentColor" d="M6,5.75L10.25,10H7V16H13.5L15.5,18H7A2,2 0 0,1 5,16V10H1.75L6,5.75M18,18.25L13.75,14H17V8H10.5L8.5,6H17A2,2 0 0,1 19,8V14H22.25L18,18.25Z" />
                    </svg>
                    Retweet
                  </div>
                  <a class="rt-user" href$="https://twitter.com/[[tweet.retweeted_status.user.screen_name]]" target="_blank" rel="noopener">
                    <img class="rt-avatar" src$="[[tweet.retweeted_status.user.profile_image_url_https]]" />
                    <div class="rt-username">[[tweet.retweeted_status.user.name]]</div>
                    <div class="rt-screen-name">@[[tweet.retweeted_status.user.screen_name]]</div>
                  </a>
                </template>
              </dom-if>
              <ms-tweet-text text=[[tweet.full_text]]><ms-tweet-text>
              <div class="tweet-date">[[_computeTweetDate(tweet.created_at)]]</div>
            </div>
          </template>
        </dom-repeat>
      </div>

      <div class="load-error-message" hidden$=[[!_errorKey]]>[[_computeErrorMessage(_errorKey)]]</div>
    `;
  }

  static get properties() {
    return {

      panel: {
        type: Object,
      },

      secondsAgoFilter: {
        type: Number,
      },

      screenName: {
        type: String,
      },

      _errorKey: {
        type: String,
        value: null,
      },

      _tweets: {
        type: Array,
        observer: '_tweetsChanged',
      },

      _optionsItems: {
        type: Array,
        value: _ => {
          return [
            {label: 'Configuration', value: 'configuration'},
            {label: 'Remove Panel', value: 'remove-panel'}
          ];
        }
      }

    };
  }

  static get observers() {
    return [
      '_dataChanged(count, secondsAgoFilter, screen_name)'
    ];
  }

  constructor() {
    super();
    this._updatingRaf = null;
  }

  _dataChanged(count, secondsAgoFilter, screen_name) {
    cancelAnimationFrame(this._updatingRaf);
    this._updatingRaf = requestAnimationFrame(_ => {
      this.setAttribute('updating', '');
    });
  }

  _tweetsChanged() {
    cancelAnimationFrame(this._updatingRaf);
    this._updatingRaf = requestAnimationFrame(_ => {
      this.removeAttribute('updating');
    });
  }

  _onTweetsClick(evt) {
    const path = evt.composedPath();
    for (const node of path) {
      if (node === this.$.tweets) {break;}
      if (node.nodeType === Node.ELEMENT_NODE) {
        if (node.localName === 'a') {break;}
        if (node.classList.contains('tweet')) {
          const model = this.$.domRepeat.modelForElement(node);
          if (model) {
            this._openTweet(model.tweet);
          }
          break;
        }
      }
    }
  }

  _openTweet(tweet) {
    const url = 'https://twitter.com/' + tweet.user.screen_name + '/status/' + tweet.id_str;
    const a = document.createElement("a")
    a.href = url;
    a.target = "_blank"
    a.rel = "noopener"
    a.click()
  }

  _onDropdownMenuSubmit(evt) {
    const {item} = evt.detail;
    switch (item.value) {
      case 'remove-panel':
        const panels = this.$.userData.panels;
        const panel = panels.find(panel => {
          return panel.screenName === this.panel.screenName;
        })
        panels.splice(panels.indexOf(panel), 1);
        this.$.userData.updateProperty({
          propertyName: 'panels',
          value: panels,
        });
        break;
      case 'configuration':
        this._openPanelConfigOverlay();
        break;
    }
  }

  _openPanelConfigOverlay() {
    if (this.shadowRoot.querySelector('ms-panel-config-overlay')) {
      return;
    }
    const overlay = document.createElement('ms-panel-config-overlay');
    this.shadowRoot.appendChild(overlay);
    overlay.setProperties({
      opened: true,
      positionTarget: this.$.optionsDropdownMenu,
      panel: this.panel,
    });
  }

  _computeErrorMessage(errorKey) {
    switch(errorKey) {
      case 'TweetData.UserNotFound':
        return 'User not found.'
      case 'TweetData.Unauthorized':
        return 'Request refused by Twitter. This probably means that we exceeded API usage quota.';
      case 'TweetData.Offline':
        return 'You are offline. Check your connection.';
      case 'TweetData.Error':
        return `Server error`;
    }
  }

  _computeTweetDate(dateStr) {
    return timeAgo(new Date(dateStr));
  }

}

window.customElements.define('ms-panel', MsPanel);
