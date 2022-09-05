import moment from 'moment'
import { FormOption } from '../../types'
import { HEALTH_CHECK_CHART_DATE_FORMAT } from '../../utils/consts'
import { formatPercent } from '../../utils/formatPercent'

export const formatNumber = (value: string) => (Math.abs(Number(value)) / 1.0e9).toFixed(2)

export type HealthCheckTableResult = {
  date: string
  mapped_companies: string
  mapped_funding: string
  mapped_investors: string
  unmapped_companies: string
  unmapped_funding: string
  missing_description: string
  missing_foundedyear: string
  missing_hqlocation: string
  missing_operating_status: string
  unmapped_country: string
  unmapped_investors: string
  static_sources: string
  active_overrides: string
  invalid_funding_date: string
  single_source: string
  static_overview_sources: string
  news_articles: string
  news_coverage: string
  out_companies_have_profile: string
  apix_companies: string
  having_many_hq_locations: string
  dead_source_companies: string
  find_fintechs_with_funding: string
  incorrect_mappings: string
  unconverted_currencies: string
  duplicate_companies: string
  duplicate_investors: string
}

export type HealthCheckChartResult = {
  date: string
  data_completeness: string
  mapping_quality: string
  source_coverage: string
  fintech_coverage: string
  overall_health: string
}

export type dataChartItemResult = {
  title: string
  tooltipMessage: string
  index: number
  percentGrowth: string
  list: { time: string; value: string }[]
}

export const healthCheckTableThread: HealthCheckTableResult = {
  date: 'Date',
  mapped_companies: 'Mapped companies',
  mapped_funding: 'Mapped funding (B)',
  mapped_investors: 'Mapped investors',
  unmapped_companies: 'Unmapped companies',
  unmapped_funding: 'Unmapped funding (B)',
  missing_description: 'Missing description',
  missing_foundedyear: 'Missing founded Year',
  missing_hqlocation: 'Missing hq location',
  missing_operating_status: 'Missing operating status',
  unmapped_country: 'Unmapped country',
  unmapped_investors: 'Unmapped investors',
  static_sources: 'Static sources',
  active_overrides: 'Active overrides',
  invalid_funding_date: 'Invalid funding date',
  single_source: 'Single source',
  static_overview_sources: 'Static overview sources',
  news_articles: 'News articles',
  news_coverage: 'News coverage',
  out_companies_have_profile: 'Out companies have profile',
  apix_companies: 'APIX companies',
  having_many_hq_locations: 'Companies have many hq locations',
  dead_source_companies: 'Dead source companies',
  find_fintechs_with_funding: 'Find Fintechs with funding',
  incorrect_mappings: 'Incorrect mappings',
  unconverted_currencies: 'Unconverted currencies',
  duplicate_companies: 'Duplicate companies',
  duplicate_investors: 'Duplicate investors',
}

export const HEALTH_CHECK_CHART_TITLES: Record<string, string> = {
  overall_health: 'OVERALL HEALTH',
  data_completeness: 'DATA COMPLETENESS',
  mapping_quality: 'MAPPING QUALITY',
  source_coverage: 'SOURCE COVERAGE',
  fintech_coverage: 'FINTECH COVERAGE',
}

export const TABLE_TIME_FRAME_OPTIONS: FormOption[] = [
  { label: '10', value: '10' },
  { label: '30', value: '30' },
  { label: '50', value: '50' },
  { label: '100', value: '100' },
]

export const CHART_TIME_FRAME_OPTIONS: FormOption[] = [
  { label: '1 month', value: '1' },
  { label: '3 months', value: '3' },
  { label: '12 months', value: '12' },
  { label: 'All', value: 'all' }, // 'Dropdown' component does not recognize '' value
]

export const HEALTH_CHECK_TABLE_GROUPS = {
  data_completeness: 'Data completeness',
  mapping_quality: 'Mapping quality',
  source_coverage: 'Source coverage',
  fintech_coverage: 'Fintech coverage',
  tech: 'Tech',
}

export const HEALTH_CHECK_TABLE_GROUPS_THREADS: Record<string, (keyof HealthCheckTableResult)[]> = {
  data_completeness: [
    'missing_description',
    'missing_foundedyear',
    'missing_hqlocation',
    'missing_operating_status',
    'invalid_funding_date',
    'out_companies_have_profile',
    'having_many_hq_locations',
  ],
  mapping_quality: [
    'incorrect_mappings',
    'mapped_companies',
    'mapped_funding',
    'mapped_investors',
    'unmapped_companies',
    'unmapped_funding',
    'unmapped_investors',
    'unconverted_currencies',
    'unmapped_country',
  ],
  source_coverage: ['static_sources', 'static_overview_sources', 'single_source'],
  fintech_coverage: ['find_fintechs_with_funding', 'news_coverage', 'news_articles'],
  tech: [
    'active_overrides',
    'dead_source_companies',
    'duplicate_companies',
    'duplicate_investors',
    'apix_companies',
  ],
}

const TOOLTIP_MESSAGE = {
  OVERALL_HEALTH:
    '= 1 - (data_completeness + mapping_quality + source_coverage + fintech_coverage)/4',
  DATA_COMPLETENESS:
    '= 1 - (missing_description/mapped_companies + missing_founded_year/mapped_companies + missing_hq_location/mapped_companies + missing_operating_status/mapped_companies)/4 ',
  MAPPING_QUALITY: '= 1 - incorrect_mappings/number of all companies including out companies',
  SOURCE_COVERAGE: '= 1 - static_sources/mapped_companies',
  FINTECH_COVERAGE:
    '= 1 - (find_fintechs_with_funding + unmapped_companies)/(find_fintechs_with_funding + unmapped_companies + mapped_companies)',
}

const AVAILABLE_KEYS = [
  'overall_health',
  'data_completeness',
  'mapping_quality',
  'source_coverage',
  'fintech_coverage',
]

const PERCENTAGE = 100

export function convertChartResult(
  healthCheckChartResult: HealthCheckChartResult[]
): dataChartItemResult[] {
  const reversedCharts = [...healthCheckChartResult].reverse()
  return Object
    .values(reversedCharts.reduce((previousItem, currentItem) => {
      Object.keys(currentItem).forEach(itemKey => {
        if (!AVAILABLE_KEYS.includes(itemKey)) return;

        const objItemPercentAtTime = {
          time: moment(currentItem.date).utc().format(HEALTH_CHECK_CHART_DATE_FORMAT),
          value: formatPercent((currentItem as any)[itemKey] * PERCENTAGE, 3),
        }

        if (previousItem[itemKey]) return previousItem[itemKey].list.push(objItemPercentAtTime)
        else return (
          previousItem[itemKey] = {
            title: HEALTH_CHECK_CHART_TITLES[itemKey] || '',
            index: AVAILABLE_KEYS.indexOf(itemKey),
            list: [objItemPercentAtTime],
            percentGrowth: healthCheckChartResult[0]
              ? ((healthCheckChartResult[0] as any)[itemKey] * PERCENTAGE).toFixed(2)
              : 0,
          }
        )
      })
      return previousItem
    }, {} as any))
    .sort((a: any, b: any) => a.index - b.index)
    .map((item: any) => {
      const key = item.title.replace(' ', '_') as
        | 'OVERALL_HEALTH'
        | 'DATA_COMPLETENESS'
        | 'MAPPING_QUALITY'
        | 'SOURCE_COVERAGE'
        | 'FINTECH_COVERAGE'

      item.tooltipMessage = TOOLTIP_MESSAGE[key]
      return item
    }
  ) as dataChartItemResult[]

}
