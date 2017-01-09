// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import App from './App'

Vue.directive('demo', {
  twoWay: true,
  bind: function () {
    this.handler = function () {
      this.set(this.el.innerHTML)
    }.bind(this)
    this.el.addEventListener('keyup', this.handler)
  },
  update: function (newValue, oldValue) {
    this.el.innerHTML = newValue || ''
  },
  unbind: function () {
    this.el.removeEventListener('keyup', this.handler)
  }
})

/* eslint-disable no-new */
new Vue({
  el: '#app',
  template: '<App/>',
  components: { App }
})
