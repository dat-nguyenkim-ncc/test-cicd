import * as Sentry from '@sentry/react'
import { Integrations as TracingIntegrations } from '@sentry/tracing'
import { createBrowserHistory } from 'history'
import { upperFirst } from 'lodash'

const isLocal = process.env.NODE_ENV === 'development'

const { REACT_APP_GRAPHQL } = process.env as Record<string, string>

const history = createBrowserHistory()

export function initSentry() {
  if (isLocal) {
    return
  }

  Sentry.init({
    dsn: process.env.REACT_APP_DSN,
    sampleRate: 0.05,
    environment: process.env.NODE_ENV,
    tracesSampleRate: 0.05,
    integrations: [
      new TracingIntegrations.BrowserTracing({
        routingInstrumentation: Sentry.reactRouterV5Instrumentation(history),
        tracingOrigins: [REACT_APP_GRAPHQL, /^\//],
        idleTimeout: 20000,
      }),
    ],
    beforeBreadcrumb: (breadcrumb, hint?) => {
      const graphQLStringQuery = (hint?.input || [])[1]?.body
      const graphQLQuery = graphQLStringQuery && JSON.parse(graphQLStringQuery)
      const subUrl =
        graphQLQuery && breadcrumb.data?.url === REACT_APP_GRAPHQL
          ? graphQLQuery?.operationName ||
            graphQLQuery?.query?.split('{')?.[1]?.replace('\n', '').trim()
          : ''
      return {
        ...breadcrumb,
        data: { ...breadcrumb.data, url: breadcrumb.data?.url + `/${upperFirst(subUrl)}` },
      }
    },
  })
  // TODO: await solution edit span description sent to ilum
  // Sentry.addGlobalEventProcessor((event, hint) => {
  //   return {
  //     ...event,
  //     spans: event.spans?.map(span => {
  //       if (span?.op === 'http.client') {
  //         const query =
  //           event?.breadcrumbs?.find(e => e?.data?.__span === span?.spanId)?.data?.url ||
  //           span?.data?.url
  //         return {
  //           ...span,
  //           description: span?.data?.method + ' ' + query,
  //         }
  //       }
  //       return span
  //     }),
  //   }
  // })
}

export function logError(error: any, errorInfo: any = null) {
  if (isLocal) {
    return
  }

  Sentry.withScope(scope => {
    errorInfo && scope.setExtras(errorInfo)
    Sentry.captureException(error)
  })
}

export function onError(error: any) {
  if (isLocal) {
    console.log(error)
    return
  }

  let errorInfo = {
    url: undefined,
  }

  if (!(error instanceof Error) && error.message) {
    errorInfo = error
    error = new Error(error.message)
  } else if (error.config && error.config.url) {
    errorInfo.url = error.config.url
  }

  logError(error, errorInfo)
}
