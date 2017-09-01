// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import router from './router'
import store from './store'
import ElementUI from 'element-ui'
import 'element-ui/lib/theme-default/index.css'
import App from './App'
import api from './api.js'
import unit from './unit.js'
import _ from 'lodash'

Vue.use(ElementUI)
Vue.prototype.$api = api
Vue.prototype.$unit = unit
Vue.prototype.$_ = _

Vue.config.productionTip = false
/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  store,
  template: '<App/>',
  components: { App }
})
