export const formatPercent = (value : string | number,countFixed = 2) => {
  if (isNaN(+value)) return 'N/A'
  let number = +value
  if(Number.isInteger(number)) return number
  return number.toFixed(countFixed)
}