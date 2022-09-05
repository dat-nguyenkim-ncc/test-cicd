import { SxStyleProp } from 'theme-ui'
import { EnumDimensionValue } from '../types/enums'

export const popoverZIndex = '11'
export const drawerZIndex = '990'
export const modalZIndex = '1000'
export const errorModalZIndex = '1020'
export const reasonPopverZIndex = '1010' // make sure this greater than modal zIndex (1000)
export const footerZIndex = '12'
export const CELL_SIZE = 'minmax(auto, 29px)'
export const CELL_BUFFER = '0px'
export const DATE_FORMAT = 'YYYY-MM-DD'
export const TRACTION_DATE_FORMAT = 'DD-MM-YYYY'
export const HISTORY_DATE_FORMAT = 'DD-MM-YYYY'
export const DEFAULT_VIEW_DATE_FORMAT = 'DD-MM-YYYY'
export const DEFAULT_POST_DATE_FORMAT = 'YYYY-MM-DD'
export const SENTIMENT_CHART_DATE_FORMAT = 'MMMM DD'
export const FILTER_POST_DATE_FORMAT = 'MM/DD/YYYY'
export const HEALTH_CHECK_CHART_DATE_FORMAT = 'DD/MM'
export const TAXONOMY_HISTORY_DATE_FORMAT = 'DD-MM-YYYY HH:mm:ss'
export const INVALID_DATE = 'Invalid date'
export const MIN_YEAR = 1970
export const TOOLTIP_SX = {
  fontSize: '0.9em',
  maxWidth: '300px',
  lineHeight: '1.5em',
  wordBreak: 'keep-all',
} as SxStyleProp

export const Function = {
  AGGREGATE: 'aggregate',
  AGGREGATE_INTERNAL: 'aggregate internal',
  MERGE: 'merge',
  CHANGE_DEFAULT: 'change default',
  REMOVE_SOURCE: 'remove source',
}

export const ATTACHMENT_TYPE = {
  OTHER: 'Other',
}

export const defaultLogo = `data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCI+PHBhdGggZmlsbD0iI0JEQkRCRCIgZD0iTTEyLDZWMS4ySDBWMjIuOEgyNFY2Wk00LjgsMjAuNEgyLjRWMThINC44Wm0wLTQuOEgyLjRWMTMuMkg0LjhabTAtNC44SDIuNFY4LjRINC44Wk00LjgsNkgyLjRWMy42SDQuOFpNOS42LDIwLjRINy4yVjE4SDkuNlptMC00LjhINy4yVjEzLjJIOS42Wm0wLTQuOEg3LjJWOC40SDkuNlpNOS42LDZINy4yVjMuNkg5LjZabTEyLDE0LjRIMTJWMThoMi40VjE1LjZIMTJWMTMuMmgyLjRWMTAuOEgxMlY4LjRoOS42Wm0tMi40LTkuNkgxNi44djIuNGgyLjRabTAsNC44SDE2LjhWMThoMi40WiIvPjwvc3ZnPg==`

export const FORM_CHANGE_DEBOUNCE_TIME = 200

export const DIMENSION_TYPE: any = {
  fintech: {
    [EnumDimensionValue.PRIMARY]: 'Cluster',
    [EnumDimensionValue.SECONDARY]: 'Sector',
  },
  insurtech: {
    [EnumDimensionValue.PRIMARY]: 'Cluster',
    [EnumDimensionValue.SECONDARY]: 'Value chain',
  },
  regtech: {
    [EnumDimensionValue.PRIMARY]: 'Cluster',
    [EnumDimensionValue.SECONDARY]: 'Risk',
  },
}
export const idNANumber = -1

export const DIMENSION_VALUE = {
  CLUSTER: 1,
  SECTOR: 2,
  RISK: 2,
  VALUE_CHAIN: 2,
}

export const SENTIMENT_LABEL = {
  POSITIVE: 'positive',
  NEUTRAL: 'neutral',
  NEGATIVE: 'negative',
}

export const BUSINESS_EVENTS = [
  'Customer Traction',
  'Funding Events',
  'Hiring',
  'Initial Public Offerings',
  'Layoffs',
  'Leadership Changes',
  'Location Expansions',
  'Mergers and Acquisitions',
  'New Patents',
  'Participation in an Event',
  'Partnership',
  'Product Launch',
  'Regulatory Changes',
]

export const MENU_TITLE = {
  Coverage: 'Coverage',
  Analysis: 'Analysis',
  Management: 'Management',
}

export const UNMAPPED = 'unmapped'

export const PRODUCT_CLUSTER_CHANGE_DEBOUNCE_TIME = 700
