import {html, PolymerElement} from '@polymer/polymer/polymer-element.js';
import {GestureEventListeners} from '@polymer/polymer/lib/mixins/gesture-event-listeners.js';
import {idlePeriod} from '@polymer/polymer/lib/utils/async.js';

class MsSortable extends GestureEventListeners(PolymerElement) {

  static get template() {
    return html`
      <style>
        ::slotted(.transform) {
          -webkit-tap-highlight-color: rgba(255, 255, 255, 0);
          transition: transform 0.2s cubic-bezier(0.333, 0, 0, 1);
          user-drag: none;
          user-select: none;
          will-change: transform;
          z-index: 1;
          left: 0;
          margin: 0 !important;
          position: fixed !important;
          top: 0;
        }

        ::slotted(.pressed) {
          transition: none !important;
        }

        ::slotted(.dragged) {
          transform: rotate(45deg);
          box-shadow: 0 1px 4px rgba(0,0,0,.33);
          position: relative;
          z-index: 10;
        }
      </style>
      <slot id="slot"></slot>
    `;
  }

  static get properties() {
    return {

      /**
       * This is a CSS selector string. If this is set, only items that
       * match the CSS selector are sortable.
       */
      sortable: {
        type: String
      },

      /**
       * Restricts sort start click to the specified CSS selector.
       */
      handle: {
        type: String
      },

      sorting: {
        type: Boolean,
        notify: true,
        readOnly: true,
        reflectToAttribute: true,
        value: false,
      },

      scrollTarget: {
        type: Object
      },

      /**
       * Disables the draggable if set to true.
       */
      disabled: {
        type: Boolean,
        reflectToAttribute: true,
        value: false
      },

      /**
       * The list of sortable items.
       */
      _items: {
        type: Array
      },

      /**
       * The set of excluded elements where the key is the `localName`
       * of the element that will be ignored from the item list.
       */
      _excludedLocalNames: {
        type: Object,
        value: function() {
          return {
            'template': 1,
            'dom-bind': 1,
            'dom-if': 1,
            'dom-repeat': 1,
          };
        }
      }

    };
  }

  get _scrollTarget() {
    return this.scrollTarget || this.firstElementChild;
  }

  constructor() {
    super();
    this._observer = null;
    this._target = null; // the dragging item
    this._targetRect = null; // the dragging item recet
    this._rects = null; // all items rect
    this._startScrollTargetLeft = null;
    this._onTrack = this._onTrack.bind(this);
    this._onDragStart = this._onDragStart.bind(this);
    this._onTouchMove = this._onTouchMove.bind(this);
    this._onTransitionEnd = this._onTransitionEnd.bind(this);
    this._onContextMenu = this._onContextMenu.bind(this);
  }

  connectedCallback() {
    super.connectedCallback();
    idlePeriod.run(_ => {
      this._observeItems();
      this._updateItems();
      this._toggleListeners({enable: true});
    });
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    idlePeriod.run(_ => {
      this._unobserveItems();
      this._toggleListeners({enable: false});
    });
  }

  _toggleListeners({enable}) {
    const m = enable ? 'addEventListener' : 'removeEventListener';
    this[m]('dragstart', this._onDragStart);
    this[m]('transitionend', this._onTransitionEnd);
    this[m]('contextmenu', this._onContextMenu);
    this[m]('touchmove', this._onTouchMove);
    if (enable) {
      this._addEventListenerToNode(this, 'track', this._onTrack);
    } else {
      this._removeEventListenerToNode(this, 'track', this._onTrack);
    }
  }

  _onTrack(evt) {
    switch(evt.detail.state) {
      case 'start': this._trackStart(evt); break;
      case 'track': this._track(evt); break;
      case 'end': this._trackEnd(evt); break;
    }
  }

  _trackStart(evt) {
    if (this.sorting || this.disabled) {
      return;
    }
    this._target = this._itemFromEvent(evt);
    if (!this._target) {
      return;
    }
    evt.stopPropagation();
    this._rects = this._getItemsRects();
    this._targetRect = this._rects[this._items.indexOf(this._target)];
    this._target.classList.add('dragged', 'pressed');
    if ('vibrate' in navigator) {
      navigator.vibrate(30);
    }
    const rect = this.getBoundingClientRect();
    this._startScrollTargetLeft = this.scrollTarget.scrollLeft;
    this.style.height = rect.height + 'px';
    this.style.width = rect.width + 'px';
    this._items.forEach((item, idx) => {
      const rect = this._rects[idx];
      item.classList.add('transform');
      item.style.transition = 'none';
      item.__originalWidth = item.style.width;
      item.__originalHeight = item.style.height;
      item.style.width = rect.width + 'px';
      item.style.height = rect.height + 'px';
      this._translate3d(rect.left, rect.top, 1, item);
      setTimeout(_ => {
        item.style.transition = null;
      }, 20);
    });
    this._setSorting(true);
  }

