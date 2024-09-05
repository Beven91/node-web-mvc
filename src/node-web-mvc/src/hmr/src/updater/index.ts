import ArrayUpdater from './ArrayUpdater';
import ObjectUpdater from './ObjectUpdater';
import MapUpdater from './MapUpdater';

export default function createHotUpdater<T>(data, now, old) {
  if (data instanceof Array) {
    return new ArrayUpdater<T>(data, now, old);
  } else if (data instanceof Map) {
    return new MapUpdater<T>(data, now, old);
  } else {
    return new ObjectUpdater<T>(data, now, old);
  }
}
