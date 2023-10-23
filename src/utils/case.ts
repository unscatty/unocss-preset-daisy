const KEBAB_REGEX = /[A-Z\u00C0-\u00D6\u00D8-\u00DE]|\d+/g
const REVERSE_REGEX = /-[a-z\u00E0-\u00F6\u00F8-\u00FE]/g

export function kebabCase(camelString: string) {
  return camelString.replace(KEBAB_REGEX, function (match) {
    return '-' + match.toLowerCase()
  })
}

export function camelCase(kebabString: string) {
  return kebabString.replace(REVERSE_REGEX, function (match) {
    return match.slice(1).toUpperCase()
  })
}
