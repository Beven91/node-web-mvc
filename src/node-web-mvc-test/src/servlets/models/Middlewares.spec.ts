import Middlewares from '../../../../node-web-mvc/src/servlets/models/Middlewares';
import HttpServletRequest from '../../../../node-web-mvc/src/servlets/http/HttpServletRequest';
import HttpServletResponse from '../../../../node-web-mvc/src/servlets/http/HttpServletResponse';
import { Middleware } from '../../../../node-web-mvc/src/interface/declare';

function makeCtx() {
  const req = { nativeRequest: {} as any } as HttpServletRequest;
  const resp = { nativeResponse: {} as any } as HttpServletResponse;
  return { req, resp };
}

describe('Middlewares', () => {
  it('没有中间件时直接调用 fallback', async() => {
    const { req, resp } = makeCtx();
    const mw = new Middlewares([]);
    const result = await mw.execute<string>(req, resp, () => 'fallback');
    expect(result).toBe('fallback');
  });

  it('没有 fallback 执行 resolve undefined', async() => {
    const { req, resp } = makeCtx();
    const mw = new Middlewares([]);
    const result = await mw.execute(req, resp);
    expect(result).toBeUndefined();
  });

  it('单个中间件', async() => {
    const { req, resp } = makeCtx();
    const order: string[] = [];
    const middleware: Middleware = (r, s, next) => {
      order.push('mw');
      next();
    };
    const mw = new Middlewares([ middleware ]);
    const result = await mw.execute<string>(req, resp, () => {
      order.push('fallback');
      return 'done';
    });
    expect(result).toBe('done');
    expect(order).toEqual([ 'mw', 'fallback' ]);
  });

  it('多个中间件顺序执行（洋葱模型）', async() => {
    const { req, resp } = makeCtx();
    const order: string[] = [];
    const m1: Middleware = (r, s, next) => {
      order.push('m1-before');
      next();
      order.push('m1-after');
    };
    const m2: Middleware = (r, s, next) => {
      order.push('m2-before');
      next();
      order.push('m2-after');
    };
    const mw = new Middlewares([ m1, m2 ]);
    const result = await mw.execute<string>(req, resp, () => {
      order.push('fallback');
      return 'done';
    });
    expect(result).toBe('done');
    expect(order).toEqual([ 'm1-before', 'm2-before', 'fallback', 'm2-after', 'm1-after' ]);
  });

  it('中间件 next 传 error 时 reject', async() => {
    const { req, resp } = makeCtx();
    const err = new Error('fail');
    const middleware: Middleware = (r, s, next) => {
      next(err);
    };
    const mw = new Middlewares([ middleware ]);
    await expect(mw.execute(req, resp, () => 'done')).rejects.toBe(err);
  });

  it('中间件抛异常时 reject', async() => {
    const { req, resp } = makeCtx();
    const err = new Error('throw');
    const middleware: Middleware = () => {
      throw err;
    };
    const mw = new Middlewares([ middleware ]);
    await expect(mw.execute(req, resp, () => 'done')).rejects.toBe(err);
  });
});
