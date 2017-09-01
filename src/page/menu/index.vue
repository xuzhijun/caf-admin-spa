<template>
  <div class="page-menu">
    <el-row>
      <el-col :span="24" class="title">
        <span>菜单</span>
        <el-button-group>
          <el-button type="primary" @click="createNode">新增</el-button>
          <el-button type="primary" :disabled="!isSelected" @click="modifyNode">修改</el-button>
          <el-button type="primary" :disabled="!isLeaf" @click="removeNode">删除</el-button>
        </el-button-group>
      </el-col>
      <el-col :span="24" class="content">
        <el-tree v-loading="loading" :data="treelist" node-key="id" ref="tree" highlight-current :props="defaultProps" :render-content="renderContent" :expand-on-click-node="false" @current-change="setCurrentChange">
        </el-tree>
      </el-col>
    </el-row>
    <el-dialog title="菜单" :visible.sync="dialogFormVisible">
      <el-form ref="menuForm" :rules="formRules" label-position="right" label-width="120px" :model="form">
        <el-form-item v-show="!isEdit" label="父节点">
          <el-switch v-model="form.isParent" on-text="是" off-text="否"></el-switch>
        </el-form-item>
        <el-form-item label="父菜单" v-show="showParent" prop="parentId">
          <el-select clearable filterable v-model="form.parentId" placeholder="请选择">
            <el-option v-for="item in parentOptions" :disabled="form.id===item.id" :key="item.id" :label="item.label" :value="item.id">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="自定义编码" prop="codeInput" required v-if='!isEdit && form.isParent'>
          <el-input v-model="form.codeInput"></el-input>
        </el-form-item>
        <el-form-item label="编码" prop="codeSelect" required v-if='!isEdit && !form.isParent'>
          <el-select clearable filterable v-model="form.codeSelect" placeholder="请选择">
            <el-option v-for="item in codeOptions" :key="item.id" :label="item.name" :value="item.code">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="菜单名称" prop="label" required>
          <el-input v-model="form.label"></el-input>
        </el-form-item>
        <el-form-item label="图标" prop="icon">
          <el-input v-model="form.icon"></el-input>
          <span>图标参考：http://fontawesome.io/icons/</span>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="closeDialog">取 消</el-button>
        <el-button type="primary" @click="submitForm">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data () {
    // 自定义验证规则
    // var validateCodeInput = (rule, value, callback) => {
    //   if (this.isParent && !this.isEdit && value === '') {
    //     callback(new Error('请输入自定义编码'));
    //   } else {
    //     callback();
    //   }
    // };
    // var validateCodeSelect = (rule, value, callback) => {
    //   if (!this.isParent && !this.isEdit && value === '') {
    //     callback(new Error('请选择编码'));
    //   } else {
    //     callback();
    //   }
    // };
    return {
      loading: false,
      treelist: [],
      defaultProps: {
        children: 'nodes',
        label: 'label'
      },
      dialogFormVisible: false,
      isEdit: false,
      currentData: null,
      currentNode: null,
      form: {
        isParent: true,
        id: '',
        code: '',
        codeInput: '',
        codeSelect: '',
        icon: '',
        label: '',
        parentId: ''
      },
      formRules: {
        'label': [
          { required: true, message: '请输入菜单名称', trigger: 'blur' }
        ],
        'codeInput': [
          { required: true, message: '请输入自定义编码', trigger: 'blur' }
        ],
        'codeSelect': [
          { required: true, message: '请选择编码', trigger: 'change' }
        ]
      },
      parentOptions: [],
      codeOptions: []
    }
  },
  computed: {
    checkCodeField: function () {
      return this.form.isParent && !this.isEdit
    },
    isSelected: function () { // 可修改判断
      return !this.$_.isNull(this.currentNode)
    },
    isLeaf: function () { // 可删除判断
      return !this.$_.isNull(this.currentNode) && this.currentNode.isLeaf
    },
    showParent: function () { // 新增状态，或者编辑状态下的叶子节点，可以显示父菜单下拉框
      return !this.isEdit || !this.$_.isNull(this.currentNode) && this.currentNode.isLeaf
    }
  },
  methods: {
    /* Dialog */
    openDialog () {
      this.dialogFormVisible = true
    },
    closeDialog () {
      this.dialogFormVisible = false
    },
    /* Form */
    initForm ({ // 初始化表单
      id = '',
      code = '',
      icon = '',
      label = '',
      parentId = ''
    } = {}, isEdit = false, isParent = true) {
      // 清空表单数据
      this.$refs['menuForm'] && this.$refs['menuForm'].resetFields()
      // 设置表单值
      this.isEdit = isEdit
      this.form.isParent = isParent
      this.form.id = id
      this.form.codeInput = code
      this.form.codeSelect = code
      this.form.icon = icon
      this.form.label = label
      this.form.parentId = parentId
      // 初始化下拉框选项
      this.initParent()
      this.initCode()
    },
    submitForm () { // 验证和提交表单
      this.$refs['menuForm'].validate((valid) => {
        if (valid) {
          const _code = this.form.isParent
            ? this.form.codeInput
            : this.form.codeSelect

          const _promise = this.isEdit
            ? this.$api.menu_edit({
              id: this.form.id,
              code: _code,
              icon: this.form.icon,
              label: this.form.label,
              parentId: this.form.parentId
            })
            : this.$api.menu_add({
              code: _code,
              icon: this.form.icon,
              label: this.form.label,
              parentId: this.form.parentId
            })
          // 提交表单
          _promise
            .then(res => {
              // if (res.code == '1') {
              this.$message({
                type: 'success',
                message: res.message
              })
              this.closeDialog()
              // 只返回成功数据版本
              // 把修改节点拆分成 删除旧节点，新增新节点
              this.isEdit && this.removeNodeSuccess(this.currentData) // 删除旧节点
              this.createNodeSuccess(res) // 新增新节点
              // } else {
              //   throw new Error(res.message);
              // }
            })
            .catch(err => {
              // error code
              this.$message.error(err.message)
            })
        }
      })
    },
    initParent () { // 请求父菜单数据
      this.$api.menu_options_parent()
        .then(res => {
          if (res.code === '1') {
            this.parentOptions = res.data
          } else {
            throw new Error(res.message)
          }
        })
        .catch(err => {
          this.$message.error(err.message)
        })
    },
    initCode () { // 请求编码数据
      this.$api.menu_options_code()
        .then(res => {
          if (res.code === '1') {
            this.codeOptions = res.data
          } else {
            throw new Error(res.message)
          }
        })
        .catch(err => {
          this.$message.error(err.message)
        })
    },
    /* Tree */
    initTree () { // 初始化 Tree 组件
      this.loading = true
      this.$api.menu_list()
        .then(res => {
          if (res.code === '1') {
            this.treelist = res.data
            this.loading = false
          } else {
            throw new Error(res.message)
          }
        })
        .catch(err => {
          this.loading = false
          this.$message.error(err.message)
        })
    },
    createNode () { // 创建节点
      this.isEdit = false
      this.initForm()
      this.openDialog()
    },
    createNodeSuccess (data) { // 创建节点 callback
      let parentNode = data.parentId && this.$unit.findNodeById(this.treelist, data.parentId)

      parentNode = parentNode
        ? (parentNode.nodes = parentNode.nodes || [])
        : this.treelist

      parentNode.push(data)
    },
    modifyNode () { // 修改节点
      this.isEdit = true
      this.initForm(this.currentNode.data, this.isEdit)
      this.openDialog()
    },
    removeNode () { // 删除节点
      this.$confirm('将删除该节点, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(res => {
          if (res === 'confirm') {
            return this.$api.menu_delete({
              'menuId': this.currentData.id
            })
          }
        })
        .then(res => {
          // if (res.code == '1') {
          this.removeNodeSuccess(this.currentData)
          this.$message({
            type: 'success',
            message: res.message
          })
          // } else {
          //   throw new Error(res.message);
          // }
        })
        .catch(err => {
          if (err === 'cancel') {
            this.$message({
              type: 'info',
              message: '取消删除'
            })
          } else {
            this.$message.error(err.message)
          }
        })
    },
    removeNodeSuccess (data) { // 删除节点 callback
      let parentNode = data.parentId && this.$unit.findNodeById(this.treelist, data.parentId)

      parentNode = parentNode
        ? (parentNode.nodes = parentNode.nodes || [])
        : this.treelist

      parentNode.splice(parentNode.findIndex(function (o) {
        return o.id === data.id
      }), 1)

      // 删除节点后清空相关选中数据
      this.currentData = null
      this.currentNode = null
    },
    setCurrentChange (data, node) {
      this.currentData = data
      this.currentNode = node
    },
    renderContent (h, { node, data, store }) { // 渲染节点内容
      return (<span>{node.label}</span>)
      // return (
      //   <span>
      //     <span>{node.label}</span>
      //     <span style="float: right; margin-right: 20px">
      //       <el-button icon="edit" size="mini" on-click={() => this.modifyNode(store, data)}>修改</el-button>
      //       <el-button v-show={node.isLeaf} icon="delete" size="mini" on-click={() => this.removeNode(store, data)}>删除</el-button>
      //     </span>
      //   </span>);
    }
  },
  mounted () {
    this.initTree()
  }
}
</script>

<style scoped lang="scss">
.el-row {
  margin-bottom: 20px;
  &:last-child {
    margin-bottom: 0;
  }
}

.el-form .el-select {
  display: block;
}

.el-col {
  &.title {
    display: flex;
    padding: 10px 0;
    align-items: center;
    span {
      flex-grow: 1;
    }
    .el-button-group {
      float: right;
    }
  }
}
</style>
