import { typeOf } from '@ember/utils';
import { computed } from '@ember/object';
import { assert } from '@ember/debug';
import ObjectProxy from '@ember/object/proxy';

let MyObjectProxy = ObjectProxy.extend({
  init: function () {
    this._local = {};
    return this._super(...arguments);
  },

  _isEqual(key, a, b) { return a === b; },

  setUnknownProperty: function (key, value) {
    let local = this._local;

    if (this._isEqual(key, value, this.content.get(key))) {
      // new local value is considered "equal" to the upstream content value

      if (local.hasOwnProperty(key)) {
        // ... but we have something in the local buffer

        delete local[key];
        this.notifyPropertyChange(key);

        if (Object.keys(local).length === 0) {
          this.set('_hasChanges', false);
        }
      }
    } else if (!local.hasOwnProperty(key) || local[key] !== value) {
      // new local value differs from upstream value, and we either do not
      // already have it buffered or it differs from what we have buffered;
      // n.b. unlike the previous upstream equality check, we use a strict
      // equality check here since we are now dealing with our local buffer
      // and there is no benefit to handling equal-ish values differently and
      // we want to just use the latest reference pointer

      local[key] = value;
      this.notifyPropertyChange(key);

      this.set('_hasChanges', true);
    }

    return value;
  },
});

var buffered = function (upstreamKey) {
  return computed(
    upstreamKey,  // make a clean buffer object when upstream object changes
    function (key) {
      let upstream = this.get(upstreamKey);
      assert(`expected upstream for ${key} to be an instance`,
              typeOf(upstream) === 'instance');
      return MyObjectProxy.create({content: upstream});
    }
  );
};

export { buffered };
