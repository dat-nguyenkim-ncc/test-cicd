import { SxStyleProp, Theme } from 'theme-ui'

export { default as fonts } from './fonts'

const isProd = process.env.REACT_APP_STAGE === 'prod'

const defaultButton = {
  fontFamily: 'body',
  fontWeight: 'bold',
  lineHeight: 'body',
  fontSize: 0,
} as SxStyleProp

const defaultBox = {
  border: 0,
  fontFamily: 'body',
  outline: 'none',
  borderRadius: 10,
  paddingX: 4,
  paddingY: 3,
} as SxStyleProp

const defaultHover = {
  cursor: 'pointer',
  transition: 'all .2s ease-out',
  '&:hover': {
    opacity: 0.7,
  },
} as SxStyleProp

const defaultDisabledStyle = {
  opacity: 0.5,
  pointerEvents: 'none',
} as SxStyleProp

export const Palette = {
  text: '#000',
  white: '#fff',
  background: '#fff',
  primary: !isProd ? '#F7818B' : '#3FCB96',
  secondary: '#212529',
  darkGray: '#777777',
  green: '#3FCB96',
  red: '#FF361B',
  bgPrimary: !isProd ? 'rgba(232, 48, 52, 0.1)' : 'rgba(63, 203, 150, 0.1)',
  bgRed: 'rgba(232, 48, 52, 0.1)',
  darkerGray: '#',
  gray01: '#E2E2E2',
  gray02: '#EDEDED',
  gray03: '#F5F5F5',
  gray04: '#CACACA',
  gray05: '#E7E7E7',
  gray06: '#F2F2F2',
  gray07: '#9a9a9a',
  bgGray: '#FAFAFA',
  transparent: 'transparent',
  black80: 'rgba(0,0,0,.8)',
  black50: 'rgba(0,0,0,.5)',
  mint: 'rgb(240,251,247)',
  orange: '#FFA800',
  bgHover: '#ECFAF4',
  gold: '#E89C19',
  bgGold: 'rgba(232, 156, 25, 0.1)',
  yellow: '#D4DF33',
  greenBland: '#29BA74',
  redDark: '#E71C57',
  greenDark: '#3EAD92',
  blueBright: '#30C1D7',
}

export const rangeColor = [
  '#173E59',
  '#B775B3',
  '#7160A3',
  '#CE618E',
  '#EF8251',
  '#F3A93C',
  '#C70039',
  '#008E88',
  '#62C5F3',
  '#9400F9',
  '#968830',
  '#6495ED',
  '#6CAB57',
  '#C5D275',
  '#F9DB7F',
  '#9A6324',
  '#99AEBA',
  '#1451C7',
  '#C9BCE2',
  '#FF6766',
]

export type PaletteKeys = keyof typeof Palette

