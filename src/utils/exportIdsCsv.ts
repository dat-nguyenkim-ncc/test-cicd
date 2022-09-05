type argsType = {
  data?: string[]
  fileName?: string
}

const dataDefault = ['company_id', '111111', '222222', '333333']

const convertArrayOfStringToCSV = (args: argsType) => {
  const data = args.data
  if (!data || !data.length) return

  const lineDelimiter = '\n'

  let result = ``

  data.forEach(str => {
    result += str
    result += lineDelimiter
  })

  return result
}

export default (args: argsType = { data: dataDefault }) => {
  let csv = convertArrayOfStringToCSV(args)
  if (!csv) return
  const filename = args.fileName ? `${args.fileName}.csv` : 'TemplateIds.csv'

  if (!csv.match(/^data:text\/csv/i)) {
    csv = 'data:text/csv;charset=utf-8,' + csv
  }

  const data = encodeURI(csv)

  const link = document.createElement('a')
  link.setAttribute('href', data)
  link.setAttribute('download', filename)
  link.click()
}
