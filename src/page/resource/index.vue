<template>
  <div class="page-resource">
    <el-row>
      <el-col :span="24" class="title">
        <span>资源</span>
        <el-button-group>
          <el-button type="primary" @click="createNode">新增</el-button>
          <el-button type="primary" :disabled="!isSelected" @click="modifyNode">修改</el-button>
          <el-button type="primary" :disabled="!isLeaf" @click="removeNode">删除</el-button>
        </el-button-group>
      </el-col>
      <el-col :span="24" class="content">
        <el-tree v-loading="loading" :data="treelist" node-key="id" ref="tree" highlight-current :props="defaultProps" :expand-on-click-node="false" @current-change="setCurrentChange" :render-content="renderContent"></el-tree>
      </el-col>
    </el-row>
    <el-dialog ref="resourceDialog" :title="dialogTitle" :visible.sync="dialogFormVisible" @close="initForm">
      <el-form ref="resourceForm" :rules="formRules" label-position="right" label-width="80px" :model="form">
        <el-form-item label="类型" required prop="type">
          <el-select v-model="form.type" placeholder="请选择" @change="initParent">
            <el-option v-for="item in typeOptions" :key="item.id" :label="item.name" :value="item.id">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="父菜单" prop="parentId" v-show="showParent">
          <el-select clearable filterable v-model="form.parentId" placeholder="请选择" :disabled="form.type === ''">
            <el-option v-for="item in parentOptions" :disabled="parseInt(form.id)===parseInt(item.id)" :key="item.id" :label="item.name" :value="item.id">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="编码" prop="code" required>
          <el-input v-model="form.code"></el-input>
        </el-form-item>
        <el-form-item label="资源名称" prop="name" required>
          <el-input v-model="form.name"></el-input>
        </el-form-item>
        <el-form-item label="URL" prop="url" v-if="form.type!='NODE'">
          <el-input v-model="form.url"></el-input>
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
    return {
      loading: false,
      treelist: [],
      defaultProps: {
        children: 'nodes',
        label: 'name'
      },
      dialogFormVisible: false,
      isEdit: false,
      currentData: null,
      currentNode: null,
      form: {
        type: '',
        parentId: '',
        code: '',
        name: '',
        url: ''
      },
      formRules: {
        'type': [
          { required: true, message: '请选择类型', trigger: 'change' }
        ],
        'code': [
          { required: true, message: '请输入编码', trigger: 'blur' }
        ],
        'name': [
          { required: true, message: '请输入资源名称', trigger: 'blur' }
        ],
        'url': [
          { required: true, message: '请输入URL', trigger: 'blur' }
        ]
      },
      typeOptions: [
        { id: 'NODE', name: 'NODE' },
        { id: 'MENU', name: 'MENU' },
        { id: 'URL', name: 'URL' },
        { id: 'AJAX', name: 'AJAX' }
      ],
      parentOptions: []
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
      type = '',
      parentId = '',
      code = '',
      name = '',
      url = ''
    } = {}) {
      this.$refs['resourceForm'] && this.$refs['resourceForm'].resetFields()
      this.form.id = id
      this.form.code = code
      this.form.type = type
      this.form.name = name
      this.form.parentId = parentId
      this.form.url = url

      this.initParent(type)
    },
    submitForm () { // 验证和提交表单
      this.$refs['resourceForm'].validate((valid) => {
        if (valid) {
          const _promise = this.isEdit
            ? this.$api.resource_edit({
              'id': this.form.id,
              'type': this.form.type,
              'parentId': this.form.parentId,
              'code': this.form.code,
              'name': this.form.name,
              'url': this.form.url
            })
            : this.$api.resource_add({
              'type': this.form.type,
              'parentId': this.form.parentId,
              'code': this.form.code,
              'name': this.form.name,
              'url': this.form.url
            })
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
              this.$message.error(err.message)
            })
        }
      })
    },
    initParent (type = '') { // 根据type值，初始化父菜单选项
      if (type) {
        const _type = type === 'AJAX' ? 'AJAX' : 'NODE'

        this.$api.resource_options_parent({
          type: _type
        })
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
      } else {
        this.parentOptions = []
      }
    },
    /* Tree */
    initTree () { // 初始化 Tree 组件
      this.loading = true
      this.$api.resource_list()
        .then(res => {
          if (res.code === '1') {
            this.treelist = res.data
            this.loading = false
          } else {
            throw new Error(res.message)
          }
        })
        .catch(err => {
          // 加载树失败
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
      this.initForm(this.currentData)
      this.openDialog()
    },
    removeNode () { // 删除节点
      this.$confirm('将删除该节点, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(res => { // 确认删除
          if (res === 'confirm') {
            return this.$api.resource_delete({
              'FunctionId': this.currentData.id
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
        .catch(err => { // 取消删除
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
  computed: {
    dialogTitle: function () { // 动态 Dialog 标题
      return this.isEdit ? '修改资源' : '新增资源'
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
