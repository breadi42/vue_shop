<template>
  <div>
    <!-- 面包屑导航栏区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>用户管理</el-breadcrumb-item>
      <el-breadcrumb-item>用户列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图区域 -->
    <el-card>
      <!-- 搜索框与添加用户按钮区域 -->
      <el-row :gutter="20">
        <el-col :span="9">
          <!-- 搜索框 -->
          <el-input placeholder="请输入内容" v-model="queryInfo.query" clearable @clear="getUserList">
            <el-button slot="append" icon="el-icon-search" @click="getUserList"></el-button>
          </el-input>
        </el-col>
        <el-col :span="5">
          <!-- 添加用户按钮 -->
          <el-button type="primary" @click="addDialogVisible = true">添加用户</el-button>
        </el-col>
      </el-row>
      <!-- 用户列表区域 -->
      <el-table :data="userlist" stripe border>
        <el-table-column type="index" label="序号"></el-table-column>
        <el-table-column prop="username" label="姓名"></el-table-column>
        <el-table-column prop="email" label="邮箱"></el-table-column>
        <el-table-column prop="mobile" label="电话"></el-table-column>
        <el-table-column prop="role_name" label="角色"></el-table-column>
        <el-table-column label="状态">
          <!-- 使用作用域插槽获取当前的prop mg_state的信息，把对应的布尔值用按钮方式体现-->
          <template slot-scope="scope">
            <!-- 双向绑定 -->
            <el-switch v-model="scope.row.mg_state" @change="userStateChanged(scope.row)"></el-switch>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180px">
          <template slot-scope="scope">
            <!-- 编辑按钮 -->
            <el-tooltip effect="dark" content="编辑" placement="top" :enterable="false">
              <el-button type="primary" icon="el-icon-edit" size="mini" @click="showEditDialog(scope.row.id)"></el-button>
            </el-tooltip>
            <!-- 删除按钮 -->
            <el-tooltip effect="dark" content="删除" placement="top" :enterable="false">
              <el-button type="danger" icon="el-icon-delete" size="mini" @click="removeUserById(scope.row.id)"></el-button>
            </el-tooltip>
            <!-- 分配角色按钮 -->
            <el-tooltip effect="dark" content="分配角色" placement="top" :enterable="false">
              <el-button type="warning" icon="el-icon-setting" size="mini" @click="setRole(scope.row)"></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>
      <!-- 分页区域-->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[1, 2, 5, 10]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total" background>
      </el-pagination>
    </el-card>
    <!-- 添加用户的对话框 -->
    <el-dialog
      title="添加用户"
      :visible.sync="addDialogVisible"
      width="50%"
      @close="addDialogClosed">
      <!--内容主体区域-->
      <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="70px">
        <el-form-item label="用户名" prop="username">
          <el-input v-model="addForm.username"></el-input>
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input v-model="addForm.password"></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="addForm.email"></el-input>
        </el-form-item>
        <el-form-item label="手机" prop="mobile">
          <el-input v-model="addForm.mobile"></el-input>
        </el-form-item>
      </el-form>
      <!--底部按钮区域-->
      <span slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addUser">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 修改用户信息的对话框 -->
    <el-dialog
      title="修改用户信息"
      :visible.sync="editDialogVisible"
      width="50%"
      @close="editDialogClosed">
      <el-form :model="editForm" :rules="editFormRules" ref="editFormRef" label-width="70px">
        <el-form-item label="用户名">
          <el-input v-model="editForm.username" disabled></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="editForm.email"></el-input>
        </el-form-item>
        <el-form-item label="手机" prop="mobile">
          <el-input v-model="editForm.mobile"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editUserInfo">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 分配角色的对话框 -->
    <el-dialog
      title="分配角色"
      :visible.sync="setRoleDialogVisible"
      width="50%" @close="setRoleDialogClosed">
      <div>
        <p>用户名:{{userInfo.username}}</p>
        <p>角色:{{userInfo.role_name}}</p>
        <p>
          分配新角色:
          <el-select v-model="selectedRoleId" placeholder="请选择">
            <el-option
              v-for="item in rolesList"
              :key="item.id"
              :label="item.roleName"
              :value="item.id">
            </el-option>
          </el-select>
        </p>
      </div>
      <span slot="footer" class="dialog-footer">
    <el-button @click="setRoleDialogVisible = false">取 消</el-button>
    <el-button type="primary" @click="saveRoleInfo">确 定</el-button>
  </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: 'Users',
  data () {
    // 邮箱的验证规则
    const checkEmail = (rule, value, callback) => {
      // 验证邮箱的正则表达式
      const regEmail = /^\w+([-+.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/
      if (regEmail.test(value)) {
        return callback()
      }
      callback(new Error('请输入合法的邮箱地址'))
    }
    // 手机号的验证规则
    const checkMobile = (rule, value, callback) => {
      // 验证手机号的正则表达式
      const regMobile = /^([1][3,4,5,6,7,8,9])\d{9}$/
      if (regMobile.test(value)) {
        return callback()
      }
      callback(new Error('请输入正确的手机号'))
    }
    return {
      // 获取用户列表的参数对象
      queryInfo: {
        // 搜索关键字
        query: '',
        // 当前的页数
        pagenum: 1,
        // 每页显示多少条数据
        pagesize: 2
      },
      // 用户列表数组
      userlist: [],
      // 信息总数
      total: 0,
      // 控制添加用户对话框的显示与隐藏
      addDialogVisible: false,
      // 添加用户的表单数据
      addForm: {
        username: '',
        password: '',
        email: '',
        mobile: ''
      },
      // 添加用户的表单验证规则
      addFormRules: {
        username: [
          {
            required: true,
            message: '请输入用户名',
            trigger: 'blur'
          },
          {
            min: 3,
            max: 10,
            message: '长度在3-10个字符之间',
            trigger: 'blur'
          }
        ],
        password: [
          {
            required: true,
            message: '请输入密码',
            trigger: 'blur'
          },
          {
            min: 6,
            max: 15,
            message: '长度在6-15个字符之间',
            trigger: 'blur'
          }
        ],
        email: [
          {
            required: true,
            message: '请输入邮箱',
            trigger: 'blur'
          },
          {
            validator: checkEmail,
            trigger: 'blur'
          }
        ],
        mobile: [
          {
            required: true,
            message: '请输入手机号码',
            trigger: 'blur'
          },
          {
            validator: checkMobile,
            trigger: 'blur'
          }
        ]
      },
      // 控制修改用户信息对话框的显示与隐藏
      editDialogVisible: false,
      // 修改用户信息的表单数据
      editForm: {},
      // 修改用户信息的表单验证规则
      editFormRules: {
        email: [
          {
            required: true,
            message: '请输入邮箱',
            trigger: 'blur'
          },
          {
            validator: checkEmail,
            trigger: 'blur'
          }
        ],
        mobile: [
          {
            required: true,
            message: '请输入手机号码',
            trigger: 'blur'
          },
          {
            validator: checkMobile,
            trigger: 'blur'
          }
        ]
      },
      // 控制分配角色对话框的显示与隐藏
      setRoleDialogVisible: false,
      // 当前分配角色的用户的信息
      userInfo: {},
      // 所有角色列表
      rolesList: [],
      // 新分配的角色的id
      selectedRoleId: ''
    }
  },
  // 生命周期函数，加载页面前调用
  created () {
    // 获取用户列表
    this.getUserList()
  },
  methods: {
    // 获取用户列表
    async getUserList () {
      // 解构出data 并重命名为result
      // 请求路径为users，请求方式为get
      const { data: result } = await this.$http.get('users', { params: this.queryInfo })
      // 若状态码status不为200 则说明获取用户列表失败
      if (result.meta.status !== 200) return this.$message.error('获取用户列表失败！')
      // 给当前对象的数据赋值
      this.userlist = result.data.users
      this.total = result.data.total
    },
    // 监听每页显示多少条信息
    handleSizeChange (newSize) {
      this.queryInfo.pagesize = newSize
      this.getUserList()
    },
    // 监听当前所在页码数
    handleCurrentChange (newPage) {
      this.queryInfo.pagenum = newPage
      this.getUserList()
    },
    // 监听switch开关状态的改变
    async userStateChanged (userInfo) {
      // put一般表示修改，这里的请求路径为 users/:uId/state/:type
      // uId表示用户ID，type表示用户状态
      const { data: result } = await this.$http.put(`users/${userInfo.id}/state/${userInfo.mg_state}`)
      if (result.meta.status !== 200) {
        userInfo.mg_state = !userInfo.mg_state
        return this.$message.error('更新用户状态失败！')
      }
      this.$message.success('更新用户状态成功！')
    },
    // 监听添加用户表单的关闭事件
    addDialogClosed () {
      // 当添加用户表单关闭时，清空表单
      this.$refs.addFormRef.resetFields()
    },
    // 点击确定按钮，添加用户
    addUser () {
      // 提交前的表单预验证
      this.$refs.addFormRef.validate(async valid => {
        if (!valid) {
          return this.$message.error('添加用户失败！')
        }
        // 发起添加用户的网络请求
        const { data: result } = await this.$http.post('users', this.addForm)
        if (result.meta.status !== 201) {
          return this.$message.error('添加用户失败！')
        }
        this.$message.success('添加用户成功！')
        // 添加用户成功后，关闭添加用户窗口
        this.addDialogVisible = false
        // 刷新用户列表
        this.getUserList()
      })
    },
    // 点击编辑按钮，修改用户信息
    async showEditDialog (id) {
      // console.log(id)
      // 解构出data对象并重命名为result
      const { data: result } = await this.$http.get('users/' + id)
      if (result.meta.status !== 200) {
        return this.$message.error('获取用户信息失败！')
      }
      this.editForm = result.data
      this.editDialogVisible = true
    },
    // 监听修改用户信息表单的关闭事件
    editDialogClosed () {
      this.$refs.editFormRef.resetFields()
    },
    // 点击确定按钮，修改用户信息
    editUserInfo () {
      // 提交前的表单预验证
      this.$refs.editFormRef.validate(async valid => {
        if (!valid) {
          return this.$message.error('修改用户信息失败！')
        }
        // 发起修改用户信息的网络请求
        const { data: result } = await this.$http.put('users/' + this.editForm.id, { email: this.editForm.email, mobile: this.editForm.mobile })
        if (result.meta.status !== 200) {
          return this.$message.error('修改用户信息失败！')
        }
        // 关闭对话框
        this.editDialogVisible = false
        // 刷新用户列表
        this.getUserList()
        // 修改成功提示
        this.$message.success('修改用户信息成功！')
      })
    },
    // 点击删除按钮，根据id删除用户信息
    async removeUserById (id) {
      // 弹框询问用户是否删除数据
      const confirmResult = await this.$confirm('此操作将永久删除该用户, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(err => err)
      // console.log(confirmResult)
      // 点击确定删除时，返回字符串 confirm
      // 点击取消删除时，返回字符串 cancel
      if (confirmResult === 'cancel') {
        return this.$message.info('已取消删除')
      }
      // 发出删除用户的网络请求，请求方式为delete
      const { data: result } = await this.$http.delete('users/' + id)
      if (result.meta.status !== 200) {
        return this.$message.error('删除用户失败！')
      }
      this.$message.success('删除用户成功！')
      // 刷新用户列表
      this.getUserList()
    },
    // 展示分配角色的对话框
    async setRole (userInfo) {
      this.userInfo = userInfo
      // 获取所有角色列表
      const { data: result } = await this.$http.get('roles')
      if (result.meta.status !== 200) {
        return this.$message.error('获取角色列表失败！')
      }
      this.rolesList = result.data
      this.setRoleDialogVisible = true
    },
    // 点击确定按钮，给用户分配新角色
    async saveRoleInfo () {
      const { data: result } = await this.$http.put(`users/${this.userInfo.id}/role`, { rid: this.selectedRoleId })
      if (result.meta.status !== 200) {
        return this.$message.error('分配新角色失败！')
      }
      this.getUserList()
      this.$message.success('分配新角色成功！')
      this.setRoleDialogVisible = false
    },
    // 当分配角色对话框关闭时，重置选择的角色id值和角色列表数组
    setRoleDialogClosed () {
      this.selectedRoleId = ''
      this.rolesList = []
    }
  }
}
</script>

<style scoped>

</style>
