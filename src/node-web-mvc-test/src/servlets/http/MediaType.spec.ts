import MediaType from '../../../../node-web-mvc/src/servlets/http/MediaType';

describe('MediaType', () => {
  describe('构造', () => {
    it('字符串解析 type/subtype', () => {
      const mt = new MediaType('text/html');
      expect(mt.type).toBe('text');
      expect(mt.subtype).toBe('html');
      expect(mt.name).toBe('text/html');
    });

    it('带参数解析', () => {
      const mt = new MediaType('application/json;charset=utf-8');
      expect(mt.type).toBe('application');
      expect(mt.parameters.charset).toBe('utf-8');
    });

    it('多参数构造', () => {
      const mt = new MediaType('text', 'plain', { charset: 'utf-8' });
      expect(mt.name).toBe('text/plain');
      expect(mt.parameters.charset).toBe('utf-8');
    });
  });

  describe('静态常量', () => {
    it('APPLICATION_JSON', () => {
      expect(MediaType.APPLICATION_JSON.name).toBe('application/json');
    });

    it('TEXT_HTML', () => {
      expect(MediaType.TEXT_HTML.name).toBe('text/html');
    });

    it('ALL 通配符', () => {
      expect(MediaType.ALL.type).toBe('*');
      expect(MediaType.ALL.isWildcardType).toBe(true);
    });

    it('MULTIPART_FORM_DATA', () => {
      expect(MediaType.MULTIPART_FORM_DATA.name).toBe('multipart/form-data');
    });
  });

  describe('isCompatibleWith', () => {
    it('完全匹配返回 true', () => {
      expect(MediaType.TEXT_HTML.isCompatibleWith(MediaType.TEXT_HTML)).toBe(true);
    });

    it('通配符 type 匹配任意', () => {
      expect(MediaType.ALL.isCompatibleWith(MediaType.TEXT_HTML)).toBe(true);
      expect(MediaType.TEXT_HTML.isCompatibleWith(MediaType.ALL)).toBe(true);
    });

    it('不同 type 不匹配', () => {
      expect(MediaType.TEXT_HTML.isCompatibleWith(MediaType.APPLICATION_JSON)).toBe(false);
    });

    it('通配符 subtype 匹配', () => {
      const wildcard = new MediaType('text', '*');
      expect(wildcard.isCompatibleWith(MediaType.TEXT_HTML)).toBe(true);
    });

    it('null 不匹配', () => {
      expect(MediaType.TEXT_HTML.isCompatibleWith(null)).toBe(false);
    });

    it('application/*+json 匹配 application/json', () => {
      const wildcard = new MediaType('application', '*+json');
      expect(wildcard.isCompatibleWith(MediaType.APPLICATION_JSON)).toBe(true);
    });
  });

  describe('specificityCompare', () => {
    it('具体优先于通配符 type', () => {
      expect(MediaType.specificityCompare(MediaType.ALL, MediaType.TEXT_HTML)).toBe(1);
      expect(MediaType.specificityCompare(MediaType.TEXT_HTML, MediaType.ALL)).toBe(-1);
    });

    it('参数多的更具体', () => {
      const basic = new MediaType('text', 'html');
      const withParam = new MediaType('text', 'html', { version: '1' });
      expect(MediaType.specificityCompare(basic, withParam)).toBe(1);
    });

    it('相同类型得分 0', () => {
      expect(MediaType.specificityCompare(MediaType.APPLICATION_JSON, MediaType.APPLICATION_JSON)).toBe(0);
    });
  });

  describe('copyQualityValue', () => {
    it('复制 q 参数', () => {
      const source = new MediaType('application/json;q=0.8');
      const target = new MediaType('application/json');
      const result = target.copyQualityValue(source);
      expect(result.parameters['q']).toBe('0.8');
    });

    it('源无 q 返回自身', () => {
      const result = MediaType.APPLICATION_JSON.copyQualityValue(MediaType.APPLICATION_JSON);
      expect(result).toBe(MediaType.APPLICATION_JSON);
    });
  });

  describe('charset', () => {
    it('默认 utf-8', () => {
      expect(MediaType.APPLICATION_JSON.charset).toBe('utf-8');
    });

    it('明确指定后返回指定值', () => {
      const mt = new MediaType('text/html;charset=iso-8859-1');
      expect(mt.charset).toBe('iso-8859-1');
    });
  });

  describe('isEmpty', () => {
    it('空 type 返回 true', () => {
      expect(new MediaType('').isEmpty()).toBe(true);
    });

    it('有 type 返回 false', () => {
      expect(MediaType.TEXT_HTML.isEmpty()).toBe(false);
    });
  });

  describe('isConcrete', () => {
    it('具体类型为 true', () => {
      expect(MediaType.APPLICATION_JSON.isConcrete).toBe(true);
    });

    it('通配符为 false', () => {
      expect(MediaType.ALL.isConcrete).toBe(false);
    });
  });
});
