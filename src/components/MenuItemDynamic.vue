<template>
  <!--动态渲染组件-->
  <component :is="name" :index="item.path">
    <!--生成标题-->
    <template slot="title">
      <i :class="item.icon" v-if="item.icon"></i>{{ item.name }}
    </template>
    <!--循环生成二级菜单-->
    <template v-if="flag">
      <menu-item-dynamic v-for="child in item.children" :item="child" :key="child.id"></menu-item-dynamic>
    </template>
  </component>
</template>
<script>
export default {
  name: 'menu-item-dynamic',
  data () {
    const { children } = this.item || {}
    const flag = Array.isArray(children) && children.length > 0
    return {
      flag,
      name: flag ? 'el-submenu' : 'el-menu-item'
    }
  },
  props: ['item']
}
</script>
