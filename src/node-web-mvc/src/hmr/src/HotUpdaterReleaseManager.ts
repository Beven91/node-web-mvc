type ReleaseHandler = () => void;

const handlers: ReleaseHandler[] = [];

export default class HotUpdaterReleaseManager {
  static push(handler: ReleaseHandler) {
    handlers.push(handler);
  }

  static release() {
    handlers.forEach(handler => handler());
    handlers.length = 0;
  }
}
