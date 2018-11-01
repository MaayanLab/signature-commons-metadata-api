import { ObjectItems } from './object-items'

/**
 * keyCounts helper function lets us count the number of keys
 *
 * @param objs The objects to enumerate the keys of
 * @param depth The depth to go into object keys
 */
export function keyCounts(objs: any[], depth: number = 0) {
  const key_counts: { [key: string]: number } = {}

  for (const obj of objs) {
    let Q = ObjectItems(obj) as [string, any][]
    let d = depth
    while (Q.length > 0) {
      let kv = Q.pop()
      let [k, v] = kv as [string, any]
      if (key_counts[k] === undefined)
        key_counts[k] = 0
      key_counts[k] += 1
      if (d > 0) {
        try {
          Q = Q.concat(
            ObjectItems(v).map(
              ([kk, vv]) =>
                [k + '.' + kk, vv] as [string, any]
            )
          )
        } catch (e) { }
        d -= 1
      }
    }
  }

  return key_counts
}
