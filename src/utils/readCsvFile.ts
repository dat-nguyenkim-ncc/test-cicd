type IOptions = {
  firstLineHeader?: boolean
}

export type CSVContent = {
  headers: string
  lines: string[]
}

export function getCsvFileContent(file: File, options: IOptions = {}): Promise<CSVContent> {
  let lines: string[] = []
  return new Promise((resolve, reject) => {
    const reader = new FileReader()

    reader.addEventListener('load', event => {
      const content = event.target?.result
      if (typeof content === 'string') {
        lines = content
          .toString()
          .split(/\r\n|\n/)
          .filter(line => !!line)
        resolve({
          headers: options.firstLineHeader ? lines[0] : '',
          lines: options.firstLineHeader ? lines.slice(1) : lines,
        })
      }
      reject('Invalid file format.')
    })

    reader.readAsBinaryString(file)
  })
}
