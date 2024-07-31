
export default abstract class MultiValueMap<K, V> extends Map<K, V[]> {
  abstract add(key: K, value: V): void;

  abstract addAll(key: K, values: V[]): void;

  abstract addAll(values: MultiValueMap<K, V>): void;

  containsKey(key: K) {
    return this.has(key);
  }

  addIfAbsent(key: K, value: V) {
    if (!this.containsKey(key)) {
      this.add(key, value);
    }
  }
}
