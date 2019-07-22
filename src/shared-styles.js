import '@polymer/polymer/polymer-element.js';

const $_documentContainer = document.createElement('template');
$_documentContainer.innerHTML = `<dom-module id="form-styles">
  <template>
    <style>

      .input,
      .select {
        background: var(--theme-600-color, #eee);
        color: inherit;
        border-radius: 30px;
        border: 0;
        box-sizing: border-box;
        font-family: inherit;
        font-size: inherit;
        outline: 0;
        padding: 6px 12px;
        width: 100%;
      }

      .input:focus {
        background: var(--theme-600-color, white);
        color: inherit;
        box-shadow: 0 0 0 2px var(--primary-color);
      }

      .button {
        background: var(--theme-200-color, white);
        border-radius: 4px;
        border: 1px solid var(--theme-200-color, #ddd);
        color: inherit;
        cursor: pointer;
        font-family: inherit;
        font-size: inherit;
        outline: 0;
        padding: 6px 15px;
        transition: box-shadow 0.1s ease-in;
      }

      .button:hover {
        background: var(--theme-100-color, #E1F5FE);
      }

      .button:active {
        box-shadow: 0 2px 6px 0 rgba(0,0,0,0.2);
      }

      /* select */
      .select {
        padding: 0 12px;
        height: 30px;
      }

      /* chekcbox */
      .checkbox-container {
        cursor: pointer;
        position: relative;
        width: 100%;
      }

      .checkbox-container input[type="checkbox"] {
        display: none;
      }

      .checkbox-container .checkbox {
        background: rgba(0,0,0,.1);
        border-radius: 14px;
        display: inline-block;
        height: 14px;
        margin-right: 5px;
        position: relative;
        top: -2px;
        transition: all .15s;
        vertical-align: middle;
        width: 24px;
      }

      .checkbox-container input[type=checkbox]:checked+.checkbox {
        background: var(--primary-color);
      }

      .checkbox-container .checkbox:after {
        background: #fff;
        border-radius: 12px;
        box-shadow: 0 2px 4px 0 rgba(0,0,0,.2), 0 0 1px 0 rgba(0,0,0,.21);
        content: "";
        display: block;
        height: 12px;
        left: 1px;
        position: absolute;
        top: 1px;
        transition: left .15s;
        width: 12px;
      }

      .checkbox-container input[type=checkbox]:checked+.checkbox:after {
        left: 11px;
      }

      /* icon-btn */
      .icon-btn {
        background: none;
        border: 0;
        color: inherit;
        cursor: pointer;
        display: flex;
        outline: 0;
        padding: 4px;
      }

    </style>
  </template>
</dom-module>`;

document.head.appendChild($_documentContainer.content);