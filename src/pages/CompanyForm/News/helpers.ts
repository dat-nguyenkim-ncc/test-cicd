import { transformPostDate } from './../helpers'
import { DateRangeType } from '../../../components/MappingZone/FilterForm/helpers'
import { FILTER_POST_DATE_FORMAT } from '../../../utils/consts'

export type NewsFilterType = {
  isRange: boolean
  publishedDate: {
    date: string
    dateRange: DateRangeType
  }
  sentimentLabels: string[]
  businessEvents: string[]
  title: string
}

export type NewsFilterInput = {
  sentimentLabels: string[]
  businessEvents: string[]
  publishedDateFrom: string
  publishedDateTo: string
  title: string
}

export const INIT_FILTER_NEWS: NewsFilterType = {
  isRange: false,
  publishedDate: {
    date: '',
    dateRange: {
      from: '',
      to: '',
    },
  },
  sentimentLabels: [],
  businessEvents: [],
  title: '',
}

export const convertToInput = (filter: NewsFilterType): NewsFilterInput => {
  const publishedDateFrom = filter.isRange
    ? filter.publishedDate.dateRange.from
    : filter.publishedDate.date

  const publishedDateTo = filter.isRange
    ? filter.publishedDate.dateRange.to
    : filter.publishedDate.date

  return {
    sentimentLabels: filter.sentimentLabels,
    businessEvents: filter.businessEvents,
    publishedDateFrom: transformPostDate(publishedDateFrom, FILTER_POST_DATE_FORMAT),
    publishedDateTo: transformPostDate(publishedDateTo, FILTER_POST_DATE_FORMAT),
    title: filter.title,
  }
}
