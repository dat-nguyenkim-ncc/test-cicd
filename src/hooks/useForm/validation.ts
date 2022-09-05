import { IFieldFormat } from '../../types'

enum VALIDATION_TYPE {
  REQUIRED = 'REQUIRED',
  LENGTH = 'LENGTH',
  PATTERN = 'URL',
}

export type IValidator<T extends Object> = { type: VALIDATION_TYPE } & T
export type IValidators = Array<
  IValidator<{ min?: number; max?: number; pattern?: string | RegExp }>
>

export const VALIDATION_REQUIRED = () => ({
  type: VALIDATION_TYPE.REQUIRED,
})

export const VALIDATION_LENGTH = (min: number, max: number) => ({
  type: VALIDATION_TYPE.LENGTH,
  min,
  max,
})

export const VALIDATON_PATTERN = (pattern: string | RegExp) => ({
  type: VALIDATION_TYPE.PATTERN,
  pattern,
})

export const validate = (
  value: string | number,
  validators: IValidators | undefined,
  format?: IFieldFormat
) => {
  let isValid = format ? !format(value)?.toUpperCase()?.includes('INVALID') : true

  if (validators) {
    validators.forEach(validator => {
      if (validator.type === VALIDATION_TYPE.REQUIRED) {
        isValid =
          isValid &&
          (typeof value === 'string'
            ? value.trim().length > 0
            : typeof value === 'number'
            ? !!value || value === 0
            : !!value)
      }

      if (validator.type === VALIDATION_TYPE.LENGTH) {
        isValid =
          isValid &&
          (typeof value === 'string'
            ? value.trim().length >= validator.min! && value.trim().length <= validator.max!
            : true)
      }

      if (validator.type === VALIDATION_TYPE.PATTERN) {
        if (value) {
          isValid =
            isValid && (typeof value === 'string' ? !!value.match(validator.pattern || '') : false)
        }
      }
    })
  }

  return isValid
}
