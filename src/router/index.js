import Vue from 'vue'
import Router from 'vue-router'
import Index from '@/page/index'
import Resource from '@/page/resource'
import Menu from '@/page/menu'
import Role from '@/page/role'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      component: Index
    }, {
      path: '/resource',
      component: Resource
    }, {
      path: '/menu',
      component: Menu
    }, {
      path: '/role',
      component: Role
    }
  ]
})
