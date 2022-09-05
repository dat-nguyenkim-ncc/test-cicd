import React from 'react'
import { gql, useQuery } from '@apollo/client'
import { UserContext } from '.'
import { useOktaAuth } from '@okta/okta-react'
import { IUser } from './UserContext'
import { Updating } from '../components'

const GET_USER_INFO = gql`
  query {
    getUserInfo {
      id
      email
      groups {
        id
        name
        description
      }
    }
  }
`

export default function ContextProviders(props: any) {
  const { authState } = useOktaAuth()
  const { data } = useQuery<{ getUserInfo: IUser }>(GET_USER_INFO, {
    skip: !authState.isAuthenticated,
  })

  if (!data?.getUserInfo) return <Updating loading />
  return (
    <>
      <UserContext.Provider value={{ user: data.getUserInfo }}>
        {props.children}
      </UserContext.Provider>
    </>
  )
}