export default {
  breakpoints: ['40em', '52em', '64em'],
  space: [0, 4, 8, 12, 24, 30, 60, 75],
  fonts: {
    body: 'Henderson BCG Sans',
    heading: 'Henderson BCG Sans',
    subHeading: 'HendersonBCGSerif-Regular',
  },
  buttons: {
    invert: {
      ...defaultBox,
      ...defaultButton,
      ...defaultHover,
      backgroundColor: 'transparent',
    },
    outline: {
      ...defaultBox,
      ...defaultButton,
      ...defaultHover,
      backgroundColor: 'transparent',
      borderWidth: 1,
      borderStyle: 'solid',
      borderColor: 'darkerGray',
      opacity: 0.5,
      color: 'text',
    },
    outlineWhite: {
      ...defaultBox,
      ...defaultButton,
      ...defaultHover,
      backgroundColor: 'transparent',
      borderWidth: 1,
      borderStyle: 'solid',
      borderColor: 'white',
      opacity: 0.5,
      color: 'white',
    },
    secondary: {
      ...defaultBox,
      ...defaultButton,
      ...defaultHover,
      color: 'text',
      backgroundColor: 'background',
    },
    muted: {
      ...defaultBox,
      ...defaultButton,
      ...defaultHover,
      backgroundColor: 'gray03',
      color: 'gray04',
    },
    primary: {
      ...defaultBox,
      ...defaultButton,
      ...defaultHover,
    },
    black: {
      ...defaultBox,
      ...defaultButton,
      ...defaultHover,
      backgroundColor: 'text',
      color: 'background',
    },
    error: {
      ...defaultBox,
      ...defaultButton,
      ...defaultHover,
      backgroundColor: 'transparent',
      color: 'red',
      borderWidth: 1,
      borderStyle: 'solid',
      borderColor: 'red',
    },
  },
  fontSizes: [14, 24, 34, 50, 74],
  fontWeights: {
    body: 'normal',
    heading: 'normal',
    bold: 'bold',
  },
  lineHeights: {
    body: 1.142857143,
    heading: 1.121621622,
    h3: 1.125,
    h4: 1.125,
  },
  colors: {
    ...Palette,
  },
  cards: {
    primary: {
      borderRadius: 10,
      backgroundColor: 'gray03',
      padding: 4,
    },
  },
  links: {
    default: {
      position: 'relative',
      cursor: 'pointer',
      color: 'inherit',
      borderBottom: '1px solid',
      borderColor: 'inherit',
    },
    nav: {
      position: 'relative',
      cursor: 'pointer',
      color: 'background',
      fontWeight: 'body',
      fontSize: 0,
      paddingBottom: 5,
      '&:hover': {
        color: 'background',
      },
      '&:active': {
        color: 'background',
      },
      '&:visited': {
        color: 'background',
      },
    },
    company: {
      variant: 'text.body',
      textDecoration: 'underline',
    },
    tab: {
      variant: 'text.body',
      fontWeight: 'bold',
      color: 'gray04',
      p: 5,
      textAlign: 'center',
      borderRadius: 10,
      bg: 'white',
    },
    tabActive: {
      variant: 'links.tab',
      bg: 'gray02',
      color: 'primary',
    },
    text: {
      position: 'relative',
      cursor: 'pointer',
      color: 'primary',
      borderBottom: '1px solid',
      borderColor: 'primary',
    },
    back: {
      position: 'relative',
      cursor: 'pointer',
      ml: 3,
      ':before': {
        borderColor: 'inherit',
        borderStyle: 'solid',
        borderWidth: '2px 2px 0 0',
        top: 1,
        content: "''",
        display: 'inline-block',
        height: '6px',
        left: -3,
        position: 'absolute',
        transform: 'rotate(-135deg)',
        verticalAlign: 'top',
        width: '6px',
      },
      borderBottom: '1px solid',
      borderColor: 'inherit',
    },
  },
  forms: {
    label: {
      mb: 4,
      variant: 'text.body',
      fontWeight: 'bold',
    },
    select: {
      ...defaultBox,
      backgroundColor: 'gray03',
    },
    input: {
      ...defaultBox,
      backgroundColor: 'gray03',
    },
    search: {
      ...defaultBox,
      padding: 0,
      border: 0,
      backgroundColor: 'transparent',
      fontFamily: 'body',
      fontWeight: '100',
      fontSize: 1,
    },
    textarea: {
      ...defaultBox,
      backgroundColor: 'gray03',
      minHeight: 80,
    },
  },
  text: {
    error: {
      color: 'red',
      fontSize: 14,
    },
    body: {
      fontFamily: 'body',
      fontWeight: 'body',
      lineHeight: 'body',
      fontSize: 0,
    },
    h1: {
      fontFamily: 'heading',
      lineHeight: 'heading',
      fontWeight: 'heading',
      fontSize: 4,
    },
    h2: {
      fontFamily: 'subHeading',
      lineHeight: 'heading',
      fontWeight: 'body',
      fontSize: 3,
    },
    h3: {
      fontFamily: 'subHeading',
      lineHeight: 'h3',
      fontWeight: 'body',
      fontSize: 2,
    },
    h4: {
      fontFamily: 'heading',
      lineHeight: 'h4',
      fontWeight: 'body',
      fontSize: 1,
    },
    h5: {
      fontFamily: 'subHeading',
      fontSize: 1,
      fontWeight: 'bold',
      lineHeight: 'h4',
    },
  },
  styles: {
    root: {
      fontFamily: 'body',
      lineHeight: 'body',
      fontWeight: 'body',
      backgroundColor: 'gray03',
    },
    a: {
      color: 'primary',
    },
    hr: {
      color: 'gray01',
    },
  },
  images: {
    logo: {
      borderRadius: '8px',
      width: 108,
      height: 108,
      background: 'white',
    },
    addAvatar: {
      borderRadius: '7px',
      width: 75,
      height: 75,
      background: 'white',
      aspectRatio: 'auto 1 / 1',
    },
  },
  disabled: {
    ...defaultDisabledStyle,
  },
} as Theme

export const customScrollbar = `
/* width */
::-webkit-scrollbar {
  width: 4px;
  height: 4px;
}

/* Track */
::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 8px;
}

/* Handle */
::-webkit-scrollbar-thumb {
  background: #888;
  border-radius: 8px;
}

/* Handle on hover */
::-webkit-scrollbar-thumb:hover {
  background: #555;
}`
