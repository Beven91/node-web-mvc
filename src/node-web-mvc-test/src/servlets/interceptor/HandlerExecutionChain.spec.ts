import HandlerExecutionChain from '../../../../node-web-mvc/src/servlets/interceptor/HandlerExecutionChain';
import HandlerInterceptor from '../../../../node-web-mvc/src/servlets/interceptor/HandlerInterceptor';
import ServletContext from '../../../../node-web-mvc/src/servlets/http/ServletContext';

class RecordingInterceptor extends HandlerInterceptor {
  calls: string[] = [];
  preResult = true;

  preHandle() {
    this.calls.push('pre');
    return this.preResult;
  }

  postHandle() {
    this.calls.push('post');
  }

  afterCompletion() {
    this.calls.push('after');
  }
}

function makeContext() {
  return {
    request: {},
    response: {},
  } as unknown as ServletContext;
}

describe('HandlerExecutionChain', () => {
  const handler = { name: 'handler' };

  describe('拦截器管理', () => {
    it('构造时无拦截器', () => {
      const chain = new HandlerExecutionChain(handler, makeContext());
      expect(chain.getInterceptors()).toEqual([]);
      expect(chain.getHandler()).toBe(handler);
    });

    it('addInterceptor 追加到末尾', () => {
      const chain = new HandlerExecutionChain(handler, makeContext());
      const a = new RecordingInterceptor();
      const b = new RecordingInterceptor();
      chain.addInterceptor(a, b);
      expect(chain.getInterceptors()).toEqual([ a, b ]);
    });

    it('addInterceptor2 插入到指定下标', () => {
      const chain = new HandlerExecutionChain(handler, makeContext());
      const a = new RecordingInterceptor();
      const b = new RecordingInterceptor();
      const c = new RecordingInterceptor();
      chain.addInterceptor(a, c);
      chain.addInterceptor2(1, b);
      expect(chain.getInterceptors()).toEqual([ a, b, c ]);
    });

    it('setInterceptors 覆盖', () => {
      const chain = new HandlerExecutionChain(handler, makeContext());
      const a = new RecordingInterceptor();
      chain.setInterceptors([ a ]);
      expect(chain.getInterceptors()).toEqual([ a ]);
    });
  });

  describe('applyPreHandle', () => {
    it('无拦截器返回 true', async() => {
      const chain = new HandlerExecutionChain(handler, makeContext());
      await expect(chain.applyPreHandle()).resolves.toBe(true);
    });

    it('顺序执行 preHandle', async() => {
      const chain = new HandlerExecutionChain(handler, makeContext());
      const a = new RecordingInterceptor();
      const b = new RecordingInterceptor();
      chain.addInterceptor(a, b);
      const result = await chain.applyPreHandle();
      expect(result).toBe(true);
      expect(a.calls).toEqual([ 'pre' ]);
      expect(b.calls).toEqual([ 'pre' ]);
    });

    it('拦截器返回 false 中断后续', async() => {
      const chain = new HandlerExecutionChain(handler, makeContext());
      const a = new RecordingInterceptor();
      const b = new RecordingInterceptor();
      a.preResult = false;
      chain.addInterceptor(a, b);
      const result = await chain.applyPreHandle();
      expect(result).toBe(false);
      expect(a.calls).toEqual([ 'pre' ]);
      expect(b.calls).toEqual([]);
    });

    it('preHandle 返回 Promise', async() => {
      const chain = new HandlerExecutionChain(handler, makeContext());
      const a = new RecordingInterceptor();
      let resolved = false;
      a.preHandle = (async() => {
        await Promise.resolve();
        resolved = true;
        return true;
      }) as any;
      chain.addInterceptor(a);
      await expect(chain.applyPreHandle()).resolves.toBe(true);
      expect(resolved).toBe(true);
    });
  });

  describe('applyPostHandle', () => {
    it('倒序执行 postHandle', async() => {
      const chain = new HandlerExecutionChain(handler, makeContext());
      const order: string[] = [];
      const a = new RecordingInterceptor();
      const b = new RecordingInterceptor();
      const origPostA = a.postHandle.bind(a) as Function;
      const origPostB = b.postHandle.bind(b) as Function;
      a.postHandle = (...args: any[]) => {
        origPostA(...args); order.push('a');
      };
      b.postHandle = (...args: any[]) => {
        origPostB(...args); order.push('b');
      };
      chain.addInterceptor(a, b);
      const result = { ok: true };
      await chain.applyPostHandle(result);
      expect(b.calls).toContain('post');
      expect(a.calls).toContain('post');
      // 倒序: b 先于 a
      expect(order).toEqual([ 'b', 'a' ]);
    });
  });

  describe('applyAfterCompletion', () => {
    it('按 interceptorIndex 倒序执行', async() => {
      const chain = new HandlerExecutionChain(handler, makeContext());
      const a = new RecordingInterceptor();
      const b = new RecordingInterceptor();
      chain.addInterceptor(a, b);
      await chain.applyPreHandle();
      await chain.applyAfterCompletion(null);
      expect(a.calls).toContain('after');
      expect(b.calls).toContain('after');
    });
  });
});
