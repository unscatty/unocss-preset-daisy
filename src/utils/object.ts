export const isEmptyObject = (obj: object) => {
  return Object.keys(obj).length === 0
}

export const entriesIterable = <T>(
  obj: Record<string, T>
): Iterable<[string, T]> => {
  return {
    *[Symbol.iterator]() {
      for (const key in obj) {
        yield [key, obj[key]]
      }
    },
  }
}
