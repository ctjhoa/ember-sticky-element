import Component from '@ember/component';
import { or, notEmpty } from '@ember/object/computed';
import { htmlSafe } from '@ember/string';
import { computed } from '@ember/object';
import layout from '../templates/components/sticky-element';

function elementPosition(element, offseTop, offsetBottom) {
  let top = element.getBoundingClientRect().top;
  if (top - offseTop < 0) {
    return 'top';
  }
  if (top + element.offsetHeight + offsetBottom <= window.innerHeight) {
    return 'in';
  }
  return 'bottom';
}

export default Component.extend({
  layout,
  tagName: '',
  attributeBindings: ['style'],

  /**
   * The offset from the top of the viewport when to start sticking to the top
   *
   * @property top
   * @type {number}
   * @default 0
   * @public
   */
  top: 0,

  /**
   * The offset from the parents bottom edge when to start sticking to the bottom of the parent
   * When `null` (default) sticking to the bottom is disabled. Use 0 or any other appropriate offset to enable it.
   *
   * @property bottom
   * @type {boolean|null}
   * @public
   */
  bottom: null,

  /**
   * Set to false to disable sticky behavior
   *
   * @property enabled
   * @type {boolean}
   * @default true
   * @public
   */
  enabled: true,

  /**
   * @property isSticky
   * @type {boolean}
   * @readOnly
   * @private
   */
  isSticky: or('isStickyTop', 'isStickyBottom').readOnly(),

  /**
   * @property isStickyTop
   * @type {boolean}
   * @readOnly
   * @private
   */
  isStickyTop: computed('enabled', 'parentTop', 'isStickyBottom', function() {
    return this.get('enabled') && this.get('parentTop') === 'top' && !this.get('isStickyBottom');
  }).readOnly(),

  /**
   * @property isStickyBottom
   * @type {boolean}
   * @readOnly
   * @private
   */
  isStickyBottom: computed('enabled', 'parentBottom', 'stickToBottom', function() {
    return this.get('enabled') && this.get('parentBottom') !== 'bottom' && this.get('stickToBottom');
  }).readOnly(),

  /**
   * @property stickToBottom
   * @type {boolean}
   * @readOnly
   * @private
   */
  stickToBottom: notEmpty('bottom').readOnly(),

  hasNativeSupport: computed(function() {
    // feature-detect stolen from modernizr
    // https://github.com/Modernizr/Modernizr/blob/master/feature-detects/css/positionsticky.js

    let prop = 'position:';
    let value = 'sticky';
    let el = document.createElement('a');
    let mStyle = el.style;
    let prefixes = ["", "-webkit-", "-moz-", "-o-", "-ms-"];

    mStyle.cssText = prop + prefixes.join(value + ';' + prop).slice(0, -prop.length);

    return mStyle.position.indexOf(value) !== -1;
  }),

  nativeStyle: computed('enabled', 'hasNativeSupport', 'top', 'bottom', 'stickToBottom', function() {
    if (this.get('enabled') && this.get('hasNativeSupport')) {
      let style = `position: sticky; top: ${this.get('top')}px;`;
      if (this.get('stickToBottom')) {
        style += `bottom: ${this.get('bottom')}`;
      }
      return htmlSafe(style);
    } else {
      return '';
    }
  }),

  updatePosition() {
    let { topTriggerElement, bottomTriggerElement } = this;

    if (topTriggerElement) {
      this.set('parentTop', elementPosition(topTriggerElement, this.get('top'), 0));
    }
    if (bottomTriggerElement) {
      this.set('parentBottom', elementPosition(bottomTriggerElement, 0, this.get('offsetBottom')));
    }
  },

  actions: {
    parentTopEntered() {
      this.set('parentTop', 'in');
    },
    parentTopExited() {
      this.updatePosition();
    },
    parentBottomEntered() {
      this.set('parentBottom', 'in');
    },
    parentBottomExited() {
      this.updatePosition();
    },
    registerTopTrigger(element) {
      this.topTriggerElement = element;
      this.updatePosition();
    },
    registerBottomTrigger(element) {
      this.bottomTriggerElement = element;
      this.updatePosition();
    }
  }
});
