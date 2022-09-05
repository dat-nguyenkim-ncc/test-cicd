import {
  HeadquarterConflictValue,
  MergeCompanyOverridesInput,
  OverridesConflictsValue,
  ResolveMergeOverridesConflicts,
} from '../components/MergeData/MergeData'
import { SharedCompanyLocation, TECHNOLOGY_TYPE_ID } from '../pages/CompanyForm/helpers'
import { Dimension } from '../pages/TaxonomyManagement'
import strings from '../strings'
import { FieldStates, FileState } from '../types'
import { EnumDimensionCategories, EnumExpandStatus, EnumExpandStatusId } from '../types/enums'
import { magicBytes } from './acceptedFileTypes'
import { v3 as uuidv3 } from 'uuid'
import { checkLength } from '.'
import { HasPendingCQField } from '../pages/CompanyForm/CompanyForm'
import downloadBlob from './downloadBlob'
import moment from 'moment'
import { DEFAULT_VIEW_DATE_FORMAT } from './consts'

export function capitalize(string: string) {
  return string.charAt(0).toUpperCase() + string.slice(1)
}

export function startCase(str: string) {
  return str.replace(/_/g, ' ').replace(/\w\S*/g, function (txt: string) {
    return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
  })
}

export function uniq<T>(arr: T[], getValue: (item: T) => any = item => item) {
  return arr.filter((v, i, a) => a.map(getValue).indexOf(getValue(v)) === i)
}

export function validFileType(fileState: FileState, acceptedTypes: string[]) {
  const { file } = fileState

  const allValidMagicBytes = acceptedTypes.reduce((acc, ext) => {
    acc.push(...(magicBytes[ext as keyof typeof magicBytes] || []))
    return acc
  }, [] as string[])

  return acceptedTypes.includes(file?.type) && allValidMagicBytes.includes(fileState.magicBytes)
}

export function getLogoPublicUrl(hash: string, companyId: string | number) {
  const publicStorage = process.env.REACT_APP_S3_PUBLIC_LOGO_URL
  if (publicStorage && hash) return `${publicStorage}/${companyId}/${hash}`
}

export const getUuidv3Value = (input: string): string => {
  if (!input?.length || !process.env.REACT_APP_UUID_NAMESPACE) return ''
  return uuidv3(input, process.env.REACT_APP_UUID_NAMESPACE)
}

export function getAvatarPublicUrl(hash: string, rowId: string | number) {
  const publicStorage = process.env.REACT_APP_S3_PUBLIC_AVATAR_URL
  if (publicStorage && hash) return `${publicStorage}/${getUuidv3Value(rowId as string)}/${hash}`
}

export const getHashImageFromURL = (value: string) => {
  if (!value.startsWith('http')) return value

  const url = new URL(value)
  const hashedImage = url.pathname?.split('/').pop()

  return hashedImage
}

export function expandStatusIdToName(id: EnumExpandStatusId): EnumExpandStatus {
  const mapper = {
    [EnumExpandStatusId.FOLLOWING]: EnumExpandStatus.FOLLOWING,
    [EnumExpandStatusId.DUPLICATED]: EnumExpandStatus.DUPLICATED,
    [EnumExpandStatusId.TO_BE_EVALUATED]: EnumExpandStatus.TO_BE_EVALUATED,
    [EnumExpandStatusId.UNFOLLOWED]: EnumExpandStatus.UNFOLLOWED,
    [EnumExpandStatusId.CHANGE_REQUEST]: EnumExpandStatus.CHANGE_REQUEST,
  }

  return mapper[id]
}

export const getLocationValue = (l: SharedCompanyLocation) =>
  [l.location.region, l.location.country, l.location.city].join(',')

export const validateTaxonomyMapping = (pri: Dimension[], aux: Dimension[]) => {
  const {
    pages: {
      addCompanyForm: { taxonomy: copy },
    },
  } = strings
  const hasPriFin = pri.some(item => EnumDimensionCategories.FIN === item.category)
  const hasPriIns = pri.some(item => EnumDimensionCategories.INS === item.category)
  const hasPriReg = pri.some(item => EnumDimensionCategories.REG === item.category)

  const hasAuxFin = aux.some(item => EnumDimensionCategories.FIN === item.category)
  const hasAuxIns = aux.some(item => EnumDimensionCategories.INS === item.category)
  const hasAuxReg = aux.some(item => EnumDimensionCategories.REG === item.category)

  const numberOfPrimaryCategories = [hasPriFin, hasPriIns, hasPriReg].reduce(
    (res, item) => (item ? res + 1 : res),
    0
  )

  if (numberOfPrimaryCategories > 1) {
    throw Error(copy.error.onlyPriFinOrPrimInsOrPrimReg)
  }

  if ((hasAuxFin || hasAuxIns || hasAuxReg) && !(hasPriFin || hasPriIns || hasPriReg)) {
    throw Error(copy.error.requiredPrimaryMapping)
  }

  if (pri.some(p => aux.some(a => a.id === p.id))) {
    throw Error(copy.error.map1DimensionToBothPriOrAux)
  }

  if (
    hasPriIns &&
    !pri.filter(p => p.category === EnumDimensionCategories.INS && +p.dimension === 2).length
  ) {
    throw Error(copy.error.requiredPrimInsValueChain)
  }
}

