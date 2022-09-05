import { IUser } from '../context/UserContext'

export default function isGrantedPermissions(r: { permissions?: string[] }, user: IUser) {
  if (!r.permissions?.length) return true
  const groups = user.groups?.map(g => g.name) || []
  return r.permissions.some(p => groups.includes(p))
}
