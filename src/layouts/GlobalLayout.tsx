import React, { PropsWithChildren } from 'react'
import { Redirect, useHistory, useLocation } from 'react-router-dom'
import { useOktaAuth } from '@okta/okta-react'
import { Header, Updating, Link } from '../components'
import { Grid } from '../components/primitives'
import strings from '../strings'
import { Routes } from '../types/enums'
import { ContextProviders, UserContext } from '../context'
import { ApolloRouteProvider } from '../providers'
import { menuLinks } from '../routers'
import { isGrantedPermissions } from '../utils'
import { analysisMenu, coverageMenu, managementMenu } from '../routers/routes'
import { MENU_TITLE } from '../utils/consts'

const GlobalLayout = ({ children }: PropsWithChildren<{}>) => {
  const { authState, authService } = useOktaAuth()
  const location = useLocation()
  const history = useHistory()

  if (authState.isPending) return <Updating loading />
  if (!authState.isAuthenticated) return <Redirect to={{ pathname: '/login' }} />

  const { header: copy } = strings

  const onClickHeader = () => history.push(Routes.SEARCH)

  return (
    <>
      <ApolloRouteProvider>
        <ContextProviders>
          <UserContext.Consumer>
            {({ user }) => (
              <Header
                onClickHeader={onClickHeader}
                onClickLogout={authService.logout}
                active={menuLinks.find(l => location.pathname.includes(l.to))?.key || ''}
                links={menuLinks
                  .filter(
                    l => ![...coverageMenu, ...managementMenu, ...analysisMenu].includes(l.key)
                  )
                  .map(l => (
                    <Link key={l.key} to={l.to} sx={{ '&:focus': { color: 'white' } }}>
                      {copy[l.key as keyof typeof copy]}
                    </Link>
                  ))}
                menus={[
                  {
                    title: MENU_TITLE.Coverage,
                    menu: menuLinks
                      .filter(
                        l =>
                          coverageMenu.includes(l.key) &&
                          isGrantedPermissions({ permissions: l.permissions }, user)
                      )
                      .map(l => (
                        <Link
                          sx={{ py: 16 }}
                          key={l.key}
                          to={l.to}
                          onClick={l.action || (() => {})}
                        >
                          {copy[l.key as keyof typeof copy]}
                        </Link>
                      )),
                  },
                  {
                    title: MENU_TITLE.Analysis,
                    menu: menuLinks
                      .filter(
                        l =>
                          analysisMenu.includes(l.key) &&
                          isGrantedPermissions({ permissions: l.permissions }, user)
                      )
                      .map(l => (
                        <Link
                          sx={{ py: 16 }}
                          key={l.key}
                          to={l.to}
                          onClick={l.action || (() => {})}
                        >
                          {copy[l.key as keyof typeof copy]}
                        </Link>
                      )),
                  },
                  {
                    title: MENU_TITLE.Management,
                    menu: menuLinks
                      .filter(
                        l =>
                          managementMenu.includes(l.key) &&
                          isGrantedPermissions({ permissions: l.permissions }, user)
                      )
                      .map(l => (
                        <Link
                          sx={{ py: 16 }}
                          key={l.key}
                          to={l.to}
                          onClick={l.action || (() => {})}
                        >
                          {copy[l.key as keyof typeof copy]}
                        </Link>
                      )),
                  },
                ]}
              />
            )}
          </UserContext.Consumer>
          <Grid sx={{ py: 6 }}>{children}</Grid>
        </ContextProviders>
      </ApolloRouteProvider>
    </>
  )
}

export default GlobalLayout
