import { checkLength } from '.'
import { ProfileEditType } from '../components/ProfileForm'
import { FieldStates } from '../types'
import { compareString } from './helper'

export const maxProfileLength = 4000

const validate = (state: string[], editState: ProfileEditType[]) => (
  value: string,
  maxlength: number = maxProfileLength
): keyof FieldStates => {
  const mergeState = [...state, ...(editState || []).map(({ profile_value }) => profile_value)]
  const isDuplicated = mergeState.filter(v => compareString(value, v))?.length > 1

  if (!value?.length) return 'default'
  if (checkLength(value, maxlength) || isDuplicated) return 'error'
  return 'default'
}

export default validate
