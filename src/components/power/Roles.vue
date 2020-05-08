<template>
  <div>
    <!-- 面包屑导航栏区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>角色列表</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片视图区域 -->
    <el-card>
      <!-- 添加角色按钮区域 -->
      <el-row>
        <el-col>
          <el-button type="primary" @click="addDialogVisible = true">添加角色</el-button>
        </el-col>
      </el-row>

      <!-- 角色列表区域 -->
      <el-table :data="rolesList" border stripe row-key="id">
        <!-- 展开列 -->
        <el-table-column type="expand">
          <template slot-scope="scope">
            <el-row v-for="(item1, i1) in scope.row.children" :key="item1.id"
                    :class="['bdbottom', i1 === 0 ? 'bdtop' : '', 'vcenter']">
              <!-- 渲染一级权限 -->
              <el-col :span="5">
                <el-tag closable @close="removeRightById(scope.row, item1.id)">{{item1.authName}}</el-tag>
                <i class="el-icon-caret-right"></i>
              </el-col>
              <!-- 渲染二级和三级权限 -->
              <el-col :span="19">
                <el-row v-for="(item2, i2) in item1.children" :key="item2.id" :class="[i2 === 0 ? '' : 'bdtop', 'vcenter']">
                  <!-- 渲染二级权限 -->
                  <el-col :span="6">
                    <el-tag type="success" closable @close="removeRightById(scope.row, item2.id)">{{item2.authName}}</el-tag>
                    <i class="el-icon-caret-right"></i>
                  </el-col>
                  <!-- 渲染三级权限 -->
                  <el-col :span="18">
                    <el-tag type="warning" v-for="(item3) in item2.children" :key="item3.id" closable @close="removeRightById(scope.row, item3.id)">
                      {{item3.authName}}
                    </el-tag>
                  </el-col>
                </el-row>
              </el-col>
            </el-row>
          </template>
        </el-table-column>
        <el-table-column type="index" label="序号"></el-table-column>
        <el-table-column label="角色名称" prop="roleName"></el-table-column>
        <el-table-column label="角色描述" prop="roleDesc"></el-table-column>
        <el-table-column label="操作" width="300px">
          <template slot-scope="scope">
            <el-button type="primary" icon="el-icon-edit" size="mini" @click="showEditDialog(scope.row.id)">编辑
            </el-button>
            <el-button type="danger" icon="el-icon-delete" size="mini" @click="removeRoleById(scope.row.id)">删除
            </el-button>
            <el-button type="warning" icon="el-icon-setting" size="mini" @click="showSetRightDialog(scope.row)">分配权限</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 添加角色对话框 -->
    <el-dialog
      title="添加角色"
      :visible.sync="addDialogVisible"
      width="50%"
      @close="addDialogClosed">
      <!--内容主体区域-->
      <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="80px">
        <el-form-item label="角色名称" prop="roleName">
          <el-input v-model="addForm.roleName"></el-input>
        </el-form-item>
        <el-form-item label="角色描述" prop="roleDesc">
          <el-input v-model="addForm.roleDesc"></el-input>
        </el-form-item>
      </el-form>
      <!--底部按钮区域-->
      <span slot="footer" class="dialog-footer">
          <el-button @click="addDialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="addRole">确 定</el-button>
        </span>
    </el-dialog>

    <!-- 编辑角色对话框 -->
    <el-dialog
      title="编辑角色"
      :visible.sync="editDialogVisible"
      width="50%"
      @close="editDialogClosed">
      <!--内容主体区域-->
      <el-form :model="editForm" :rules="editFormRules" ref="editFormRef" label-width="80px">
        <el-form-item label="角色名称" prop="roleName">
          <el-input v-model="editForm.roleName"></el-input>
        </el-form-item>
        <el-form-item label="角色描述" prop="roleDesc">
          <el-input v-model="editForm.roleDesc"></el-input>
        </el-form-item>
      </el-form>
      <!--底部按钮区域-->
      <span slot="footer" class="dialog-footer">
          <el-button @click="editDialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="editRoleInfo">确 定</el-button>
        </span>
    </el-dialog>

    <!-- 分配权限对话框 -->
    <el-dialog
      title="分配权限"
      :visible.sync="setRightDialogVisible"
      width="50%" @close="setRightDialogClosed">
      <!--树形控件区域-->
      <el-tree :data="rightList" :props="treeProps" show-checkbox node-key="id" default-expand-all :default-checked-keys="defKeys" ref="treeRef"></el-tree>
      <!--底部按钮区域-->
      <span slot="footer" class="dialog-footer">
          <el-button @click="setRightDialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="allotRights">确 定</el-button>
        </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: 'Roles',
  data () {
    return {
      // 角色列表数据
      rolesList: [],
      // 控制添加角色对话框的显示与隐藏
      addDialogVisible: false,
      // 添加角色的表单数据
      addForm: {
        roleName: '',
        roleDesc: ''
      },
      // 添加角色的表单验证规则
      addFormRules: {
        roleName: [
          {
            required: true,
            message: '请输入角色名称',
            trigger: 'blur'
          },
          {
            min: 2,
            max: 8,
            message: '长度在2-8个字符之间',
            trigger: 'blur'
          }
        ],
        roleDesc: [
          {
            required: true,
            message: '请输入角色描述',
            trigger: 'blur'
          },
          {
            min: 2,
            max: 12,
            message: '长度在2-12个字符之间',
            trigger: 'blur'
          }
        ]
      },
      // 控制编辑角色对话框的显示与隐藏
      editDialogVisible: false,
      // 编辑角色表单数据
      editForm: {},
      // 编辑角色的表单验证规则
      editFormRules: {
        roleName: [
          {
            required: true,
            message: '请输入角色名称',
            trigger: 'blur'
          },
          {
            min: 2,
            max: 8,
            message: '长度在2-8个字符之间',
            trigger: 'blur'
          }
        ],
        roleDesc: [
          {
            required: true,
            message: '请输入角色描述',
            trigger: 'blur'
          },
          {
            min: 2,
            max: 12,
            message: '长度在2-12个字符之间',
            trigger: 'blur'
          }
        ]
      },
      // 分配权限对话框的关闭与打开
      setRightDialogVisible: false,
      // 权限列表数据
      rightList: [],
      // 树形控件的属性绑定对象
      treeProps: {
        label: 'authName',
        children: 'children'
      },
      // 默认勾选的节点的key数组
      defKeys: [],
      // 当前分配权限的角色的id
      roleId: ''
    }
  },
  created () {
    // 获取所有角色列表
    this.getRolesList()
  },
  methods: {
    // 获取角色列表
    async getRolesList () {
      const { data: result } = await this.$http.get('roles')
      if (result.meta.status !== 200) {
        return this.$message.error('获取角色列表失败！')
      }
      this.rolesList = result.data
      // console.log(this.rolesList)
    },

    // 添加角色对话框关闭时，清空表单
    addDialogClosed () {
      this.$refs.addFormRef.resetFields()
    },

    // 点击确定按钮，添加角色
    addRole () {
      // 表单预验证
      this.$refs.addFormRef.validate(async valid => {
        if (!valid) {
          return this.$message.error('添加角色失败！')
        }
        // 发起添加用户的网络请求
        const { data: result } = await this.$http.post('roles', this.addForm)
        if (result.meta.status !== 201) {
          return this.$message.error('添加角色失败！')
        }
        this.$message.success('添加角色成功！')
        this.addDialogVisible = false
        this.getRolesList()
      })
    },

    // 添加角色对话框关闭时，重置表单
    editDialogClosed () {
      this.$refs.editFormRef.resetFields()
    },

    // 点击编辑按钮，修改用户信息
    async showEditDialog (id) {
      // console.log(id)
      const { data: result } = await this.$http.get('roles/' + id)
      if (result.meta.status !== 200) {
        return this.$message.error('获取角色信息失败！')
      }
      this.editForm = result.data
      // console.log(this.editForm)
      this.editDialogVisible = true
    },

    // 点击确定按钮，确认修改的角色信息
    editRoleInfo () {
      // 表单预验证
      this.$refs.editFormRef.validate(async valid => {
        if (!valid) {
          // console.log('表单预验证错误')
          return this.$message.error('修改角色信息失败！')
        }
        // 发起修改角色信息的网络请求
        const { data: result } = await this.$http.put('roles/' + this.editForm.roleId, {
          roleName: this.editForm.roleName,
          roleDesc: this.editForm.roleDesc
        })
        if (result.meta.status !== 200) {
          return this.$message.error('修改角色信息失败！')
        }
        this.$message.success('修改角色信息成功！')
        this.editDialogVisible = false
        this.getRolesList()
      })
    },

    // 点击删除按钮，删除id角色信息
    async removeRoleById (id) {
      // 弹框询问用户是否删除数据
      const confirmResult = await this.$confirm('此操作将永久删除该角色, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(err => err)
      if (confirmResult === 'cancel') {
        return this.$message.info('已取消删除')
      }
      // 发出删除角色的网络请求，请求方式为delete
      const { data: result } = await this.$http.delete('roles/' + id)
      if (result.meta.status !== 200) {
        return this.$message.error('删除用户失败！')
      }
      this.$message.success('删除用户成功！')
      // 刷新角色列表
      this.getRolesList()
    },

    // 点击标签上的×，删除权限
    async removeRightById (role, rightId) {
      // 弹框询问用户是否删除权限
      const confirmResult = await this.$confirm('此操作将永久删除该权限, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(err => err)
      if (confirmResult === 'cancel') {
        return this.$message.info('已取消删除')
      }
      const { data: result } = await this.$http.delete('roles/' + role.id + '/rights/' + rightId)
      if (result.meta.status !== 200) {
        return this.$message.error('删除权限失败！')
      }
      this.$message.success('删除权限成功！')
      // this.getRolesList()
      // 获取角色列表的函数会刷新整个页面
      // 而上面的delete请求的返回值已经包含了最新的权限数据
      // 把返回值的数据直接赋值给role.children可以避免每次删除权限都重新刷新页面
      role.children = result.data
    },

    // 展示分配权限对话框
    async showSetRightDialog (role) {
      const { data: result } = await this.$http.get('rights/tree')
      if (result.meta.status !== 200) {
        return this.$message.error('获取权限列表失败！')
      }
      this.rightList = result.data
      // console.log(this.rightList)
      // 获取所有的三级权限id
      this.roleId = role.id
      this.getLeafKeys(role, this.defKeys)
      this.setRightDialogVisible = true
    },

    // 通过递归的形式，获取当前角色下所有三级权限的id，并保存到defKeys数组中
    getLeafKeys (node, arr) {
      // 如果当前节点没有孩子，则对应的权限为当前角色下的三级权限，把id push到数组中
      if (!node.children) {
        return arr.push(node.id)
      }
      // 如果有孩子节点，则递归调用该函数，直到把当前角色下所有的三级权限的id都push到数组中
      node.children.forEach(item => {
        this.getLeafKeys(item, arr)
      })
    },

    // 关闭分配权限对话框时，重置defKeys数组
    setRightDialogClosed () {
      this.defKeys = []
    },

    // 点击确定按钮，为当前角色分配权限
    async allotRights () {
      // 获取当前角色下的所有选中和半选中的权限节点的id
      const keys = [
        // 使用展开运算符...来把id展开放到keys中
        ...this.$refs.treeRef.getCheckedKeys(),
        ...this.$refs.treeRef.getHalfCheckedKeys()
      ]
      // 以逗号分隔权限对应的id
      const idStr = keys.join(',')
      // 发起post请求
      const { data: result } = await this.$http.post('roles/' + this.roleId + '/rights', { rids: idStr })
      if (result.meta.status !== 200) {
        return this.$message.error('分配权限失败！')
      }
      this.$message.success('分配权限成功！')
      this.getRolesList()
      this.setRightDialogVisible = false
    }
  }
}
</script>

<style scoped>
  .el-tag {
    margin: 7px;
  }

  .bdtop {
    border-top: 1px solid #eee;
  }

  .bdbottom {
    border-bottom: 1px solid #eee;
  }

  .vcenter {
    display: flex;
    align-items: center;
  }
</style>
