import React, { useState } from 'react'
import { Flex } from '@theme-ui/components'
import { Button, Chips, TextField } from '../../../components'
import { ChangeFieldEvent, ViewInterface } from '../../../types'

type SearchBoxProps = ViewInterface<{
  onPress?(e: string): void
  onChange?(value: string): void
  onClose?(value: string): void
  placeholder?: string
  state?: string[]
  disabled?: boolean
  fullWidth?: boolean
}>

let timer: any

const SearchBox = ({
  onPress,
  onChange,
  onClose,
  placeholder,
  sx,
  state,
  disabled,
  fullWidth,
}: SearchBoxProps) => {
  const [searchText, setSearchText] = useState<string>('')

  const onChangeField = (e: ChangeFieldEvent) => {
    const { value } = e.target
    clearTimeout(timer)
    if (value !== searchText) {
      timer = setTimeout(() => {
        onChange && onChange(value)
      }, 500)
    }
    setSearchText(e.target.value)
  }

  return (
    <>
      <form
        style={fullWidth ? { width: '100%' } : {}}
        onSubmit={e => {
          e.preventDefault()
          // onPress(searchText)
        }}
      >
        <Flex
          sx={{
            backgroundColor: 'gray03',
            borderRadius: 10,
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingY: 2,
            paddingX: 2,
            mb: 1,
            ...sx,
          }}
        >
          <Button
            icon="search"
            size="small"
            onPress={() => {
              if (!disabled && searchText.length > 1) {
                if (onPress) {
                  onPress(searchText)
                  setSearchText('')
                }
              }
            }}
            color="darkGray"
            sx={{
              backgroundColor: 'transparent',
              color: 'transparent',
              borderColor: 'transparent',
            }}
          />
          <TextField
            sx={{ py: 0, px: 2, bg: 'transparent' }}
            name="search"
            type="search"
            placeholder={placeholder}
            onChange={onChangeField}
            size="normal"
            value={searchText}
            disabled={disabled}
          />
        </Flex>
      </form>
      {state && (
        <Flex sx={{ flexWrap: 'wrap' }}>
          {state.map((item, index) => (
            <Chips
              key={index}
              label={item}
              onClose={() => {
                onClose && onClose(item)
              }}
              disabled={disabled}
            />
          ))}
        </Flex>
      )}
    </>
  )
}
export default SearchBox
