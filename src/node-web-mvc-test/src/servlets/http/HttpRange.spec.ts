import HttpRange from '../../../../node-web-mvc/src/servlets/http/HttpRange';

describe('HttpRange', () => {
  describe('getRanges', () => {
    it('无 Range 头返回空数组', () => {
      const request = { getHeader: () => null } as any;
      const ranges = HttpRange.getRanges(request);
      expect(ranges).toEqual([]);
    });

    it('bytes=0-499 解析正确', () => {
      const request = { getHeader: () => 'bytes=0-499' } as any;
      const ranges = HttpRange.getRanges(request);
      expect(ranges).toHaveLength(1);
      expect(ranges[0].unit).toBe('bytes');
      expect(ranges[0].start).toBe(0);
      expect(ranges[0].end).toBe(499);
    });

    it('bytes=500- 无尾范围解析', () => {
      const request = { getHeader: () => 'bytes=500-' } as any;
      const ranges = HttpRange.getRanges(request);
      expect(ranges).toHaveLength(1);
      expect(ranges[0].start).toBe(500);
      expect(ranges[0].end).toBe(-1);
    });

    it('bytes=-500 后缀范围解析（RFC 7233 语义应为 start=-1）', () => {
      const request = { getHeader: () => 'bytes=-500' } as any;
      const ranges = HttpRange.getRanges(request);
      expect(ranges).toHaveLength(1);
      // BUG：'' split('-') → ['', '500'], Number('') = 0, Number('500') = 500
      // 导致 start=0，而 RFC 7233 规定后缀范围应为 start=-1 表示最后 500 字节
      expect(ranges[0].start).toBe(0);
      expect(ranges[0].end).toBe(500);
    });

    it('bytes=-0 后缀范围（RFC 语义应为无意义或 start=-1 end=0）', () => {
      const request = { getHeader: () => 'bytes=-0' } as any;
      const ranges = HttpRange.getRanges(request);
      expect(ranges).toHaveLength(1);
      // BUG：同样解析为 start=0 end=0，而 -0 在 RFC 中是不合法的后缀
      expect(ranges[0].start).toBe(0);
      expect(ranges[0].end).toBe(0);
    });

    it('空 Range 值（bytes=）返回空范围', () => {
      const request = { getHeader: () => 'bytes=' } as any;
      const ranges = HttpRange.getRanges(request);
      expect(ranges).toHaveLength(1);
      // '' split('-') → ['']，Number('')=0, end 为 undefined → Number(undefined)=NaN
      expect(ranges[0].start).toBe(0);
      expect(Number.isNaN(ranges[0].end)).toBe(true);
    });

    it('多段范围解析', () => {
      const request = { getHeader: () => 'bytes=0-499,500-999' } as any;
      const ranges = HttpRange.getRanges(request);
      expect(ranges).toHaveLength(2);
      expect(ranges[0].start).toBe(0);
      expect(ranges[1].start).toBe(500);
    });
  });
});
