import React, { ChangeEvent, useState, useEffect } from 'react'
import { Flex } from 'theme-ui'
import { Size, ViewInterface } from '../../types'
import { Button, TextField } from '../'
import { TextFieldProps } from '../TextField/TextField'

export type SearchProps = ViewInterface<{
  size?: Size
  placeholder?: string
  value?: string
  onChange(value?: string): void
  onSearch(): void
  bindValue?: boolean
  inputId?: string
  backgroundColor?: string
}> &
  Pick<TextFieldProps, 'onBlur'>

const Search = ({
  value = '',
  placeholder,
  size = 'normal',
  sx,
  onChange,
  onSearch,
  onBlur,
  bindValue,
  inputId,
  backgroundColor
}: SearchProps) => {
  const [state, setState] = useState<string>(value)

  const onChangeField = (e: ChangeEvent<HTMLInputElement>) => {
    setState(e.currentTarget.value)
    onChange(e.currentTarget.value)
  }

  useEffect(() => {
    if (bindValue) setState(value)
  }, [value, bindValue])

  return (
    <Flex
      sx={{
        backgroundColor: backgroundColor || 'background',
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingY: size === 'big' ? 7 : 3,
        ...sx,
      }}
    >
      <TextField
        id={inputId}
        sx={{ mr: 5 }}
        onChange={onChangeField}
        onBlur={onBlur}
        value={state}
        name="search"
        type="search"
        size={size}
        placeholder={placeholder}
      />
      <Button
        icon="search"
        size={size === 'small' ? 'normal' : size}
        onPress={onSearch}
        disabled={!(state && state.length >= 2)}
      />
    </Flex>
  )
}

export default Search
