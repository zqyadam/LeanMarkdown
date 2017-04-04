import Vue from 'vue'
import Electron from 'vue-electron'
// import Resource from 'vue-resource'
import Router from 'vue-router'
import ElementUI from 'element-ui'
import 'element-ui/lib/theme-default/index.css'


// import './css/highlight_linenumber.css'

import App from './App'
import routes from './routes'
import {isLoggedIn} from './js/api'

import './icons/iconfont.css'
import 'prismjs/plugins/line-numbers/prism-line-numbers.js'
import 'prismjs/plugins/highlight-keywords/prism-highlight-keywords.min.js'


Vue.use(Electron)
  // Vue.use(Resource)
Vue.use(Router)
Vue.use(ElementUI)
Vue.config.debug = true

const router = new Router({
  scrollBehavior: () => ({ y: 0 }),
  routes,
  mode: 'history'
})

router.beforeEach((to, form, next) => {
  if (to.matched.some(record => record.meta.requiresAuth)) {
    if (!isLoggedIn()) {
      next({ name: 'login' })
    }
  }
  next();
})

/* eslint-disable no-new */
new Vue({
  router,
  ...App
}).$mount('#app')
