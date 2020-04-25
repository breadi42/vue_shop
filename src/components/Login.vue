<template>
  <div class="login_container">
    <div class="login_box">
      <!-- 头像区域 -->
      <div class="avatar_box">
        <img src="../assets/logo.png" alt="">
      </div>
      <!-- 登录表单区域 -->
      <el-form :model="loginForm" :rules="loginFormRules" ref="loginFormRef" label-width="0px" class="login_form">
        <!-- 用户名 -->
        <el-form-item prop="username">
          <el-input v-model="loginForm.username" prefix-icon="iconfont icon-user"></el-input>
        </el-form-item>
        <!-- 密码 -->
        <el-form-item prop="password">
          <el-input v-model="loginForm.password" prefix-icon="iconfont icon-password" type="password"></el-input>
        </el-form-item>
        <!-- 按钮 -->
        <el-form-item class="buttons">
          <el-button type="primary" @click="login">登录</el-button>
          <el-button type="info" @click="loginFormRef">重置</el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script>
  export default {
    name: 'Login',
    data () {
      return {
        // 登录表单的数据绑定对象
        loginForm: {
          username: 'admin',
          password: '123456'
        },
        // 验证表单
        loginFormRules: {
          // 验证用户名
          username: [
            {
              required: true,
              message: '请输入用户名',
              trigger: 'blur'
            },
            {
              min: 3,
              max: 8,
              message: '长度在 3 到 8 个字符',
              trigger: 'blur'
            }
          ],
          // 验证密码
          password: [
            {
              required: true,
              message: '请输入密码',
              trigger: 'blur'
            },
            {
              min: 6,
              max: 16,
              message: '长度在 6 到 16 个字符',
              trigger: 'blur'
            }
          ]
        }
      }
    },
    methods: {
      // 重置登录表单
      loginFormRef () {
        this.$refs.loginFormRef.resetFields()
      },
      // 登录按钮
      login () {
        this.$refs.loginFormRef.validate(async (valid) => {
          if (!valid) {
            return false
          }
          // 解构复制出一个data对象，重命名为result
          const { data: result } = await this.$http.post('login', this.loginForm)
          if (result.meta.status !== 200) {
            // 使用$message来获得element的弹窗
            return this.$message.error('登录失败！')
          }
          this.$message.success('登录成功！')
          // 1. 将登录成功后的 token ，保存到客户端的 sessionStorage 中
          // 1.1 项目中出现了登录之外的其他API接口，必须在登录之后才能访问
          // 1.2 token 只应在当前网站打开期间生效，所以将 token 保存在 sessionStorage 中
          window.sessionStorage.setItem('token', result.data.token)
          // 2. 通过编程式导航跳到后台主页，路由地址是 /home
          this.$router.push('/home')
        })
      }
    }
  }
</script>

<style lang="less" scoped>
  .login_container {
    background-color: #2b4b6b;
    height: 100%;
  }

  .login_box {
    width: 450px;
    height: 300px;
    background-color: white;
    border-radius: 5px;
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
  }

  .avatar_box {
    width: 130px;
    height: 130px;
    border: 1px solid #eee;
    border-radius: 50%;
    padding: 10px;
    box-shadow: 0 0 10px #ddd;
    position: absolute;
    left: 50%;
    transform: translate(-50%, -50%);
    background-color: white;

    img {
      width: 100%;
      height: 100%;
      border-radius: 50%;
      background-color: #eee;
    }
  }

  .login_form {
    position: absolute;
    bottom: 0;
    width: 100%;
    padding: 0 20px;
    box-sizing: border-box;
  }

  .buttons {
    display: flex;
    justify-content: center;
  }
</style>
