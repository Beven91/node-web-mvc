
export default {
  /**
   * 格式化模板字符串
   * @param template 模板字符串
   * @param data 数据
   * @returns
   */
  format(template: string, data: Record<string, any>) {
    if (data && template) {
      template = template.replace(/(\{(\d|\w)+\})/g, function(a) {
        return data[a.replace(/\{|\}/g, '')];
      });
    }
    return template;
  },

  isEmpty(v: any) {
    return v === null || v === undefined || v === '';
  },
};
