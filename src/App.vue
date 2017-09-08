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
        <!-- <el-menu-item index="/resource">
          <template slot="title"><i class="el-icon-menu"></i>资源</template>
        </el-menu-item>
        <el-menu-item index="/menu">
          <template slot="title"><i class="el-icon-menu"></i>菜单</template>
        </el-menu-item>
        <el-menu-item index="/role">
          <template slot="title"><i class="el-icon-menu"></i>授权</template>
        </el-menu-item> -->
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
          this.addRoutes(res.data)
        })
    },
    addRoutes: function (data) {
      this.menuList = data
      this.createRoutes(this.menuList) // 创建 routes 列表
      this.$router.addRoutes(this.routes) // 添加路由
    },
    createRoutes: function (data) {
      for (let i = 0; i < data.length; i++) {
        if (Array.isArray(data[i].children) && data[i].children.length > 0) {
          this.createRoutes(data[i].children)
        } else {
          this.routes.push({
            'path': data[i].path,
            'component': resolve => require([data[i].component + '.vue'], resolve)
            // 'component': require(data[i].component + '.vue')
          })
        }
      }
      // return routes
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
