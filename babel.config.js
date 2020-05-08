// 项目发布时需要使用的 babel 插件数组
const prodPlugins = []
// 获取当前的编译模式，如果编译模式为production时，把插件push到数组中
if (process.env.NODE_ENV === 'production') {
  prodPlugins.push('transform-remove-console')
}

module.exports = {
  presets: [
    '@vue/cli-plugin-babel/preset'
  ],
  plugins: [
    [
      'component',
      {
        libraryName: 'element-ui',
        styleLibraryName: 'theme-chalk'
      }
    ],
    // 发布时的插件数组
    ...prodPlugins,
    '@babel/plugin-syntax-dynamic-import'
  ]
}
