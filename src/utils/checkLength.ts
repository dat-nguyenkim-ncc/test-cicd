export default function checkLength(
  value: string | number,
  maxLength: number | undefined,
  maxWord?: number
) {
  const isWord = (str: string) => {
    let alphaNumericFound = false
    for (let i = 0; i < str.length; i++) {
      let code = str.charCodeAt(i)
      if (
        (code > 47 && code < 58) || // numeric (0-9)
        (code > 64 && code < 91) || // upper alpha (A-Z)
        (code > 96 && code < 123)
      ) {
        // lower alpha (a-z)
        alphaNumericFound = true
        return alphaNumericFound
      }
    }
    return alphaNumericFound
  }

  // Count words
  // https://codesource.io/building-a-word-counter-in-javascript/
  if (maxWord) {
    let text = value.toString().split(' ')
    let wordCount = 0
    for (let i = 0; i < text.length; i++) {
      if (text[i] !== ' ' && isWord(text[i])) {
        wordCount++
      }
    }
    if (wordCount > maxWord) return true
  }

  // Count byte-length of unicode characters
  // https://coolaj86.com/articles/how-to-count-unicode-characters-in-javascript/
  let escstr = encodeURIComponent(value)
  let binstr = escstr.replace(/%([0-9A-F]{2})/gi, function (match, hex) {
    let i = parseInt(hex, 16)
    return String.fromCharCode(i)
  })
  return maxLength ? (binstr.length > maxLength ? true : false) : false
}
