import React from 'react'
import { EnumUserGroups } from '../types/enums'

export const isOverrideUserFn = (user: IUser) =>
  !!user.groups?.every(i => i.name !== EnumUserGroups.KT)

export interface IUser {
  id: string
  email: string
  groups: Array<{
    id: string
    name: string
    description: string
  }>
}

export interface IUserContext {
  user: IUser
}

const UserContext = React.createContext<IUserContext>({
  user: {} as IUser,
})

export default UserContext
