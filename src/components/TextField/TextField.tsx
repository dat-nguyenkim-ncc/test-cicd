import React, { useEffect, useRef, useState } from 'react'
import { Label, Input, Textarea, Flex, Box, SxStyleProp } from 'theme-ui'
import { Tooltip } from '..'
import strings from '../../strings'
import {
  ChangeFieldEvent,
  FieldProps,
  FieldStates,
  MapVariantToColor,
  MapVariantToSize,
  Size,
  Variants,
  ViewInterface,
} from '../../types'
import ButtonText from '../ButtonText'
import Icon, { IconProps } from '../Icon'
import { Paragraph } from '../primitives'

export type FieldTypes = 'textarea' | 'input' | 'search' | 'dropdown' | 'file'

export type TextFieldProps = FieldProps<
  ViewInterface<{
    variant?: Variants
    required?: boolean
    type?: FieldTypes
    size?: Size
    formattedValue?: string
    error?: string
    tooltipError?: string
    colorInput?: string
    labelSx?: SxStyleProp
    inputId?: string
    defaultTouched?: boolean
  }>
>

export const labelColorMapVariants: MapVariantToColor = {
  primary: 'primary',
  error: 'red',
  black: 'text',
  outline: 'darkGray',
  outlineWhite: 'darkGray',
  muted: 'darkGray',
  secondary: 'secondary',
  invert: 'secondary',
}

const fieldStates: FieldStates = {
  default: null,
  validated: {
    icon: 'tick',
    size: 'small',
    background: 'primary',
    color: 'white',
  },
  error: {
    icon: 'alert',
    size: 'small',
    background: 'red',
    color: 'white',
  },
}

export const sizeStyle = (size: Size): SxStyleProp => {
  const sizes: MapVariantToSize = {
    big: { fontSize: 2 },
    small: { fontSize: 22 },
    tiny: { fontSize: 18, borderRadius: 5 },
    normal: { fontSize: 'inherit' },
  }

  return sizes[size] as SxStyleProp
}
const TextField = ({
  placeholder,
  required = false,
  label,
  name,
  variant = 'black',
  onChange,
  onBlur,
  value,
  formattedValue,
  defaultValue,
  fieldState,
  disabled,
  type = 'input',
  error,
  size,
  sx,
  id,
  inputId,
  colorInput,
  maxLength,
  tooltipError,
  defaultTouched,
  viewHistory,
  ...props
}: TextFieldProps) => {
  const FieldType = type === 'textarea' ? Textarea : Input
  const fontSizeSx = size ? sizeStyle(size) : null

  const isFirstRun = useRef(true)

  const [isTouched, setIsTouched] = React.useState(!!value || defaultTouched)

  const [internalState, setInternalState] = useState<
    string | ReadonlyArray<string> | number | undefined
  >(formattedValue || value)

  useEffect(() => {
    if (isFirstRun.current) {
      setInternalState(formattedValue || value)
      isFirstRun.current = false
      return
    }
    setInternalState(value)
  }, [value, formattedValue])

  const onFocus = () => {
    setInternalState(value)
    setIsTouched(true)
  }
  const onBlurField = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setInternalState(formattedValue || value)
    onBlur && onBlur(name, e)
  }

  const onInput = (event: ChangeFieldEvent) => {
    setInternalState(event.target.value)
    onChange(event)
  }

  return (
    <Box sx={{ flex: 1, scrollMarginBottom: 5, opacity: disabled ? 0.5 : 1, ...sx }} id={id}>
      <Flex>
        {label && (
          <Label
            sx={{ color: labelColorMapVariants[variant], flex: 1, ...props.labelSx }}
            htmlFor={name}
          >
            {label}
            {required ? '*' : ''}
            {error && (
              <Paragraph bold sx={{ ml: 3, color: 'red' }}>
                {error}
              </Paragraph>
            )}
          </Label>
        )}
        {viewHistory && (
          <ButtonText
            onPress={(event: MouseEvent) => {
              if (disabled) return
              viewHistory()
              event.stopPropagation()
            }}
            label={strings.common.viewHistory}
            sx={{ borderBottom: 0 }}
          />
        )}
      </Flex>
      <Flex sx={{ alignItems: 'center' }}>
        <FieldType
          variant={`forms.${type}`}
          sx={fontSizeSx}
          id={inputId}
          autoComplete="off"
          autoCorrect="off"
          required={required}
          defaultValue={defaultValue}
          value={internalState}
          onChange={onInput}
          name={name}
          placeholder={placeholder}
          disabled={disabled}
          onBlur={onBlurField}
          onFocus={onFocus}
          backgroundColor={colorInput || ''}
          maxLength={maxLength}
        />
        {fieldState && fieldState !== 'default' && isTouched && (
          <Box px={3}>
            <Tooltip content={tooltipError || ''} isShow={true} disabled={!tooltipError}>
              <Icon {...(fieldStates[fieldState] as IconProps)} />
            </Tooltip>
          </Box>
        )}
      </Flex>
    </Box>
  )
}

export default TextField
