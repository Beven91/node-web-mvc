const Routes = require('../src/RouteCollection');

Routes.mapRoute('api/{controller}/{action}');
Routes.mapRoute('member/hello/{action}');
Routes.mapRoute('{controller}/{action}', { controller: 'home', action: 'index' });

const testPaths = [
  { path: '/api/hello/say', result: { controller: 'hello', action: 'say' } },
  { path: '/api/hello', result: { controller: 'hello', action: '' } },
  { path: '/order/create', result: { controller: 'order', action: 'create' } },
  { path: '/', result: { controller: 'home', action: 'index' } },
  { path: '/member', result: { controller: 'member', action: 'index' } },
  { path: '/member/hello/index', result: { controller: '', action: 'index' } },
  { path: '/member/hello/index/aa', result: {  } },
]

testPaths.forEach((r) => {
  const res = Routes.match(r.path);
  if (res.action != r.result.action || res.controller != r.result.controller) {
    throw new Error(
      [
        '测试规则不匹配' + r.path,
        '预期' + JSON.stringify(r.result),
        '实际:' + JSON.stringify(res)
      ].join('\n')
    );
  }
})