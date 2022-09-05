import React from 'react'
import { uniq } from '../utils'

export type SelectionModel<T> = {
  selectionList: T[]
  select(value: T | T[]): void
  deselect(value: T | T[]): void
  isSelected(value: T): boolean
  toggleSelect(value: T): void
  reset(): void
  find(value: T): T | undefined
}

function useSelection<T>(
  init: T[] = [],
  getValue: (item: T) => any = item => item
): SelectionModel<T> {
  const [list, _setList] = React.useState<T[]>(init)
  const setList = (list: T[]) => {
    _setList(uniq(list, getValue))
  }

  const select = (value: T | T[]) => setList([...list, ...(Array.isArray(value) ? value : [value])])
  const deselect = (value: T | T[]) => {
    setList(
      [...list].filter(i => {
        return Array.isArray(value)
          ? !value.map(getValue).includes(getValue(i))
          : getValue(value) !== getValue(i)
      })
    )
  }
  const isSelected = (value: T) => list.map(getValue).includes(getValue(value))
  const toggleSelect = (value: T) => (isSelected(value) ? deselect(value) : select(value))
  const reset = () => setList([])
  const find = (value: T): T | undefined => list.find(i => getValue(i) === getValue(value))

  return {
    selectionList: list,
    select,
    deselect,
    isSelected,
    toggleSelect,
    reset,
    find,
  }
}

export default useSelection
