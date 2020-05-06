<template>
  <div>
    <!-- 面包屑导航栏区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品分类</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片视图区域 -->
    <el-card>
      <!-- 按钮区域 -->
      <el-row>
        <el-col>
          <el-button type="primary" @click="showAddCateDialog">添加分类</el-button>
        </el-col>
      </el-row>

      <!-- 商品分类表格区域 -->
      <tree-table :data="cateList" :columns="columns" :show-row-hover="false" :expand-type="false"
                  :selection-type="false" show-index border class="tree-table">
        <!-- 是否有效 -->
        <template slot="isok" slot-scope="scope">
          <i class="el-icon-success" style="color: green" v-if="scope.row.cat_deleted === false"></i>
          <i class="el-icon-error" style="color: red" v-else></i>
        </template>
        <!-- 分类等级 -->
        <template slot="order" slot-scope="scope">
          <el-tag v-if="scope.row.cat_level === 0" size="mini">一级</el-tag>
          <el-tag type="success" v-else-if="scope.row.cat_level === 1" size="mini">二级</el-tag>
          <el-tag type="warning" v-else size="mini">三级</el-tag>
        </template>
        <!-- 操作 -->
        <template slot="opt" slot-scope="scope">
          <el-button type="primary" icon="el-icon-edit" size="mini" @click="showEditDialog(scope.row.cat_id)">编辑
          </el-button>
          <el-button type="danger" icon="el-icon-delete" size="mini" @click="removeCateById(scope.row.cat_id)">删除
          </el-button>
        </template>
      </tree-table>
      <!-- 页码区域 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[3, 5, 10, 15]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total">
      </el-pagination>
    </el-card>

    <!-- 添加分类对话框 -->
    <el-dialog
      title="添加分类"
      :visible.sync="addCateDialogVisible"
      width="50%" @close="addCateDialogClosed">
      <el-form :model="addCateForm" :rules="addCateFormRules" ref="addCateFormRef" label-width="100px">
        <el-form-item label="分类名称：" prop="cat_name">
          <el-input v-model="addCateForm.cat_name"></el-input>
        </el-form-item>
        <el-form-item label="父级分类：">
          <!-- :options="parentCateList" 绑定数据源 -->
          <!-- :props 指定配置对象 -->
          <el-cascader
            v-model="selectedKeys"
            :options="parentCateList"
            :props="{ expandTrigger: 'hover', value: 'cat_id', label: 'cat_name', children: 'children', checkStrictly: true }"
            @change="parentCateChanged" clearable></el-cascader>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
       <el-button @click="addCateDialogVisible = false">取 消</el-button>
       <el-button type="primary" @click="addCate">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 编辑分类对话框 -->
    <el-dialog
      title="编辑分类"
      :visible.sync="editCateDialogVisible"
      width="50%" @close="editCateDialogClosed">
      <el-form :model="editCateForm" :rules="editCateFormRules" ref="editCateFormRef" label-width="100px">
        <el-form-item label="分类名称：" prop="cat_name">
          <el-input v-model="editCateForm.cat_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editCateDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editCateInfo">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: 'Cate',
  data () {
    return {
      // 获取商品列表的参数对象
      queryInfo: {
        // 显示3层的分类列表
        type: 3,
        // 当前的页数
        pagenum: 1,
        // 每页显示多少条数据
        pagesize: 5
      },
      // 商品分类的数据列表，默认为空
      cateList: [],
      // 商品分类数据的总条数，默认为0
      total: 0,
      // 为商品分类表格指定每一列的属性
      columns: [
        {
          label: '分类名称',
          prop: 'cat_name'
        },
        // type: 'template'表示将这一列定义为模板，template: 'isok'表示模板名称
        {
          label: '是否有效',
          type: 'template',
          template: 'isok'
        },
        {
          label: '分类等级',
          type: 'template',
          template: 'order'
        },
        {
          label: '操作',
          type: 'template',
          template: 'opt'
        }
      ],
      // 控制添加分类对话框的显示与隐藏
      addCateDialogVisible: false,
      // 添加分类数据对象
      addCateForm: {
        // 要添加的分类名称
        cat_name: '',
        // 添加分类的父级分类id
        cat_pid: 0,
        // 要添加分类的等级，默认添加一级分类
        cat_level: 0
      },
      // 添加分类表单验证规则对象
      addCateFormRules: {
        cat_name: [
          {
            required: true,
            message: '请填写分类名称',
            trigger: 'blur'
          }
        ]
      },
      // 父级分类列表
      parentCateList: [],
      // 级联选择器中选中的父级分类id
      selectedKeys: [],
      // 控制编辑分类对话框的显示与隐藏
      editCateDialogVisible: false,
      // 编辑分类的数据对象
      editCateForm: {},
      // 编辑分类的表单验证规则对象
      editCateFormRules: {
        cat_name: [
          {
            required: true,
            message: '请填写分类名称',
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
    // 获取商品分类列表
    async getCateList () {
      const { data: result } = await this.$http.get('categories', { params: this.queryInfo })
      if (result.meta.status !== 200) {
        return this.$message.error('获取商品分类列表失败')
      }
      // console.log(result)
      // 把数据列表赋值给cateList
      this.cateList = result.data.result
      // 把结果总条数赋值给total
      this.total = result.data.total
    },
    // 监听pagesize改变
    handleSizeChange (newSize) {
      this.queryInfo.pagesize = newSize
      this.getCateList()
    },
    // 监听pagenum改变
    handleCurrentChange (newPage) {
      this.queryInfo.pagenum = newPage
      this.getCateList()
    },
    // 展示添加分类对话框
    showAddCateDialog () {
      this.getParentCateList()
      this.addCateDialogVisible = true
    },
    // 获取父级分类的数据列表
    async getParentCateList () {
      const { data: result } = await this.$http.get('categories', { params: { type: 2 } })
      if (result.meta.status !== 200) {
        return this.$message.error('获取父级分类失败')
      }
      this.parentCateList = result.data
      // console.log(this.parentCateList)
    },
    // 级联选择器选中项发生变化时，调用该函数
    parentCateChanged () {
      // console.log(this.selectedKeys)
      // 如果selectedKeys数组中的length>0，那么说明选择了父级分类
      // 反之，则没有选择任何的父级分类
      if (this.selectedKeys.length > 0) {
        // 父级分类的id永远等于selectedKeys数组中最后一项的值
        this.addCateForm.cat_pid = this.selectedKeys[this.selectedKeys.length - 1]
        // 添加的分类的等级永远等于selectedKeys数组的长度
        this.addCateForm.cat_level = this.selectedKeys.length
      } else {
        this.addCateForm.cat_pid = 0
        this.addCateForm.cat_level = 0
      }
    },
    // 点击确定，添加分类
    addCate () {
      // console.log(this.addCateForm)
      this.$refs.addCateFormRef.validate(async valid => {
        if (!valid) {
          return this.$message.error('添加分类失败')
        }
        const { data: result } = await this.$http.post('categories', this.addCateForm)
        if (result.meta.status !== 201) {
          return this.$message.error('添加分类失败')
        }
        this.$message.success('添加分类成功')
        this.getCateList()
        this.addCateDialogVisible = false
      })
    },
    // 监听添加分类对话框的关闭事件，重置表单
    addCateDialogClosed () {
      this.$refs.addCateFormRef.resetFields()
      this.selectedKeys = []
      this.addCateForm.cat_pid = 0
      this.addCateForm.cat_level = 0
    },
    // 编辑分类对话框
    async showEditDialog (id) {
      // console.log(id)
      const { data: result } = await this.$http.get('categories/' + id)
      if (result.meta.status !== 200) {
        return this.$message.error('获取分类信息失败')
      }
      this.editCateForm = result.data
      // console.log(this.editCateForm)
      this.editCateDialogVisible = true
    },
    // 监听编辑分类对话框的关闭事件，重置表单
    editCateDialogClosed () {
      this.$refs.editCateFormRef.resetFields()
      this.editCateForm = {}
    },
    // 点击确定按钮，确认编辑分类
    editCateInfo () {
      this.$refs.editCateFormRef.validate(async valid => {
        if (!valid) {
          return this.$message.error('修改分类信息失败')
        }
        const { data: result } = await this.$http.put('categories/' + this.editCateForm.cat_id, { cat_name: this.editCateForm.cat_name })
        if (result.meta.status !== 200) {
          return this.$message.error('修改分类信息失败')
        }
        this.$message.success('修改分类信息成功')
        this.getCateList()
        this.editCateDialogVisible = false
      })
    },
    // 根据id删除对应分类
    async removeCateById (id) {
      // console.log(id)
      // 弹框询问用户是否删除分类
      const confirmResult = await this.$confirm('此操作将永久删除该分类, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(err => err)
      if (confirmResult === 'cancel') {
        return this.$message.info('已取消删除')
      }
      const { data: result } = await this.$http.delete('categories/' + id)
      if (result.meta.status !== 200) {
        return this.$message.error('删除分类失败')
      }
      this.$message.success('删除分类成功')
      this.getCateList()
    }
  }
}
</script>

<style lang="less" scoped>
  .tree-table {
    margin-top: 15px;
  }

  .el-cascader {
    width: 100%;
  }
</style>
