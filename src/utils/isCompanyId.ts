export default function (value: string) {
  if (value.indexOf('.') < 0 && value.length >= 6 && !isNaN(+value)) {
    return true
  }
  return false
}
