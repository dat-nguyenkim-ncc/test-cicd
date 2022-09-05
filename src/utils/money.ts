const formatMoney = (money: number, currency: string) =>
  new Intl.NumberFormat('en-us', { style: 'currency', currency }).format(money)

export default formatMoney
