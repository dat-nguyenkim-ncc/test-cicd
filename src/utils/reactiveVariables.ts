import { makeVar } from '@apollo/client'
import { LogoState } from '../pages/CompanyForm/CompanyForm'
import { FileState } from '../types'

export const $attachment = makeVar<FileState[]>([])
export const $logoUrl = makeVar<LogoState | undefined>(undefined)
