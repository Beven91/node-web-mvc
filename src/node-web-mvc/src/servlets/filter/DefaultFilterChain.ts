import HttpServletRequest from '../http/HttpServletRequest';
import HttpServletResponse from '../http/HttpServletResponse';
import Filter from './Filter';
import FilterChain from './FilterChain';

export default class DefaultFilterChain implements FilterChain {
  private readonly filters: Filter[];

  private nextIndex: number;

  public doFilter: FilterChain['doFilter'];

  private createDefer() {
    const runtime = { promise: null, resolve: null, reject: null };
    runtime.promise = new Promise((resolve, reject) => {
      runtime.resolve = resolve;
      runtime.reject = reject;
    });
    return runtime;
  }

  constructor(filters: Filter[]) {
    this.filters = filters;
    this.nextIndex = 0;
    this.doFilter = this.internalDoFilter;
  }

  async internalDoFilter(request: HttpServletRequest, response: HttpServletResponse): Promise<void> {
    const filter = this.filters[this.nextIndex];
    this.nextIndex++;
    const defer = this.createDefer();
    this.doFilter = (request: HttpServletRequest, response: HttpServletResponse) => {
      defer.resolve(this.internalDoFilter(request, response));
      return defer.promise;
    };
    if (filter?.doFilter) {
      await filter.doFilter(request, response, this);
      // 用于解决，在filter中执行chain.doFilter时不用进行return promise连接
      await defer.promise;
    }
    // 没有doFilter 则直接返回
  }
}