  _track(evt) {
    if (!this.sorting) {
      return;
    }
    const left = this._targetRect.left + evt.detail.dx;
    const top = this._targetRect.top + evt.detail.dy;
    this._translate3d(left, top, 1, this._target);
    const overItem = this._itemFromCoords(evt.detail);
    if (overItem && overItem !== this._target) {
      const overItemIndex = this._items.indexOf(overItem);
      const targetIndex = this._items.indexOf(this._target);
      this._moveItemInArray(this._items, targetIndex, overItemIndex);
      for(let i = 0; i < this._items.length; i++) {
        if (this._items[i] !== this._target) {
          const rect = this._rects[i];
          requestAnimationFrame(_ => {
            this._translate3d(rect.left, rect.top, 1, this._items[i]);
          });
        }
      }
    }
  }

  _trackEnd(evt) {
    if (!this.sorting) {
      return;
    }
    const rect = this._rects[this._items.indexOf(this._target)];
    this._target.classList.remove('pressed');
    this._setSorting(false);
    this._translate3d(rect.left, rect.top, 1, this._target);
  }

  _onTransitionEnd() {
    if (this.sorting || !this._target) {
      return;
    }
    const fragment = document.createDocumentFragment();
    this._items.forEach(item => {
      item.style.transform = '';
      item.style.width = item.__originalWidth;
      item.style.height = item.__originalHeight;
      item.classList.remove('transform');
      fragment.appendChild(item);
    });
    if (this.children[0]) {
      this.insertBefore(fragment, this.children[0]);
    } else {
      this.appendChild(fragment);
    }
    this.style.height = '';
    this.style.width = '';
    this.scrollTarget.scrollLeft = this._startScrollTargetLeft;
    this._target.classList.remove('dragged');
    this._rects = null;
    this._targetRect = null;
    this._updateItems();
    this.dispatchEvent(new CustomEvent('sort-finish', {
      composed: true,
      detail: {
        target: this._target
      }
    }));
    this._target = null;
  }

  _onDragStart(evt) {
    if (this.sorting) {
      evt.preventDefault();
    }
  }

  _onTouchMove(evt) {
    if (this.sorting) {
      evt.preventDefault();
    }
  }

  _onContextMenu(evt) {
    if (this.sorting) {
      evt.preventDefault();
      this._trackEnd(evt);
    }
  }

  /**
   * Move an array item from one position to another.
   * Source: http://stackoverflow.com/questions/5306680/move-an-array-element-from-one-array-position-to-another
   */
  _moveItemInArray(array, oldIndex, newIndex) {
    if (newIndex >= array.length) {
      var k = newIndex - array.length;
      while ((k--) + 1) {
      array.push(undefined);
      }
    }
    array.splice(newIndex, 0, array.splice(oldIndex, 1)[0]);
    return array;
  }

  _itemFromEvent(evt) {
    var valid = !this.handle;
    for (let node of evt.composedPath()) {
      if (node.nodeType !== Node.ELEMENT_NODE) {
        continue;
      }
      if (this.handle && !valid && node.matches(this.handle)) {
        valid = true;
      }
      if (this._items.indexOf(node) > -1) {
        return valid ? node : null;
      }
      if (node === this) {
        break;
      }
    }
    return null;
  }

  _getItemsRects() {
    return this._items.map(item => {
      return item.getBoundingClientRect();
    })
  }

  _itemFromCoords({x, y}) {
    if (!this._rects) {return;}
    let match = null;
    this._rects.forEach((rect, i) => {
      if ((x >= rect.left) &&
          (x <= rect.left + rect.width) &&
          (y >= rect.top) &&
          (y <= rect.top + rect.height)) {
        match = this._items[i];
      }
    });
    return match;
  }

  _observeItems() {
    if (!this._observer) {
      this._observer = new MutationObserver(_ => {
        this._updateItems();
      });
      this._observer.observe(this, {childList: true});
    }
  }

  _unobserveItems() {
    if (this._observer) {
      this._observer.disconnect();
      this._observer = null;
    }
  }

  _updateItems() {
    if (this.sorting) {
      return;
    }
    const items = this.$.slot.assignedNodes().filter(node => {
      if ((node.nodeType === Node.ELEMENT_NODE) &&
          (!this._excludedLocalNames[node.localName]) &&
          (!this.sortable || node.matches(this.sortable))) {
        return true;
      }
    });
    this._items = items;
  }

  _translate3d(x, y, z, el) {
    el.style.transform = `translate3d(${x}px, ${y}px, ${z}px)`;
  }

}

window.customElements.define('ms-sortable', MsSortable);