import { Box, Flex, Input, Label } from '@theme-ui/components'
import React, { useEffect, useRef, useState } from 'react'
import { Button, Checkbox, Icon, Updating } from '..'
import { ChangeFieldEvent, FieldProps, FormOption, Variants, ViewInterface } from '../../types'
import { Paragraph } from '../primitives'
import { labelColorMapVariants } from '../TextField/TextField'
import { Palette } from '../../theme'

export type MultipleAutocompleteProps = ViewInterface<
  FieldProps<{
    state: FormOption[]
    options: FormOption[]
    colorInput?: string
    variant?: Variants
    fetchRequested(value: string): void
    loading?: boolean
  }>
>

let timer: any

const MultipleAutocomplete = ({
  label,
  name,
  state,
  placeholder,
  options,
  disabled,
  sx,
  value,
  colorInput,
  variant,
  loading,
  onChange,
  onBlur,
  viewHistory,
  fetchRequested,
}: MultipleAutocompleteProps) => {
  const [isOpen, setIsOpen] = useState<boolean>(false)
  const [searchText, setSearchText] = useState<string>('')
  const myRef = useRef<HTMLInputElement | null>(null)

  useEffect(() => {
    if (isOpen && myRef.current) {
      myRef.current.scrollIntoView({ block: 'end' })
    }
  }, [isOpen, options, loading])

  const onChangeField = (e: ChangeFieldEvent) => {
    const { value } = e.target
    clearTimeout(timer)
    if (value !== searchText) {
      timer = setTimeout(() => {
        fetchRequested(value)
      }, 500)
    }
    setSearchText(e.target.value)
  }

  const onCheck = (item: FormOption) => {
    const cloneState = [...state]
    cloneState.push(item)
    onChange(cloneState)
  }

  const onRemove = (item: FormOption) => {
    const cloneState = [...state].filter(({ value }) => item.value !== value)
    onChange(cloneState)
  }

  const onClear = () => {
    onChange([])
  }

  return (
    <>
      <Box
        sx={{
          pointerEvents: disabled ? 'none' : 'visible',
          opacity: disabled ? 0.5 : 1,
          ...sx,
        }}
      >
        {label && (
          <Flex>
            <Label
              sx={{ color: labelColorMapVariants[variant || 'black'], flex: 1 }}
              htmlFor={name}
            >
              {label}
            </Label>
          </Flex>
        )}
        <>
          <Flex
            sx={{
              justifyContent: 'space-between',
              width: '100%',
              minHeight: 42,
              borderRadius: 10,
              bg: 'gray03',
              cursor: 'text',
            }}
            onClick={() => {
              setIsOpen(!isOpen)
            }}
          >
            <Flex
              sx={{
                flexWrap: 'wrap',
                alignItems: 'center',
                width: '100%',
                borderRadius: 10,
                px: 1,
                my: 1,
              }}
            >
              {!state.length && placeholder && <Paragraph sx={{ pl: 4 }}>{placeholder}</Paragraph>}
              {state.map((item, index) => (
                <Flex
                  key={index}
                  sx={{
                    mx: 1,
                    my: '2px',
                    py: 2,
                    px: 3,
                    borderRadius: 24,
                    bg: 'gray02',
                    alignItems: 'center',
                  }}
                >
                  <Paragraph>{item.label}</Paragraph>
                  <Box
                    sx={{ ml: 2, cursor: 'pointer' }}
                    onClick={e => {
                      e.stopPropagation()
                      onRemove(item)
                    }}
                  >
                    <Icon
                      icon="remove"
                      size="tiny"
                      color="white"
                      iconSize={10}
                      background="black50"
                    />
                  </Box>
                </Flex>
              ))}
            </Flex>
            <Flex sx={{ alignItems: 'center' }}>
              {!!state.length && (
                <Box
                  sx={{ mr: 2, cursor: 'pointer' }}
                  onClick={e => {
                    e.stopPropagation()
                    onClear()
                  }}
                >
                  <Icon icon="remove" />
                </Box>
              )}
              <Icon sx={{ mr: 2 }} icon={isOpen ? 'indicatorUp' : 'indicatorDown'} />
            </Flex>
          </Flex>
          {isOpen && (
            <Box
              ref={myRef}
              id="box"
              sx={{
                width: 360,
                p: 3,
                border: `solid 1px ${Palette.gray04}`,
                borderRadius: 10,
                mt: 1,
                bg: 'white',
              }}
            >
              <form
                onSubmit={e => {
                  e.preventDefault()
                }}
              >
                <Flex
                  sx={{
                    backgroundColor: 'gray06',
                    borderRadius: 10,
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    paddingY: 2,
                    paddingX: 2,
                    mb: 1,
                    // ...sx,
                  }}
                >
                  <Button
                    icon="search"
                    size="small"
                    onPress={() => {}}
                    color="darkGray"
                    sx={{
                      backgroundColor: 'transparent',
                      color: 'transparent',
                      borderColor: 'transparent',
                    }}
                  />
                  <Input
                    sx={{ py: 0, px: 2, bg: 'transparent' }}
                    name="search"
                    type="search"
                    placeholder="Search..."
                    onChange={onChangeField}
                    value={searchText}
                  />
                </Flex>
              </form>
              <Box sx={{ maxHeight: 340, overflowY: 'auto' }}>
                {loading ? (
                  <Updating loading sx={{ py: 4 }} />
                ) : (
                  options.map((o, index) => {
                    const isCheck = state.some(({ value }) => value === o.value)
                    return (
                      <Checkbox
                        key={index}
                        checked={isCheck}
                        sx={{ p: 1 }}
                        label={o.label}
                        square
                        onPress={() => {
                          if (isCheck) {
                            onRemove(o)
                          } else onCheck(o)
                        }}
                      />
                    )
                  })
                )}
              </Box>
            </Box>
          )}
        </>
      </Box>
    </>
  )
}
export default MultipleAutocomplete
