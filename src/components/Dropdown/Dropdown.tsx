import React from 'react'
import { Box, Flex, Label, Select } from 'theme-ui'
import { ButtonText, Tooltip } from '..'
import strings from '../../strings'
import { FieldProps, FormOption, MapVariantToColor, Variants, ViewInterface } from '../../types'
import Icon, { IconProps } from '../Icon'

export type DropdownProps = ViewInterface<
  FieldProps<{
    options: FormOption[]
    colorInput?: string
    variant?: Variants
    minWidth?: number
    defaultTouched?: boolean
    bg?: string
    clearable?: boolean
    error?: string
    hideArrow?: boolean
    onClear?(e: React.MouseEvent<HTMLElement>): void
  }>
>

const labelColorMapVariants: MapVariantToColor = {
  primary: 'primary',
  error: 'red',
  black: 'text',
  outline: 'darkGray',
  outlineWhite: 'darkGray',
  muted: 'darkGray',
  secondary: 'secondary',
  invert: 'secondary',
}

const Dropdown = ({
  label,
  name,
  placeholder,
  options,
  disabled,
  sx,
  value,
  colorInput,
  variant,
  minWidth = 150,
  clearable = false,
  onClear,
  onChange,
  onBlur,
  viewHistory,
  defaultTouched,
  error,
  hideArrow = false,
  ...props
}: DropdownProps) => {
  const [isTouched, setIsTouched] = React.useState(!!value || defaultTouched)
  return (
    <>
      <Box
        sx={{
          pointerEvents: disabled ? 'none' : 'visible',
          opacity: disabled ? 0.5 : 1,
          position: 'relative',
          ...sx,
        }}
      >
        {clearable && !!value && (
          <Box
            sx={{
              position: 'absolute',
              right: 5,
              top: '50%',
              transform: 'translateY(-50%)',
              cursor: disabled ? 'not-allowed' : 'pointer',
              fontSize: '85%',
            }}
            onClick={onClear}
          >
            &#x2716;
          </Box>
        )}

        <Flex>
          {label && (
            <Label
              sx={{ color: labelColorMapVariants[variant || 'black'], flex: 1, ...props.labelSx }}
              htmlFor={name}
            >
              {label}
              {props.required ? '*' : ''}
            </Label>
          )}
          {viewHistory && (
            <ButtonText
              onPress={(event: MouseEvent) => {
                viewHistory()
                event.stopPropagation()
              }}
              label={strings.common.viewHistory}
              sx={{ borderBottom: 0 }}
            />
          )}
        </Flex>
        <Flex sx={{ alignItems: 'center' }}>
          <Box sx={{ flex: '1 1 auto' }}>
            <Select
              sx={{
                minWidth,
                bg: props.bg,
                '& + svg': hideArrow
                  ? {
                      display: 'none',
                    }
                  : {},
              }}
              onChange={onChange}
              onBlur={e => onBlur && onBlur(name)}
              onFocus={() => setIsTouched(true)}
              name={name}
              value={value}
              defaultValue={placeholder}
              backgroundColor={colorInput || ''}
            >
              <option value="" hidden>
                {placeholder || 'Select'}
              </option>
              {options.map((o, index) => (
                <option key={index} value={o.value}>
                  {o.label}
                </option>
              ))}
            </Select>
          </Box>

          {variant === 'error' && isTouched && (
            <Box px={3}>
              <Tooltip
                content={error || ''}
                isShow={true}
                disabled={!error}
                contentSx={{ pointerEvents: 'auto' }}
              >
                <Icon
                  {...({
                    icon: 'alert',
                    size: 'small',
                    background: 'red',
                    color: 'white',
                  } as IconProps)}
                />
              </Tooltip>
            </Box>
          )}
        </Flex>
      </Box>
    </>
  )
}

export default Dropdown
