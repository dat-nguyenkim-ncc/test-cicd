import React, { PropsWithChildren } from 'react'
import { useOktaAuth } from '@okta/okta-react'
import { useApolloClient } from '../../hooks/auth'
import { ApolloProvider } from '@apollo/client'

const ApolloRouteProvider = ({ children }: PropsWithChildren<{}>) => {
  const { authState } = useOktaAuth()

  const { client } = useApolloClient()

  if (!client) {
    return null
  }

  return authState.isAuthenticated && <ApolloProvider client={client}>{children}</ApolloProvider>
}

export default ApolloRouteProvider
