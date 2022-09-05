export default function (value: string) {
  const regex = new RegExp(/^\d{2}[./-]\d{2}[./-]\d{4}$/)
  return value.match(regex)
}