export const formatMoneyView = (money: number, currency: string) => {
  const raw = new Intl.NumberFormat('en-us', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(money)

  const index = raw.search(/\d/g)

  return raw.substring(0, index) + ' ' + raw.substring(index)
}

export const getMergeOverridesInput = (
  resolveOverridesConflicts: ResolveMergeOverridesConflicts | undefined
): MergeCompanyOverridesInput[] => {
  return resolveOverridesConflicts
    ? Object.keys(resolveOverridesConflicts).map((key: string) => {
        const { headquarterLocation } = resolveOverridesConflicts[key]

        const removeTypeName = (item: OverridesConflictsValue) => {
          const {
            companyId,
            value,
            dataOverrideId,
            createNewHistoryTree,
            targetId,
            isDefaultOverride,
            originValue,
          } = item
          return {
            companyId,
            value,
            dataOverrideId,
            createNewHistoryTree,
            targetId,
            isDefaultOverride,
            originValue,
          }
        }

        const { city, country } = headquarterLocation || {}

        return {
          ...removeTypeName(resolveOverridesConflicts[key]),
          field: key,
          headquarterLocation: headquarterLocation
            ? ({
                country: removeTypeName(country as OverridesConflictsValue),
                city: removeTypeName(city as OverridesConflictsValue),
              } as HeadquarterConflictValue)
            : undefined,
        }
      })
    : []
}
export type Value = boolean | null | number | string

export const formattedValue = (value: Value, format?: (v: Value) => string): string => {
  if (format) return format(value)
  return String(value || '').trim()
}

export const getSelfDeclared = (value?: boolean | null | number): string => {
  return value ? 'Yes' : ''
}

export const getValueDate = (value: any) => {
  if (moment(value, DEFAULT_VIEW_DATE_FORMAT, true).isValid()) return value
  const date = moment(value).format(DEFAULT_VIEW_DATE_FORMAT)
  return date !== 'Invalid date' ? date : value
}

const maxTechnologyLength = 4000

export const ValidateTechnology = (state: string[]) => (
  value: string | number,
  dataType: TECHNOLOGY_TYPE_ID,
  maxLength: number = maxTechnologyLength
): keyof FieldStates => {
  const mergeState = [...state]
  const isDuplicated = mergeState.filter(v => value === v)?.length > 1

  if (!value?.toString()?.length) return 'error'
  if (dataType === TECHNOLOGY_TYPE_ID?.ENGINEERING && !Number.isInteger(+value)) return 'error'
  if (checkLength(value, maxLength) || isDuplicated) return 'error'
  return 'default'
}

export const getFundraisingValue = (value?: number): string => {
  return !!value ? 'Yes' : 'No'
}

export const CRFilterNA = (item: HasPendingCQField) => item.companyId !== 'NA'

export const compareString = (a?: string, b?: string) => {
  return a?.trim().toLowerCase() === b?.trim().toLowerCase()
}

export const getUrlDomain = (url: string) => {
  url = url.trim().replace(/(https?:\/\/)?(www[0-9]?.)?/i, '')
  if (url.indexOf('/') !== -1) {
    return url.split('/')[0]
  }
  return url
}

export const downloadFileCsv = (
  fileName: string,
  rows: any,
  keys: string[],
  labels: string[] | null = null
) => {
  const separator = ','

  const csvContent =
    (labels || keys).join(separator) +
    '\n' +
    rows
      .map((row: any) => {
        return keys
          .map(k => {
            let cell = row[k] === null || row[k] === undefined ? '' : row[k]
            cell = `"${cell
              .toString()
              .replace(/"/g, '""')
              .replace(/(\r\n|\n|\r)/gm, ' ')}"`
            return cell
          })
          .join(separator)
      })
      .join('\n')

  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8' })
  downloadBlob(blob, fileName)
}
