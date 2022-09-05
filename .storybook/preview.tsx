import * as React from 'react'
import { ThemeProvider } from 'theme-ui'
import { MINIMAL_VIEWPORTS } from '@storybook/addon-viewport'
import theme from '../src/theme'

export const parameters = {
  actions: { argTypesRegex: '^on[A-Z].*' },
  layout: 'centered',
  viewport: {
    viewports: MINIMAL_VIEWPORTS,
  },
  options: {
    storySort: {
      order: ['Docs', 'Primitives', 'Buttons', 'Form Elements', 'Widgets', 'Search', 'Taxonomy', 'Company Details'], 
    },
  }
}

export const withThemeProvider = (Story, context) => (
  <ThemeProvider theme={theme}>
    <Story {...context} />
  </ThemeProvider>
)

export const decorators = [withThemeProvider]
