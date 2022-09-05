import { EnumFileSize } from '../types/enums'

const d = {
  csvOnly: ['.csv', 'application/vnd.ms-excel', 'text/plain', 'text/csv'],
  csv: [
    '.csv',
    'text/csv',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/plain',
  ],
  pdf: ['application/pdf'],
  documentation: [
    'application/vnd.ms-excel',
    'application/vnd.ms-powerpoint',
    'application/msword',
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.openxmlformats-officedocument.presentationml.slideshow',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  ],
  png: ['image/png'],
  jpg: ['image/jpeg'],
  video: ['video/mp4', 'video/x-m4v', 'video/quicktime', 'video/*'],
  magicBytesOfJpg: [
    'FFD8FFE8',
    'FFD8FFE0',
    'FFD8FFE1',
    'FFD8FFE2',
    'FFD8FFE3',
    'FFD8FFDB',
    'FFD8FFED',
  ],
  magicBytesOfPng: ['89504E47'],
  magicBytesOfPdf: ['25504446', ''],
  magicBytesOfPowerPoint: ['D0CF11E0', '06E1EF0', '504B34', 'F0E83', 'A0461DF0', 'FDFFFFFF', ''],
  magicBytesOfExcel: ['D0CF11E0', '98100', 'FDFFFFFF', '504B34', ''],
  magicBytesOfWord: [
    '504B34',
    '444D5321',
    'D0CF11E0',
    'D444F43',
    'CF11E0A1',
    'DBA52D0',
    'ECA5C10',
    '3C21444F',
    '',
  ],
}

export default d

export const magicBytes = {
  'application/pdf': d.magicBytesOfPdf,
  '.csv': d.magicBytesOfExcel,
  'text/csv': d.magicBytesOfExcel,
  'application/vnd.ms-excel': d.magicBytesOfExcel,
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': d.magicBytesOfExcel,
}

export const checkLimitFileSize = (file: File) => {
  // check bytes
  if (d.pdf.includes(file.type)) return file.size < EnumFileSize.PDF
  if ([...d.png, ...d.jpg].includes(file.type)) return file.size < EnumFileSize.IMG
  if (d.video.includes(file.type)) return file.size < EnumFileSize.VIDEO
  return true
}
