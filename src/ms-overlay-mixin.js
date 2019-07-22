const $_style = document.createElement('style');

$_style.innerHTML = `
  :host {
    background: var(--theme-500-color, white);
    border-radius: 6px;
    box-shadow: 0 0 0 1px rgba(0,0,0,0.13), 0 4px 20px 2px rgba(0, 0, 0, 0.3);
    box-sizing: border-box;
    display: inline-block;
    outline: 0;
    position: fixed;
  }

  .header {
    display: none;
  }

  @media (max-width: 720px) {
    :host(:not([no-responsive])) {
      border-radius: 0;
      bottom: 0;
      left: 0;
      top: 0;
      width: 100%;
    }

    .header {
      align-items: center;
      color: var(--primary-color);
      display: flex;
      margin-bottom: 20px;
    }

    .header > .icon-btn {
      margin-right: 10px;
    }
  }
`;

export const MsOverlayMixin = (BaseClass) => class extends BaseClass {

  static get properties() {
    return {

      opened: {
        type: Boolean,
        notify: true,
        observer: '__openedChanged'
      },

      positionTarget: {
        type: Object
      },

      noCancelOnEscKey: {
        type: Boolean,
        value: false
      },

      noResponsive: {
        type: Boolean,
        value: false,
        reflectToAttribute: true
      },

      removeOnClose: {
        type: Boolean,
        value: true
      },

      onDetach: {
        type: Function
      },

      canceled: {
        type: Boolean,
        readOnly: true,
        value: false
      },

      noAutoFocus: {
        type: Boolean,
        value: false
      },

    };
  }

  constructor() {
    super();
    this.__styleAttached = false;
    this.__animation = null;
    this.__positionizeJob = null;
    this.__onResize = this.__onResize.bind(this);
    this.__onKeydown = this.__onKeydown.bind(this);
    this.__onBodyClick = this.__onBodyClick.bind(this);
  }

  connectedCallback() {
    super.connectedCallback();
    this.style.display = 'none';
    this.setAttribute('tabindex', -1);
    if (!this.__styleAttached) {
      this.shadowRoot.prepend($_style.cloneNode(true));
      this.__styleAttached = true;
    }
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.opened = false;
    if (typeof this.onDetach === 'function') {
      this.onDetach();
    }
  }

  async __openedChanged(opened, old) {
    if (opened) {
      this._setCanceled(false);
      this.__toggleOverlayListeners({enable: true});
      this.style.display = '';
      this.__positionize();
      await this.__animateIn();
      if (!this.noAutoFocus) {
        this.focus();
      }
      this.__dispatchEvent('overlay-opened');
    } else {
      this.__toggleOverlayListeners({enable: false});
      await this.__animateOut();
      this.style.display = 'none';
    }
    if (old) {
      this.__dispatchEvent('overlay-closed');
    }
    if (!opened && this.removeOnClose) {
      this.remove();
    }
  }

  __onResize() {
    clearTimeout(this.__positionizeJob);
    this.__positionizeJob = setTimeout(_ => {
      this.__positionize();
    }, 200);
  }

  __positionize() {
    var top = '', right = '', left = '';
    if (!this.positionTarget || window.innerWidth < 720) {
      Object.assign(this.style, {top, right, left});
      return;
    }
    const rect = this.getBoundingClientRect();
    const positionRect = this.positionTarget.getBoundingClientRect();
    top = positionRect.bottom + 'px';
    if (rect.width >= positionRect.right) {
      left = '4px';
    } else {
      right = window.innerWidth - positionRect.right + 'px';
    }
    Object.assign(this.style, {top, right, left});
  }

  __animateIn() {
    return new Promise((resolve) => {
      if (typeof this.animate !== 'function') {
        resolve();
        return;
      }
      this.__beforeAnimate();
      requestAnimationFrame(_ => {
        this.__animation = this.animate([
          {opacity: 0, transform: 'translateY(100px)'},
          {opacity: 1, transform: 'translateY(0)'}
        ], {
          duration: 225,
          easing: 'cubic-bezier(0.165, 0.84, 0.44, 1)',
          fill: 'forwards'
        });
        this.__animation.onfinish = _ => {
          this.__afterAnimate();
          resolve();
        };
      });
    });
  }

  __animateOut() {
    return new Promise((resolve) => {
      if (typeof this.animate !== 'function') {
        resolve();
        return;
      }
      this.__beforeAnimate();
      requestAnimationFrame(_ => {
        this.__animation = this.animate([
          {opacity: 1, transform: 'translateY(0)'},
          {opacity: 0, transform: 'translateY(100px)'}
        ], {
          duration: 300,
          easing: 'cubic-bezier(0.645, 0.045, 0.355, 1)',
          fill: 'forwards'
        });
        this.__animation.onfinish = _ => {
          this.__afterAnimate();
          resolve();
        };
      });
    });
  }

  __toggleOverlayListeners({enable}) {
    const m = enable ? 'addEventListener' : 'removeEventListener';
    window[m]('keydown', this.__onKeydown);
    window[m]('resize', this.__onResize);
    document.body[m]('mousedown', this.__onBodyClick);
  }

  __onKeydown(evt) {
    const escKey = 27;
    if (!this.noCancelOnEscKey && evt.keyCode === escKey) {
      this._setCanceled(true);
      this.opened = false;
    }
  }

  /* Close on outside click */
  __onBodyClick(evt) {
    const path = evt.composedPath();
    for (const node of path) {
      if (node === this) {return};
      if (node === document.body) {
        this.opened = false;
        break;
      }
    }
  }

  __beforeAnimate() {
    document.body.style.overflow = 'hidden';
    this.style.willChange = 'transform';
  }

  __afterAnimate() {
    document.body.style.overflow = '';
    this.style.willChange = '';
    this.__animation = null;
  }

  __dispatchEvent(eventName) {
    this.dispatchEvent(new CustomEvent(eventName, {
      bubbles: true,
      composed: true,
    }));
  }

};
