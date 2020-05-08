<template>
  <div>
    <!-- 面包屑导航栏区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>分类参数</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片视图区域 -->
    <el-card>
      <!-- 警告区域 -->
      <el-alert
        show-icon
        :closable="false"
        title="注意：只允许为第三级分类设置相关参数！"
        type="warning">
      </el-alert>

      <!-- 选择分类区域 -->
      <el-row class="cat_opt">
        <el-col>
          <span>选择商品分类：</span>
          <el-cascader
            v-model="selectedCateKeys"
            :options="cateList"
            expand-trigger="hover"
            :props="{ value: 'cat_id', label: 'cat_name', children: 'children' }"
            @change="handleChange"></el-cascader>
        </el-col>
      </el-row>

      <!-- tab 标签页区域 -->
      <el-tabs v-model="activeName" @tab-click="handleTabClick">
        <!-- 添加动态参数的页面 -->
        <el-tab-pane label="动态参数" name="many">
          <el-button size="mini" type="primary" :disabled="isBtnDisabled" @click="addDialogVisible = true">添加参数
          </el-button>
          <el-table stripe border :data="manyTableData">
            <!-- 展开行 -->
            <el-table-column type="expand">
              <template slot-scope="scope">
                <!-- 循环渲染标签 -->
                <el-tag v-for="(item, i) in scope.row.attr_vals" :key="i" closable @close="handleClose(i, scope.row)">
                  {{item}}
                </el-tag>
                <!-- 输入文本框 -->
                <el-input
                  class="input-new-tag"
                  v-if="scope.row.inputVisible"
                  v-model="scope.row.inputValue"
                  ref="saveTagInput"
                  size="small"
                  @keyup.enter.native="handleInputConfirm(scope.row)"
                  @blur="handleInputConfirm(scope.row)"
                >
                </el-input>
                <!-- 添加标签按钮 -->
                <el-button v-else class="button-new-tag" size="small" @click="showInput(scope.row)">+ New Tag</el-button>
              </template>
            </el-table-column>
            <el-table-column type="index" label="序号"></el-table-column>
            <el-table-column prop="attr_name" label="参数名称"></el-table-column>
            <el-table-column label="操作">
              <template slot-scope="scope">
                <el-button type="primary" icon="el-icon-edit" size="mini" @click="showEditDialog(scope.row.attr_id)">
                  编辑
                </el-button>
                <el-button type="danger" icon="el-icon-delete" size="mini" @click="removeParamsById(scope.row.attr_id)">
                  删除
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
        <!-- 添加静态属性的页面 -->
        <el-tab-pane label="静态属性" name="only">
          <el-button size="mini" type="primary" :disabled="isBtnDisabled" @click="addDialogVisible = true">添加属性
          </el-button>
          <el-table stripe border :data="onlyTableData">
            <!-- 展开行 -->
            <el-table-column type="expand">
              <template slot-scope="scope">
                <!-- 循环渲染标签 -->
                <el-tag v-for="(item, i) in scope.row.attr_vals" :key="i" closable @close="handleClose(i, scope.row)">
                  {{item}}
                </el-tag>
                <!-- 输入文本框 -->
                <el-input
                  class="input-new-tag"
                  v-if="scope.row.inputVisible"
                  v-model="scope.row.inputValue"
                  ref="saveTagInput"
                  size="small"
                  @keyup.enter.native="handleInputConfirm(scope.row)"
                  @blur="handleInputConfirm(scope.row)"
                >
                </el-input>
                <!-- 添加标签按钮 -->
                <el-button v-else class="button-new-tag" size="small" @click="showInput(scope.row)">+ New Tag</el-button>
              </template>
            </el-table-column>
            <el-table-column type="index" label="序号"></el-table-column>
            <el-table-column prop="attr_name" label="属性名称"></el-table-column>
            <el-table-column label="操作">
              <template slot-scope="scope">
                <el-button type="primary" icon="el-icon-edit" size="mini" @click="showEditDialog(scope.row.attr_id)">
                  编辑
                </el-button>
                <el-button type="danger" icon="el-icon-delete" size="mini" @click="removeParamsById(scope.row.attr_id)">
                  删除
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
      </el-tabs>
    </el-card>

    <!-- 添加动态参数or静态属性对话框 -->
    <el-dialog
      :title="'添加' + titleText"
      :visible.sync="addDialogVisible"
      width="50%" @close="addDialogClosed">
      <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="100px">
        <el-form-item :label="titleText" prop="attr_name">
          <el-input v-model="addForm.attr_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
       <el-button @click="addDialogVisible = false">取 消</el-button>
       <el-button type="primary" @click="addParams">确 定</el-button>
     </span>
    </el-dialog>

    <!-- 修改动态参数or静态属性对话框 -->
    <el-dialog
      :title="'修改' + titleText"
      :visible.sync="editDialogVisible"
      width="50%" @close="editDialogClosed">
      <el-form :model="editForm" :rules="editFormRules" ref="editFormRef" label-width="100px">
        <el-form-item :label="titleText" prop="attr_name">
          <el-input v-model="editForm.attr_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
       <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editParams">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: 'Params',
  data () {
    return {
      // 所有商品分类列表
      cateList: [],
      // 与级联选择器双向绑定的数组
      selectedCateKeys: [],
      // 选中的标签页名称
      activeName: 'many',
      // 存放动态参数的数据
      manyTableData: [],
      // 存放静态属性的数据
      onlyTableData: [],
      // 添加动态参数or静态属性对话框的显示与隐藏
      addDialogVisible: false,
      // 添加动态参数or静态属性的数据对象
      addForm: {
        attr_name: ''
      },
      // 添加表单验证规则对象
      addFormRules: {
        attr_name: [
          {
            required: true,
            message: '请输入参数名称',
            trigger: 'blur'
          }
        ]
      },
      // 编辑动态参数or静态属性对话框的显示与隐藏
      editDialogVisible: false,
      // 编辑表单数据对象
      editForm: {},
      // 编辑表单验证规则对象
      editFormRules: {
        attr_name: [
          {
            required: true,
            message: '请输入参数名称',
            trigger: 'blur'
          }
        ]
      }
    }
  },
  created () {
    this.getCateList()
  },
  methods: {
    // 获取所有商品分类列表
    async getCateList () {
      const { data: result } = await this.$http.get('categories')
      if (result.meta.status !== 200) {
        return this.$message.error('获取商品列表失败')
      }
      this.cateList = result.data
    },
    // 级联选择器中，选中项发生变化时调用该函数
    handleChange () {
      this.getParamsData()
    },
    // 标签页点击事件
    handleTabClick () {
      // console.log(this.activeName)
      this.getParamsData()
    },
    // 获取参数的列表数据
    async getParamsData () {
      // 如果选中的不是三级分类，则把selectedCateKeys清空，即把选择项重置
      if (this.selectedCateKeys.length !== 3) {
        this.selectedCateKeys = []
        this.manyTableData = []
        this.onlyTableData = []
      } else {
        // console.log(this.selectedCateKeys)
        // 根据三级分类的id获取对应的动态参数或静态属性列表
        const { data: result } = await this.$http.get(`categories/${this.cateId}/attributes`, { params: { sel: this.activeName } })
        if (result.meta.status !== 200) {
          return this.$message.error('获取列表失败')
        }
        // console.log(result.data)
        // 给数据对象赋值之前，先把attr_vals里的信息由字符串转换为数组
        result.data.forEach(item => {
          item.attr_vals = item.attr_vals ? item.attr_vals.split(',') : []
          // 为每一行的标签单独设置一个值,防止多行标签共用一个属性
          item.inputVisible = false
          item.inputValue = ''
        })
        // console.log(result.data)
        // 根据所选tab的不同，把数据保存到不同的对象中
        if (this.activeName === 'many') {
          this.manyTableData = result.data
        } else {
          this.onlyTableData = result.data
        }
      }
    },
    // 添加表单关闭时，清空表单
    addDialogClosed () {
      this.$refs.addFormRef.resetFields()
    },
    // 点击确定，添加参数
    addParams () {
      // 在提交前进行表单预验证
      this.$refs.addFormRef.validate(async valid => {
        if (!valid) {
          return this.$message.error('添加失败')
        }
        const { data: result } = await this.$http.post(`categories/${this.cateId}/attributes`, {
          attr_name: this.addForm.attr_name,
          attr_sel: this.activeName
        })
        if (result.meta.status !== 201) {
          return this.$message.error('添加失败')
        }
        this.$message.success('添加成功')
        this.getParamsData()
        this.addDialogVisible = false
      })
    },
    // 编辑表单关闭时，清空表单
    editDialogClosed () {
      this.$refs.editFormRef.resetFields()
    },
    // 点击编辑按钮，弹出修改面板
    async showEditDialog (id) {
      const { data: result } = await this.$http.get(`categories/${this.cateId}/attributes/${id}`, { params: { attr_sel: this.activeName } })
      if (result.meta.status !== 200) {
        return this.$message.error('获取参数信息失败')
      }
      this.editForm = result.data
      this.editDialogVisible = true
    },
    // 点击确定，确认修改
    editParams () {
      this.$refs.editFormRef.validate(async valid => {
        if (!valid) {
          return this.$message.error('修改失败')
        }
        const { data: result } = await this.$http.put(`categories/${this.cateId}/attributes/${this.editForm.attr_id}`, {
          attr_name: this.editForm.attr_name,
          attr_sel: this.activeName
        })
        if (result.meta.status !== 200) {
          return this.$message.error('修改失败')
        }
        this.$message.success('修改成功')
        this.getParamsData()
        this.editDialogVisible = false
      })
    },
    // 根据id删除参数
    async removeParamsById (id) {
      const confirmResult = await this.$confirm('此操作将永久删除该参数, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(err => err)
      if (confirmResult === 'cancel') {
        return this.$message.info('已取消删除')
      }
      const { data: result } = await this.$http.delete(`categories/${this.cateId}/attributes/${id}`)
      if (result.meta.status !== 200) {
        return this.$message.error('删除失败')
      }
      this.$message.success('删除成功')
      this.getParamsData()
    },
    // 按下回车键或者文本框数去焦点时调用该函数
    handleInputConfirm (row) {
      if (row.inputValue.trim().length === 0) {
        row.inputValue = ''
        row.inputVisible = false
      } else {
        row.attr_vals.push(row.inputValue.trim())
        row.inputValue = ''
        row.inputVisible = false
        this.saveAttrVals(row)
      }
    },
    // 点击添加新标签按钮，展示文本框
    showInput (row) {
      row.inputVisible = true
      // $nextTick：当页面重新渲染后，才会执行回调函数中的代码
      this.$nextTick(_ => {
        // 让文本框自动获得焦点
        this.$refs.saveTagInput.$refs.input.focus()
      })
    },
    // 保存标签的数据到数据库中
    async saveAttrVals (row) {
      const { data: result } = await this.$http.put(`categories/${this.cateId}/attributes/${row.attr_id}`, { attr_name: row.attr_name, attr_sel: row.attr_sel, attr_vals: row.attr_vals.join(',') })
      if (result.meta.status !== 200) {
        return this.$message.error('修改失败')
      }
      return this.$message.success('修改成功')
    },
    // 删除标签
    handleClose (i, row) {
      row.attr_vals.splice(i, 1)
      this.saveAttrVals(row)
    }
  },
  computed: {
    // 按钮是否需要被禁用，需要返回true，否则返回false
    isBtnDisabled () {
      if (this.selectedCateKeys.length !== 3) {
        return true
      }
      return false
    },
    // 选中的三级分类的id
    cateId () {
      if (this.selectedCateKeys.length === 3) {
        return this.selectedCateKeys[2]
      }
      return null
    },
    // 添加动态参数or静态属性对话框的标题
    titleText () {
      if (this.activeName === 'many') {
        return '动态参数'
      }
      return '静态属性'
    }
  }
}
</script>

<style lang="less" scoped>
  .cat_opt {
    margin: 15px 0;
  }

  .el-tag {
    margin: 5px;
  }

  .input-new-tag {
    width: 90px;
  }
</style>
