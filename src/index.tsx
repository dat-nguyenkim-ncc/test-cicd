import React from 'react'
import ReactDOM from 'react-dom'
import { ThemeProvider } from 'theme-ui'
import App from './App'
import { initSentry } from './sentry'
import * as serviceWorker from './serviceWorker'
import theme, { customScrollbar, fonts } from './theme'
import { ErrorFallback } from './pages'
import { ErrorBoundary } from '@sentry/react'
import Decimal from 'decimal.js-light'

Decimal.set({
  precision: 20,
  rounding: Decimal.ROUND_HALF_UP,
  toExpNeg: -7,
  toExpPos: 21,
})

initSentry()

ReactDOM.render(
  <ErrorBoundary fallback={ErrorFallback} showDialog>
    <React.StrictMode>
      <>
        <style type="text/css" dangerouslySetInnerHTML={{ __html: fonts }} />
        <ThemeProvider theme={theme}>
          <App />
          <style>{customScrollbar}</style>
        </ThemeProvider>
      </>
    </React.StrictMode>
  </ErrorBoundary>,
  document.getElementById('root')
)

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister()
