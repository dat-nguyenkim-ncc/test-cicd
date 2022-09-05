export default function downloadBlob(blob: Blob, fileName: string = 'test.csv') {
  const a = document.createElement('a')
  const url = window.URL.createObjectURL(blob)
  a.href = url
  a.style.visibility = 'hidden'
  a.download = fileName
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  window.URL.revokeObjectURL(url)
}
