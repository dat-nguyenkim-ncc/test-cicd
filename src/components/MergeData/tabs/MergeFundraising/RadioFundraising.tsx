import React from 'react'
import { Box, Flex, Grid } from 'theme-ui'
import { Palette } from '../../../../theme'
import { FundraisingDTOResult } from '../../../../pages/CompanyForm/Fundraising'
import { MapVariantToSize, Size, ViewInterface } from '../../../../types'
import { Paragraph } from '../../../primitives'
import strings from '../../../../strings'

const {
  pages: { fundraising: copy },
} = strings

type FundraisingItemProps = {
  fundraising: FundraisingDTOResult
}

export type RadioFundraisingProps = ViewInterface<{
  selected?: boolean
  value?: string
  size?: Size
  disabled?: boolean
  onClick?(value: string): void
  itemProps: FundraisingItemProps
  renderFundraising?(props: FundraisingItemProps): React.ReactElement
}>

const sizes: MapVariantToSize = {
  big: 80,
  small: 24,
  tiny: 16,
  normal: 40,
}

const RadioFundraising = ({
  selected,
  value,
  sx,
  size,
  disabled,
  onClick,
  itemProps,
  renderFundraising = (props: FundraisingItemProps) => <FundraisingItem {...props} />,
}: RadioFundraisingProps) => {
  const onClickRadioFundraising = () => {
    onClick && onClick(value || '')
  }

  return (
    <Flex
      sx={{
        alignItems: 'center',
        cursor: disabled ? undefined : 'pointer',
        opacity: disabled ? 0.5 : 1,
        border: '1px solid',
        borderColor: Palette.gray01,
        borderRadius: 10,
        mb: 2,
        ...sx,
      }}
      onClick={() => {
        !disabled && onClickRadioFundraising()
      }}
    >
      <Box
        sx={{
          borderWidth: 1,
          borderStyle: 'solid',
          borderColor: selected ? 'primary' : 'gray04',
          width: size ? sizes[size] : sizes.small,
          height: size ? sizes[size] : sizes.small,
          minWidth: size ? sizes[size] : sizes.small,
          borderRadius: '100%',
          mx: 3,
        }}
      >
        {selected && (
          <Flex
            sx={{ height: '100%', width: '100%', justifyContent: 'center', alignItems: 'center' }}
          >
            <Box
              sx={{
                width: size ? +sizes[size] * 0.6 : +sizes.small * 0.6,
                height: size ? +sizes[size] * 0.6 : +sizes.small * 0.6,
                borderRadius: '100%',
                background: Palette.primary,
              }}
            />
          </Flex>
        )}
      </Box>
      <Box sx={{ width: '100%' }}>{renderFundraising({ fundraising: itemProps.fundraising })}</Box>
    </Flex>
  )
}

export default RadioFundraising

export const getValue = (key: keyof FundraisingDTOResult, fundraising: FundraisingDTOResult) => {
  if (!key || key.includes('typename') || key === 'fundraising_id') return ''
  if (key === 'fundraising') {
    return !!fundraising[key] ? 'Yes' : 'No'
  }
  return String(fundraising[key] || '')
}

const FundraisingItem = ({ fundraising }: FundraisingItemProps) => {
  return (
    <Grid mt={4} gap={2} columns={[2, '1fr 1fr']}>
      {Object.keys(fundraising).map(_key => {
        const key = _key as keyof FundraisingDTOResult
        // @ts-ignore
        if (!key || key.includes('typename') || key === 'fundraising_id') return null

        return (
          <Flex key={`${fundraising.fundraising_id}${key}`} sx={{ pr: 2, mb: 4 }}>
            <Paragraph bold sx={{ mr: 1 }}>
              {`${copy.keys[key]}:`}
              {/* {`${key}:`} */}
            </Paragraph>
            <Paragraph
              sx={{
                maxWidth: 200,
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {getValue(key, fundraising)}
            </Paragraph>
          </Flex>
        )
      })}
    </Grid>
  )
}
