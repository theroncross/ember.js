/**
 * This test suite depends on timers! See testing caveats in main `README.md`.
 */

import { alias, or, bool } from '@ember/object/computed';
import Controller from '@ember/controller';
import EmberObject, { computed } from '@ember/object';
import { module, test } from 'qunit';

import { buffered } from 'object-proxy-regression/utils/computed';

module("Unit | Utility | Computed Properties", function () {

  test("buffered() allows computed properties on buffered values", function (assert) {
    let model = EmberObject.create({abc: 123, def: 456});
    let ctrl = Controller.extend({
      bufferedModel: buffered('model'),
      bufferedContent: alias('bufferedModel'),

      sum: computed('bufferedContent.{abc,def}', function () {
        return this.get('bufferedContent.abc') +
               this.get('bufferedContent.def');
      }).readOnly(),

      or: or('bufferedModel.{abc,def}'),
      booled: bool('or'),
    }).create({model});

    assert.strictEqual(ctrl.get('sum'), 579);
    assert.strictEqual(ctrl.get('or'), 123);
    assert.strictEqual(ctrl.get('booled'), true);
    ctrl.set('bufferedModel.abc', 10);
    assert.strictEqual(ctrl.get('sum'), 466);
    assert.strictEqual(ctrl.get('or'), 10);
    assert.strictEqual(ctrl.get('booled'), true);
    ctrl.set('bufferedModel.def', 5);
    assert.strictEqual(ctrl.get('sum'), 15);
    assert.strictEqual(ctrl.get('or'), 10);
    assert.strictEqual(ctrl.get('booled'), true);
    ctrl.set('bufferedModel.def', 456);
    assert.strictEqual(ctrl.get('sum'), 466);
    assert.strictEqual(ctrl.get('or'), 10);
    assert.strictEqual(ctrl.get('booled'), true);
    ctrl.set('bufferedContent.abc', 0);
    assert.strictEqual(ctrl.get('sum'), 456);
    assert.strictEqual(ctrl.get('or'), 456);
    assert.strictEqual(ctrl.get('booled'), true);
    ctrl.set('bufferedContent.def', 0);
    assert.strictEqual(ctrl.get('sum'), 0);
    assert.equal(ctrl.get('or'), false);
    assert.strictEqual(ctrl.get('booled'), false);
    ctrl.get('bufferedContent').clearChanges();
    assert.strictEqual(ctrl.get('sum'), 579);
    assert.strictEqual(ctrl.get('or'), 123);
    assert.strictEqual(ctrl.get('booled'), true);
  });

  test("buffered() upstream changes trigger computed properties also", function (assert) {
    let model = EmberObject.create({abc: 5, def: 10});
    let ctrl = Controller.extend({
      bufferedModel: buffered('model'),
      bufferedContent: alias('bufferedModel'),

      sum: computed('bufferedContent.{abc,def}', function () {
        return this.get('bufferedContent.abc') +
               this.get('bufferedContent.def');
      }).readOnly(),
    }).create({model});

    assert.strictEqual(ctrl.get('sum'), 15);
    model.set('abc', 20);
    assert.strictEqual(ctrl.get('sum'), 30);
    ctrl.set('model.def', 20);
    assert.strictEqual(ctrl.get('sum'), 40);
    ctrl.set('bufferedModel.def', 5);
    assert.strictEqual(ctrl.get('sum'), 25);
    model.set('abc', 100);
    assert.strictEqual(ctrl.get('sum'), 105);
  });
});
