import { AddressInfo, Socket } from 'net';
import WorkerInvoker, { InvokeTargetType } from './WorkerInvoker';

export interface WorkerSocketOptions {
  address: AddressInfo | {}
}

export default class WorkerSocket extends Socket {
  private readonly myAddress: AddressInfo | {};

  private invoker: WorkerInvoker;

  private type: string;

  address(): AddressInfo | {} {
    return this.myAddress || {};
  }

  constructor(port: MessagePort, type: 'requestSocket' | 'responseSocket', address?: AddressInfo | {}) {
    super();
    this.invoker = new WorkerInvoker(port);
    this.type = type;
    this.myAddress = address;
  }

  private invoke(name: string, args: any[]) {
    return this.invoker.invoke(this.type as any, name, args);
  }

  write(buffer: Uint8Array | string, cb?: (err?: Error) => void): boolean;
  write(str: Uint8Array | string, encoding?: BufferEncoding, cb?: (err?: Error) => void): boolean;
  write(str: unknown, encoding?: unknown, cb?: any): boolean {
    const newEncoding = typeof encoding == 'string' ? encoding : undefined;
    const callback = typeof encoding == 'function' ? encoding : cb;
    this.invoker.invoke('response', 'write', [ str, newEncoding ]).then(() => callback?.(), callback);
    return true;
  }

  end(cb?: () => void): this;
  end(chunk: Uint8Array | string, cb?: () => void): this;
  end(chunk: Uint8Array | string, encoding: BufferEncoding, cb?: () => void): this;
  end(chunk?: any, arg1?: any, cb?: any): this {
    let callback: () => void;
    let encoding: BufferEncoding;
    let buffer: Uint8Array | string;
    switch (arguments.length) {
      case 1:
        callback = cb;
        break;
      case 2:
        buffer = chunk;
        callback = cb;
        break;
      case 3:
        buffer = chunk;
        encoding = arg1;
        callback = cb;
        break;
    }
    this.invoker.invoke('response', 'end', [ buffer, encoding ]).finally(callback);
    return this;
  }

  setKeepAlive(enable?: boolean, initialDelay?: number): this {
    this.invoke('setKeepAlive', [ enable, initialDelay ]);
    return this;
  }

  setNoDelay(noDelay?: boolean): this {
    this.invoke('setNoDelay', [ noDelay ]);
    return this;
  }

  setEncoding(encoding?: BufferEncoding): this {
    this.invoke('setEncoding', [ encoding ]);
    return this;
  }

  pause(): this {
    this.invoke('pause', []);
    return this;
  }

  resume(): this {
    this.invoke('resume', []);
    return this;
  }

  // addListener(event: string, listener: (...args) => void): this {
  //   super.addListener(event, listener);
  //   this.invoker.addEventListener(this.type as InvokeTargetType, this, event, listener);
  //   return this;
  // }

  // once(event: string, listener: (...args: any[]) => void): this {
  //   super.once(event, listener);
  //   this.invoker.addEventListener(this.type as InvokeTargetType, this, event, listener, true);
  //   return this;
  // }

  // on(event: string, listener: (...args: any[]) => void): this {
  //   return this.addListener(event, listener);
  // }
}
