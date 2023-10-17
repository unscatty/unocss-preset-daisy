const bracketTypeRe = /^\[(color|length|position|quoted|string):/i

function bracketWithType(str: string, requiredType?: string) {
  if (str && str.startsWith('[') && str.endsWith(']')) {
    let base: string | undefined
    let hintedType: string | undefined

    const match = str.match(bracketTypeRe)
    if (match) {
      if (!requiredType) {
        hintedType = match[1]
      }
      base = str.slice(match[0].length, -1)
    } else {
      base = str.slice(1, -1)
    }

    if (!base) {
      return
    }

    // test/preset-attributify.test.ts > fixture5
    if (base === '=""') {
      return
    }

    if (base.startsWith('--')) {
      base = `var(${base})`
    }

    let curly = 0
    for (const i of base) {
      if (i === '[') {
        curly += 1
      } else if (i === ']') {
        curly -= 1
        if (curly < 0) {
          return
        }
      }
    }
    if (curly) {
      return
    }

    switch (hintedType) {
      case 'string': {
        return base.replace(/(^|[^\\])_/g, '$1 ').replace(/\\_/g, '_')
      }

      case 'quoted': {
        return base
          .replace(/(^|[^\\])_/g, '$1 ')
          .replace(/\\_/g, '_')
          .replace(/(["\\])/g, '\\$1')
          .replace(/^(.+)$/, '"$1"')
      }
    }

    return base
      .replace(/(url\(.*?\))/g, (v) => v.replace(/_/g, '\\_'))
      .replace(/(^|[^\\])_/g, '$1 ')
      .replace(/\\_/g, '_')
      .replace(/(?:calc|clamp|max|min)\((.*)/g, (match) => {
        const vars: string[] = []
        return (
          match
            .replace(/var\((--.+?)[),]/g, (match, g1) => {
              vars.push(g1)
              return match.replace(g1, '--un-calc')
            })
            .replace(
              // eslint-disable-next-line unicorn/better-regex
              /(-?\d*\.?\d(?!\b-\d.+[,)](?![^+\-/*])\D)(?:%|[a-z]+)?|\))([+\-/*])/g,
              '$1 $2 '
            )
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            .replace(/--un-calc/g, () => vars.shift()!)
        )
      })
  }
}

export function bracket(str: string) {
  return bracketWithType(str)
}
