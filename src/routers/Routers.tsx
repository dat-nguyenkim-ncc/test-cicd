import React from 'react'
import { Route } from 'react-router'
import { SecureRoute } from '@okta/okta-react'
import { UserContext } from '../context'
import { routes } from './routes'
import { isGrantedPermissions } from '../utils'

export default function Routers() {
  const { user } = React.useContext(UserContext)

  if (!user?.id) return null
  return (
    <>
      {routes.map(r => (
        <React.Fragment key={r.path}>
          {r.insecured ? (
            <Route path={r.path} exact component={r.component} />
          ) : isGrantedPermissions(r, user) ? (
            <SecureRoute path={r.path} exact component={r.component} />
          ) : null}
        </React.Fragment>
      ))}
    </>
  )
}
