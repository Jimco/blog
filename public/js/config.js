seajs.config({
  alias: {
    'main': location.search.indexOf('debug') > -1 ? 'src/main' : 'dist/main'
  }
});

// 加载入口模块
seajs.use('main');