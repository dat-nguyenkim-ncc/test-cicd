import React from 'react'
import { Route, useHistory } from 'react-router-dom'
import { Security, LoginCallback } from '@okta/okta-react'
import { Login } from './pages'
import config from './config/auth'
import { ETLRunTime, GlobalLayout, InactiveTimer } from './layouts'
import { Routers } from './routers'

const OktaAuthRouter = () => {
  const history = useHistory()

  const onAuthRequired = () => {
    history.push('/login')
  }

  return (
    <Security
      {...config}
      redirectUri={window.location.origin + '/implicit/callback'}
      onAuthRequired={onAuthRequired}
    >
      <GlobalLayout>
        <ETLRunTime>
          <InactiveTimer>
            <Routers />
          </InactiveTimer>
        </ETLRunTime>
      </GlobalLayout>

      <Route path="/login" render={() => <Login issuer={config.issuer} />} />
      <Route path="/implicit/callback" component={LoginCallback} />
    </Security>
  )
}
export default OktaAuthRouter
