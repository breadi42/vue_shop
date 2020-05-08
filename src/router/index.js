import Vue from 'vue'
import VueRouter from 'vue-router'

// import Login from '../components/Login'
// import Home from '../components/Home'
// import Welcome from '../components/Welcome'
// 路由懒加载
const Login = () => import(/* webpackChunkName: "login_home_welcome" */ '../components/Login')
const Home = () => import(/* webpackChunkName: "login_home_welcome" */ '../components/Home')
const Welcome = () => import(/* webpackChunkName: "login_home_welcome" */ '../components/Welcome')

// import Users from '../components/user/Users'
// import Rights from '../components/power/Rights'
// import Roles from '../components/power/Roles'
const Users = () => import(/* webpackChunkName: "users_rights_roles" */ '../components/user/Users')
const Rights = () => import(/* webpackChunkName: "users_rights_roles" */ '../components/power/Rights')
const Roles = () => import(/* webpackChunkName: "users_rights_roles" */ '../components/power/Roles')

// import Cate from '../components/goods/Cate'
// import Params from '../components/goods/Params'
const Cate = () => import(/* webpackChunkName: "cate_params" */ '../components/goods/Cate')
const Params = () => import(/* webpackChunkName: "cate_params" */ '../components/goods/Params')

// import List from '../components/goods/List'
// import Add from '../components/goods/Add'
const List = () => import(/* webpackChunkName: "list_add" */ '../components/goods/List')
const Add = () => import(/* webpackChunkName: "list_add" */ '../components/goods/Add')

// import Order from '../components/order/Order'
// import Report from '../components/report/Report'
const Order = () => import(/* webpackChunkName: "order_report" */ '../components/order/Order')
const Report = () => import(/* webpackChunkName: "order_report" */ '../components/report/Report')

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    redirect: '/login'
  },
  {
    path: '/login',
    component: Login
  },
  {
    path: '/home',
    component: Home,
    redirect: '/welcome',
    children: [
      { path: '/welcome', component: Welcome },
      { path: '/users', component: Users },
      { path: '/roles', component: Roles },
      { path: '/rights', component: Rights },
      { path: '/categories', component: Cate },
      { path: '/params', component: Params },
      { path: '/goods', component: List },
      { path: '/goods/add', component: Add },
      { path: '/orders', component: Order },
      { path: '/reports', component: Report }
    ]
  }
]

const router = new VueRouter({
  routes
})

// 路由导航守卫
// to 将要访问的路径
// from 从哪个路径转过来
// next 是一个函数，next()表示放行，next('/xxx')表示强制跳转到某个页面
router.beforeEach((to, from, next) => {
  if (to.path === '/login') return next()
  // 获取token
  const tokenStr = window.sessionStorage.getItem('token')
  if (!tokenStr) return next('/login')
  next()
})

export default router
