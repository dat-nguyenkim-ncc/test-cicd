import md5 from 'md5'
import { LogoState } from '../pages/CompanyForm/CompanyForm'
import { checkValidImageFile, convertDataURIToBinary } from '../pages/CompanyForm/helpers'
import { FileState } from '../types'

export const convertBase64ToFile = (url: string, file: File) => {
  let arr = url.split(','),
    bstr = atob(arr[1]),
    n = bstr.length,
    u8arr = new Uint8Array(n)

  while (n--) {
    u8arr[n] = bstr.charCodeAt(n)
  }

  return new File([u8arr], file.name, { type: file.type })
}

const imageFileToBase64 = async (file: FileState, { cropToSquare = true }) => {
  return new Promise<LogoState>(function (resolve, reject) {
    const reader = new FileReader()
    reader.onload = async function (e) {
      const result = e.target?.result

      if (result) {
        const invalid = !checkValidImageFile(file)
        if (invalid) reject(invalid)

        let img = new Image()
        // draw an square image
        img.onload = function () {
          let canvas = document.createElement('canvas')
          let ctx = canvas.getContext('2d')
          ctx?.drawImage(img, 0, 0)

          if (cropToSquare) {
            // take the length of the smaller side
            const length = img.width > img.height ? img.height : img.width
            const startX = img.width > img.height ? Math.abs(img.width - img.height) / 2 : 0
            const startY = img.width < img.height ? Math.abs(img.width - img.height) / 2 : 0

            canvas.width = canvas.height = length
            canvas
              ?.getContext('2d')
              ?.drawImage(img, startX, startY, length, length, 0, 0, length, length)
          } else {
            canvas.width = img.width
            canvas.height = img.height
            canvas
              ?.getContext('2d')
              ?.drawImage(img, 0, 0, img.width, img.height, 0, 0, img.width, img.height)
          }

          const url = canvas.toDataURL('image/jpeg')
          const newFile = { ...file, file: convertBase64ToFile(url, file.file) }
          const uint = convertDataURIToBinary(url as string)

          resolve({
            ...newFile,
            width: canvas.width,
            height: canvas.height,
            src: url,
            hash: md5(uint),
          })
        }
        img.src = result as string
      }
    }
    reader.readAsDataURL(file.file)
  })
}

export default imageFileToBase64
