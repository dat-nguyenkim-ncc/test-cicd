import { useEffect, useState, useCallback, SetStateAction, Dispatch } from 'react'
import {
  ApolloClient,
  ApolloLink,
  createHttpLink,
  InMemoryCache,
  NormalizedCacheObject,
} from '@apollo/client'
import { setContext } from '@apollo/client/link/context'
import { useOktaAuth } from '@okta/okta-react'
import graphQLConfig from '../../config/graphql'
import { typePolicies } from '.'
import { SentryLink, SentryLinkOptions } from 'apollo-link-sentry'

const SENTRY_OPTIONS = {
  setFingerprint: true,
  setTransaction: true,

  attachBreadcrumbs: {
    includeQuery: true,
    includeError: true,
  },
} as SentryLinkOptions

type TClient = ApolloClient<NormalizedCacheObject> | null
type TSetClient = Dispatch<SetStateAction<TClient | null>>

export default function useApolloClient(): {
  client: TClient
  setClient: TSetClient
} {
  const { authService } = useOktaAuth()
  const [client, setClient] = useState<TClient>(null)

  const getToken = useCallback(async () => {
    const authLink = setContext((_, { headers }) => {
      return authService.getAccessToken().then((token: string) => ({
        headers: {
          ...headers,
          Authorization: token ? `Bearer ${token}` : '',
        },
      }))
    })

    const client = new ApolloClient({
      link: ApolloLink.from([
        authLink,
        createHttpLink({
          uri: graphQLConfig.url,
        }),
        new SentryLink(SENTRY_OPTIONS),
      ]),
      cache: new InMemoryCache({
        typePolicies,
      }),
      credentials: 'include',
    })

    setClient(client)
  }, [authService])

  useEffect(() => {
    getToken()
  }, [getToken])

  return { client, setClient }
}
