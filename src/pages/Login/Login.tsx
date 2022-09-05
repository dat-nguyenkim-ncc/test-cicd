import React, { useCallback } from 'react'
import { Redirect } from 'react-router-dom'
import { useOktaAuth } from '@okta/okta-react'
import OktaSignInWidget from './OktaSignInWidget'
import { Routes } from '../../types/enums'

type Props = {
  issuer: string
}

const SignIn = ({ issuer }: Props) => {
  const { authState, authService } = useOktaAuth()

  const onSuccess = useCallback(
    res => {
      authService.redirect({ sessionToken: res.session.token })
    },
    [authService]
  )

  if (typeof authState.isAuthenticated  !== 'boolean') return null // prevent render OktaSignInWidget at the 1st render
  return authState.isAuthenticated ? (
    <Redirect to={{ pathname: Routes.SEARCH }} />
  ) : (
    <OktaSignInWidget baseUrl={issuer} onSuccess={onSuccess} onError={authState.onError} />
  )
}

export default SignIn
