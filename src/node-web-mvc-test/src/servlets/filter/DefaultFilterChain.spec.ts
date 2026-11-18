import DefaultFilterChain from '../../../../node-web-mvc/src/servlets/filter/DefaultFilterChain';
import Filter from '../../../../node-web-mvc/src/servlets/filter/Filter';
import HttpServletRequest from '../../../../node-web-mvc/src/servlets/http/HttpServletRequest';
import HttpServletResponse from '../../../../node-web-mvc/src/servlets/http/HttpServletResponse';
import FilterChain from '../../../../node-web-mvc/src/servlets/filter/FilterChain';

class NoopFilter extends Filter {
  calls: string[] = [];
  async doFilter(req: HttpServletRequest, res: HttpServletResponse, chain: FilterChain) {
    this.calls.push('filter');
    await chain.doFilter(req, res);
    this.calls.push('after');
  }
}

function makeCtx() {
  return {
    request: {} as HttpServletRequest,
    response: {} as HttpServletResponse,
  };
}

describe('DefaultFilterChain', () => {
  it('无 filter 时直接 resolve', async() => {
    const chain = new DefaultFilterChain([]);
    await expect(chain.doFilter(makeCtx().request, makeCtx().response)).resolves.toBeUndefined();
  });

  it('顺序执行单个 filter', async() => {
    const filter = new NoopFilter();
    const chain = new DefaultFilterChain([ filter ]);
    await chain.doFilter(makeCtx().request, makeCtx().response);
    expect(filter.calls).toEqual([ 'filter', 'after' ]);
  });

  it('顺序执行多个 filter', async() => {
    const f1 = new NoopFilter();
    const f2 = new NoopFilter();
    const chain = new DefaultFilterChain([ f1, f2 ]);
    await chain.doFilter(makeCtx().request, makeCtx().response);
    expect(f1.calls).toEqual([ 'filter', 'after' ]);
    expect(f2.calls).toEqual([ 'filter', 'after' ]);
  });

  it('filter 不调用 chain.doFilter 时 Promise 挂起（符合预期）', async() => {
    class ShortCircuitFilter extends Filter {
      async doFilter(req: HttpServletRequest, res: HttpServletResponse, chain: FilterChain) {
        // 不调用 chain.doFilter——defer.promise 永远不会 resolve
        // 这是框架设计要求 filter 最终必须调用 chain.doFilter
      }
    }
    const chain = new DefaultFilterChain([ new ShortCircuitFilter() ]);
    // 断言 timeout——chain 会永远挂起
    const result = Promise.race([
      chain.doFilter(makeCtx().request, makeCtx().response).then(() => 'resolved'),
      new Promise((r) => setTimeout(() => r('timeout'), 200)),
    ]);
    await expect(result).resolves.toBe('timeout');
  }, 5000);

  it('多次调用 doFilter 触发 index 递增', async() => {
    const f1 = new NoopFilter();
    const f2 = new NoopFilter();
    const chain = new DefaultFilterChain([ f1, f2 ]);
    await chain.doFilter(makeCtx().request, makeCtx().response);
    // 每个 filter 只执行一次
    expect(f1.calls).toHaveLength(2);
    expect(f2.calls).toHaveLength(2);
  });
});
