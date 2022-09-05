export class TwoWayMap<K1 extends string, K2 extends string> {
  map = {} as Record<K1, K2>
  reverseMap = {} as Record<K2, K1>
  constructor(map: Record<K1, K2>) {
    this.map = map
    this.reverseMap = {} as Record<K2, K1>
    for (let key in map) {
      const value = map[key]
      this.reverseMap[value] = key
    }
  }
  get(key: K1) {
    return this.map[key]
  }
  revGet(key: K2) {
    return this.reverseMap[key]
  }
}
