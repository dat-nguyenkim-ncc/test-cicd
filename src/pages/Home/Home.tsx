import React from 'react'
import { Redirect } from 'react-router-dom'
import { useOktaAuth } from '@okta/okta-react'
import { Updating } from '../../components'
import { Routes } from '../../types/enums'

const Home = () => {
  const { authState } = useOktaAuth()

  if (authState.isPending) {
    return <Updating loading />
  }

  return authState.isAuthenticated ? (
    <Redirect to={{ pathname: Routes.SEARCH }} />
  ) : (
    <Redirect to={{ pathname: '/login' }} />
  )
}
export default Home
