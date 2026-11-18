import ResponseEntity from '../../../../node-web-mvc/src/servlets/models/ResponseEntity';
import HttpEntity from '../../../../node-web-mvc/src/servlets/models/HttpEntity';
import HttpStatus from '../../../../node-web-mvc/src/servlets/http/HttpStatus';
import MediaType from '../../../../node-web-mvc/src/servlets/http/MediaType';
import CacheControl from '../../../../node-web-mvc/src/servlets/http/CacheControl';
import HttpHeaders from '../../../../node-web-mvc/src/servlets/http/HttpHeaders';

describe('HttpEntity', () => {
  describe('构造', () => {
    it('构造后 body/headers 正确', () => {
      const entity = new HttpEntity('data', { 'x-foo': 'bar' });
      expect(entity.body).toBe('data');
      expect(entity.headers['x-foo']).toBe('bar');
    });

    it('不传 headers 时为空对象', () => {
      const entity = new HttpEntity('data', undefined);
      expect(entity.headers).toEqual({});
    });

    it('body 可以为 null', () => {
      const entity = new HttpEntity(null, {});
      expect(entity.body).toBeNull();
    });
  });

  describe('链式方法', () => {
    it('setBody', () => {
      const entity = new HttpEntity('', {});
      entity.setBody('new body');
      expect(entity.body).toBe('new body');
      expect(entity.setBody('x')).toBe(entity);
    });

    it('setHeaders', () => {
      const entity = new HttpEntity(null, {});
      entity.setHeaders({ a: '1' });
      expect((entity.headers as any).a).toBe('1');
    });

    it('setHeader — 多值 join', () => {
      const entity = new HttpEntity(null, {});
      entity.setHeader('X-Custom', 'a', 'b');
      expect(entity.headers['X-Custom']).toBe('a,b');
    });

    it('setAllow', () => {
      const entity = new HttpEntity(null, {});
      entity.setAllow([ 'GET', 'POST' ]);
      expect(entity.headers[HttpHeaders.ALLOW]).toBe('GET,POST');
    });

    it('setETag', () => {
      const entity = new HttpEntity(null, {});
      entity.setETag('"abc123"');
      expect(entity.headers[HttpHeaders.ETAG]).toBe('"abc123"');
    });

    it('setLastModified', () => {
      const entity = new HttpEntity(null, {});
      const d = new Date('2024-01-15T00:00:00Z');
      entity.setLastModified(d);
      expect(entity.headers[HttpHeaders.LAST_MODIFIED]).toBe(d.toUTCString());
    });

    it('setLocation', () => {
      const entity = new HttpEntity(null, {});
      entity.setLocation('/new-location');
      expect(entity.headers[HttpHeaders.LOCATION]).toBe('/new-location');
    });

    it('setCacheControl', () => {
      const entity = new HttpEntity(null, {});
      const cc = new CacheControl({ maxAge: 3600 });
      entity.setCacheControl(cc);
      expect(entity.headers[HttpHeaders.CACHE_CONTROL]).toBe(cc.toString());
    });

    it('setCacheControl null 不设置', () => {
      const entity = new HttpEntity(null, {});
      entity.setCacheControl(null as any);
      expect(entity.headers[HttpHeaders.CACHE_CONTROL]).toBeUndefined();
    });

    it('setVaryBy', () => {
      const entity = new HttpEntity(null, {});
      entity.setVaryBy([ 'User-Agent', 'Cookie' ]);
      expect(entity.headers[HttpHeaders.VARY]).toBe('User-Agent,Cookie');
    });

    it('setContentLength', () => {
      const entity = new HttpEntity(null, {});
      entity.setContentLength(1024);
      expect(entity.headers[HttpHeaders.CONTENT_LENGTH]).toBe(1024);
    });

    it('setContentType', () => {
      const entity = new HttpEntity(null, {});
      entity.setContentType(MediaType.APPLICATION_JSON);
      expect(entity.headers[HttpHeaders.CONTENT_TYPE]).toBe('application/json');
    });

    it('build — 将 body 置 null', () => {
      const entity = new HttpEntity('data', {});
      entity.build();
      expect(entity.body).toBeNull();
    });
  });
});

describe('ResponseEntity', () => {
  describe('静态工厂', () => {
    it('status 构造', () => {
      const entity = ResponseEntity.status(HttpStatus.NOT_FOUND);
      expect(entity.responseStatus).toBe(HttpStatus.NOT_FOUND);
      expect(entity.body).toBeNull();
    });

    it('ok 构造', () => {
      const entity = ResponseEntity.ok();
      expect(entity.responseStatus).toBe(HttpStatus.OK);
      expect(entity.body).toBeNull();
    });
  });

  describe('构造', () => {
    it('data + headers + status', () => {
      const entity = new ResponseEntity({ id: 1 }, { 'x-foo': 'bar' }, HttpStatus.CREATED);
      expect(entity.body).toEqual({ id: 1 });
      expect(entity.responseStatus).toBe(HttpStatus.CREATED);
      expect(entity.headers['x-foo']).toBe('bar');
    });

    it('仅 status (data 是 HttpStatus 实例)', () => {
      const entity = new ResponseEntity(HttpStatus.NOT_FOUND);
      expect(entity.responseStatus).toBe(HttpStatus.NOT_FOUND);
      expect(entity.body).toBeNull();
    });

    it('继承 HttpEntity 方法可用', () => {
      const entity = ResponseEntity.ok()
        .setETag('"tag"')
        .setContentType(MediaType.APPLICATION_JSON)
        .setBody({ result: true });
      expect(entity.body).toEqual({ result: true });
      expect(entity.headers[HttpHeaders.ETAG]).toBe('"tag"');
      expect(entity.headers[HttpHeaders.CONTENT_TYPE]).toBe('application/json');
    });
  });
});
