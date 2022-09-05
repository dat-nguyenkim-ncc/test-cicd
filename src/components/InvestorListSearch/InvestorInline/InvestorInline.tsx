import React, { useState } from 'react'
import { GRID } from '../InvestorListSearch'
import { Box, Flex, Grid, Text } from '@theme-ui/components'
import { Paragraph } from '../../primitives'
import { Button, Checkbox, Icon, Link } from '../..'
import { Investor } from '../../InvestorForm'
import { Palette, PaletteKeys } from '../../../theme'
import { Size, Variants } from '../../../types'
import { Paths } from '../../Icon'
import { SxStyleProp } from 'theme-ui'
import { EnumExpandStatusId, EnumInvestorSource, Routes } from '../../../types/enums'

export type ButtonType = {
  label?: string
  action(): void
  type: Variants
  disabled?: boolean
  icon?: Paths
  sx?: SxStyleProp
  size?: Size
  color?: PaletteKeys
}

type InvestorInlineProps = {
  checked?: boolean
  isEdit?: boolean
  showPending?: boolean
  buttons: ButtonType[]
  investor: Investor
  onCheck?(): void
}

const InvestorInline = ({ checked, isEdit, buttons, investor, onCheck }: InvestorInlineProps) => {
  const [isHover, setIsHover] = useState<boolean>(false)
  const [isExpand, setIsExpand] = useState<boolean>(false)

  const hasChildren = !!investor.children?.length

  return (
    <>
      <Grid
        onMouseEnter={() => setIsHover(true)}
        onMouseLeave={() => setIsHover(false)}
        onMouseOver={() => setIsHover(true)}
        columns={GRID}
        sx={{
          height: `50px`,
          py: 3,
          px: 20,
          bg: isHover && isEdit ? 'bgHover' : '',
          borderRadius: '8px',
          alignItems: 'center',
          cursor: 'pointer',
        }}
        onClick={() => hasChildren && setIsExpand(!isExpand)}
      >
        <Flex sx={{ alignItems: 'center' }}>
          {onCheck && (
            <Checkbox
              sx={{ mr: 3, minWidth: 24 }}
              checked={checked}
              onPress={e => {
                e.stopPropagation()
                onCheck()
              }}
              square
              size="small"
            />
          )}
          <Text sx={{ fontSize: 14 }}>
            {investor.associated_company_id ? (
              <Link
                variant="company"
                to={Routes.COMPANY.replace(':id', investor.associated_company_id)}
                target="_blank"
                sx={{
                  color: 'primary',
                }}
              >
                {investor.investor_name}
              </Link>
            ) : (
              investor.investor_name
            )}
            {investor.expand_status_id === EnumExpandStatusId.CHANGE_REQUEST && (
              <Text as="span" sx={{ color: 'orange' }}>
                {` (pending)`}
              </Text>
            )}
          </Text>
        </Flex>
        <Flex sx={{ height: '100%', width: '100%', alignItems: 'center' }}>
          <Flex sx={{ flex: 1 }}>
            <Paragraph>{investor.investor_type || ''}</Paragraph>
          </Flex>
          {(isHover || !isEdit) && (
            <Flex>
              {buttons.map((b, index) => (
                <Button
                  key={index}
                  sx={{ ml: 2, ...b.sx }}
                  onPress={e => {
                    e?.stopPropagation()
                    b.action()
                  }}
                  label={b.label}
                  icon={b.icon}
                  size={b.size}
                  color={b.color}
                  variant={b.type}
                  disabled={b.disabled}
                ></Button>
              ))}
            </Flex>
          )}
          {hasChildren && (
            <Icon
              sx={{
                ml: 3,
                transform: isExpand ? 'rotate(180deg)' : null,
                mt: isExpand ? '-5px' : '5px',
              }}
              size="tiny"
              icon="arrow"
            />
          )}
        </Flex>
      </Grid>
      {isExpand && (
        <Box sx={{ px: 20, mt: -12 }}>
          <Box sx={{ ml: 3, pl: 2, pt: 12, borderLeft: `1px solid ${Palette.gray01}` }}>
            {investor.children?.map((item, index) => (
              <Flex key={index} sx={{ p: 2 }}>
                <Grid sx={{ width: '100%' }} columns={GRID}>
                  <Flex sx={{ alignItems: 'center' }}>
                    <Text sx={{ fontSize: 14 }}>{item.investor_name || ''}</Text>
                  </Flex>
                  <Flex sx={{ alignItems: 'center' }}>
                    <Text sx={{ fontSize: 14 }}>
                      {item.source
                        ? EnumInvestorSource[item.source as keyof typeof EnumInvestorSource]
                        : ''}
                    </Text>
                  </Flex>
                </Grid>
              </Flex>
            ))}
          </Box>
        </Box>
      )}
    </>
  )
}

export default InvestorInline
