<template>
  <div id="app">
    <layout>
      <el-menu :router="true" class="header-nav" slot="header" mode="horizontal">
        <el-menu-item index="/">欢迎</el-menu-item>
      </el-menu>
      <el-menu slot="side" :router="true">
        <el-menu-item index="/">
          <template slot="title"><i class="el-icon-menu"></i>首页</template>
        </el-menu-item>
        <menu-item-dynamic :item="menuItem" :key="menuItem.id" v-for="menuItem in menuList"></menu-item-dynamic>
      </el-menu>
      <template slot="main">
        <router-view></router-view>
      </template>
    </layout>
  </div>
</template>

<script>
import layout from './layout/120'
import MenuItemDynamic from './components/MenuItemDynamic'
export default {
  name: 'app',
  data: function () {
    return {
      menuList: [],
      routes: []
    }
  },
  created: function () {
    this.initMenuList()
  },
  methods: {
    initMenuList: function () {
      this.$api.side_nav_list()
        .then(res => {
          // this.menu.data = res.data;
          this.menuList = res.data
          this.createRoutes(this.routes, this.menuList)
          this.$router.addRoutes(this.routes)
        })
    },
    createRoutes: function (routes, data) {
      for (let i = 0; i < data.length; i++) {
        if (Array.isArray(data[i].children) && data[i].children.length > 0) {
          this.createRoutes(routes, data[i].children)
        } else {
          routes.push({
            'path': data[i].path,
            'component': require(data[i].component + '.vue')
          })
        }
      }
      return routes
    }
  },
  components: {
    layout,
    'menu-item-dynamic': MenuItemDynamic
  }
}
</script>
<style lang="">
body {
  margin: 0;
}

.el-menu-item a {
  text-decoration: none;
}

.header-nav {
  display: flex;
  justify-content: flex-end;
}
</style>
