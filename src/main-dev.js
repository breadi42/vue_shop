import Vue from 'vue'
import App from './App.vue'
import router from './router'
import './plugins/element.js'
// 导入全局样式表
import './assets/css/global.css'
// 导入字体图标
import './assets/fonts/iconfont.css'
// 树形表格组件
import TreeTable from 'vue-table-with-tree-grid'

// 导入富文本编辑器
import VueQuillEditor from 'vue-quill-editor'
// 导入富文本编辑器对应的样式
import 'quill/dist/quill.core.css' // import styles
import 'quill/dist/quill.snow.css' // for snow theme
import 'quill/dist/quill.bubble.css' // for bubble theme

// 导入Nprogress进度条
import NProgress from 'nprogress'
// 导入对应的css样式表
import 'nprogress/nprogress.css'

// axios通信
import axios from 'axios'
// 配置请求的根路径
axios.defaults.baseURL = 'http://timemeetyou.com:8889/api/private/v1/'
// axios请求拦截
// 在request拦截器中显示进度条 NProgress.start()
axios.interceptors.request.use(config => {
  // 在return之前展示进度条
  NProgress.start()
  // 为请求头对象添加token验证的Authorization字段
  config.headers.Authorization = window.sessionStorage.getItem('token')
  return config
})
// 在response拦截器中隐藏进度条 NProgress.done()
axios.interceptors.response.use(config => {
  // 在return之前隐藏进度条
  NProgress.done()
  return config
})
Vue.prototype.$http = axios

Vue.config.productionTip = false

Vue.component('tree-table', TreeTable)
// 将富文本编辑器注册为全局可用的组件
Vue.use(VueQuillEditor)

// 接受一个时间戳，返回时间
Vue.filter('dateFormat', function (originVal) {
  // new一个Date对象
  const date = new Date(originVal)
  // 年
  const year = date.getFullYear()
  // 月，通过从后面连接一个空字符串，把date.getMonth()转换为字符串，当字符串的长度不足2时，前面补‘0’
  const mouth = (date.getMonth() + '').padStart(2, '0')
  // 日
  const day = (date.getDate() + '').padStart(2, '0')
  // 时
  const hours = (date.getHours() + '').padStart(2, '0')
  // 分
  const minutes = (date.getMinutes() + '').padStart(2, '0')
  // 秒
  const seconds = (date.getSeconds() + '').padStart(2, '0')
  return `${year}-${mouth}-${day} ${hours}:${minutes}:${seconds}`
})

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
