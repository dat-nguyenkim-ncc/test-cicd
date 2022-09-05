import React from 'react'
import { IFieldFormat } from '../../types'
import { IValidators, validate } from './validation'

export type IValue = string
export type IValues<K extends string> = Record<K, IValue>

export interface IFormElement {
  value: IValue
  isValid: boolean
  isTouched?: boolean
  validators?: IValidators
  format?: IFieldFormat
  disabled?: boolean
}

export interface IForm<K extends string> {
  controls: {
    [c in K]: IFormElement
  }
}

interface IAction<K> extends Omit<IFormElement, 'isValid' | 'isTouched' | 'value'> {
  id: K
  type: string
  value?: IValue
}

function FormReducer<K extends string>(state: IForm<K>, action: IAction<K>): IForm<K> {
  const control = state.controls[action.id as K]

  switch (action.type) {
    case 'change': {
      if (control.disabled) return state

      return {
        ...state,
        controls: {
          ...state.controls,
          [action.id]: {
            ...state.controls[action.id as K],
            value: action.value,
            isValid: validate(action.value || '', action.validators, action.format),
          },
        },
      }
    }
    case 'touch': {
      return {
        ...state,
        controls: {
          ...state.controls,
          [action.id]: {
            ...state.controls[action.id as K],
            isTouched: true,
            value:
              typeof action.value === 'string'
                ? action.value?.trim() || action.value
                : action.value,
            isValid: validate(action.value || '', action.validators, action.format),
          },
        },
      }
    }
    default: {
      return state
    }
  }
}

function useForm<K extends string>(initialState: IForm<K>): IUseForm<K> {
  const [state, _dispatch] = React.useReducer<React.Reducer<IForm<K>, IAction<K>>>(
    FormReducer,
    initialState
  )

  const dispatch = (action: Pick<IAction<K>, 'value' | 'type' | 'id'>) => {
    _dispatch({
      ...action,
      format: state.controls[action.id].format,
      validators: state.controls[action.id].validators,
    })
  }

  const invalid = () => {
    const invalid = Object.values<IFormElement>(state.controls).some(c => {
      return !validate(c.value, c.validators, c.format)
    })
    return invalid
  }

  const getValue = (): IValues<K> => {
    const { controls } = state
    return Object.keys(controls).reduce((value, key) => {
      return { ...value, [key]: controls[key as K].value }
    }, {} as IValues<K>)
  }

  return {
    state,
    dispatch,
    invalid,
    getValue,
  }
}

export default useForm

export type IUseForm<K extends string> = {
  state: IForm<K>
  dispatch(action: Pick<IAction<K>, 'value' | 'type' | 'id'>): void
  invalid(): boolean
  getValue(): IValues<K>
}
