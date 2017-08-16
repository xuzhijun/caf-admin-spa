<template>
  <div class="wrapper">
    <div class="header">
      <slot name="header"></slot>
    </div>
    <el-row class="body" type="flex">
      <el-col class="side" :span="6">
        <slot name="side"></slot>
      </el-col>
      <el-col class="main" :span="18">
        <slot name="main"></slot>
      </el-col>
    </el-row>
  </div>
</template>
<script>
export default {
}
</script>
<style scoped lang="">
.wrapper {
  display: flex;
  flex-direction: column;
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
}

.wrapper .body {
  flex: 1;
}
.wrapper .body .el-col {
  overflow: auto;
}
.side {
  background-color: #eef1f6
}
.main {
  padding: 10px
}
</style>
