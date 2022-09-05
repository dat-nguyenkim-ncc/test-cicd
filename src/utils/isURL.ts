export const IS_URL_REGEX = /^((http:|https:|http:|https:)\/\/(www\.)?)?[a-z0-9\u3000\u3400-\u4DBF\u4E00-\u9FFF]+([-.]{1}[a-z0-9\u3000\u3400-\u4DBF\u4E00-\u9FFF]+)*\.[a-z\u3000\u3400-\u4DBF\u4E00-\u9FFF]{2,255}(:[0-9]{1,5})?(\/.*)?$/i

export default function (value: string) {
  // https://regexr.com/5t1ta

  return value.match(IS_URL_REGEX)
}

export const convertURL = (url: string) => {
  return url.startsWith('http') ? url : `https://${url}`
}
