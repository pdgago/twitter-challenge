import {html, PolymerElement} from '@polymer/polymer/polymer-element.js';

/**
 * This element provides an array of tweets for the given username.
 */
class MsTweetsData extends PolymerElement {

  static get properties() {
    return {

      /**
       * Max number of tweets.
       * @type {Number=30}
       */
      count: {
        type: Number,
        value: 30,
        observer: '_countChanged',
      },

      errorKey: {
        type: String,
        notify: true,
      },

      /**
       * Max number of seconds ago of the tweet creation date.
       * @type {Number?}
       */
      secondsAgoFilter: {
        type: Number,
        observer: '_secondsAgoFilterChanged',
      },

      /**
       * Twitter username to get tweets from.
       * @type {String}
       */
      screenName: {
        type: String,
        observer: '_screenNameChanged',
      },

      /**
       * Tweets from the current username.
       * @type {Object.<>}
       */
      tweets: {
        type: Array,
        notify: true,
        readOnly: true,
        value: _ => {
          return [];
        }
      },

    };
  }

  constructor() {
    super();
    this.abortController = null;
    this._raf = null;
  }

  connectedCallback() {
    super.connectedCallback();
    this.style.display = 'none';
  }

  _countChanged(count) {
    cancelAnimationFrame(this._raf);
    this._raf = requestAnimationFrame(_ => this._reloadTweets());
  }

  _secondsAgoFilterChanged(secondsAgoFilter) {
    cancelAnimationFrame(this._raf);
    this._raf = requestAnimationFrame(_ => this._reloadTweets());
  }

  _screenNameChanged(username) {
    cancelAnimationFrame(this._raf);
    this._raf = requestAnimationFrame(_ => this._reloadTweets());
  }

  async _reloadTweets() {
    const url = `http://localhost:7890/1.1/statuses/user_timeline.json?count=${this.count}&screen_name=${this.screenName}&tweet_mode=extended`;
    var signal;
    if (window.AbortController) {
      if (this.abortController) {
        this.abortController.abort();
      }
      this.abortController = new AbortController();
      signal = this.abortController.signal;
    }
    const response = await fetch(url, {signal});
    if (response.ok) {
      this.errorKey = null;
      const tweets = await response.json();
      if (typeof this.secondsAgoFilter === 'number' && this.secondsAgoFilter > -1) {
        this._setTweets(this._filterTweetsFromSecsAgo(tweets));
      } else {
        this._setTweets(tweets);
      }
    } else {
      if (!window.navigator.onLine) {
        this.errorKey = 'TweetData.Offline';
      } else if (response.status === 404) {
        this.errorKey = 'TweetData.UserNotFound';
      } else if (response.status === 401) {
        this.errorKey = 'TweetData.Unauthorized';
      } else {
        this.errorKey = 'TweetData.Error';
      }
      this._setTweets([]);
    }
  }

  _filterTweetsFromSecsAgo(tweets) {
    const filteredTweets = [];
    const now = Date.now();
    const msAgo = this.secondsAgoFilter * 1000;
    for (let tweet of tweets) {
      const tweetTs = new Date(tweet.created_at).getTime();
      if (now - tweetTs <= msAgo) {
        filteredTweets.push(tweet);
      }
    }
    return filteredTweets;
  }

}

window.customElements.define('ms-tweets-data', MsTweetsData);
