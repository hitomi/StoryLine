import _ from 'lodash'
import BaseFunction from './base'

export default class StoryFunctions {
  constructor () {
    let self = this
    this._define = {}
    this._map = {}
    _(BaseFunction).each(function (v, k) {
      if (k.indexOf('_') === 0 && _.isFunction(BaseFunction[k.slice(1)])) {
        self._define[BaseFunction._prefix + '.' + k.slice(1)] = v
        self._map[BaseFunction._prefix + '.' + k.slice(1)] = v.link
      }
    })
  }
  map () {
    return this._map
  }
  define () {
    return this._define
  }
}
