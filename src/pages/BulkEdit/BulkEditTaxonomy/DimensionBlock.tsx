import React, { PropsWithChildren } from 'react'
import { Divider } from '@theme-ui/components'
import { Collapse } from '../../../components'
import { Section } from '../../../components/primitives'
import BlockHeader from './BlockHeader'
import { EnumCompanyTypeSector } from '../../../types/enums'
import { Box } from 'theme-ui'

export const MENU_ITEMS = [
  { label: EnumCompanyTypeSector.FIN },
  { label: EnumCompanyTypeSector.INS },
  { label: EnumCompanyTypeSector.REG },
  { label: EnumCompanyTypeSector.OUT },
]

type DimensionBlockProps = PropsWithChildren<{
  label: string
  checked: boolean
  onCheck(v: boolean): void
  disabled?: boolean
  setError?(v: boolean): void
  defaultExpanded?: boolean
  optionsComponent?: React.ReactElement
}>

const DimensionBlock = ({
  label,
  checked,
  disabled,
  onCheck,
  setError,
  defaultExpanded,
  ...props
}: DimensionBlockProps) => {
  return (
    <Section sx={{ mt: 5, p: 4 }}>
      <Collapse
        header={collapseState => (
          <BlockHeader
            {...collapseState}
            label={label}
            checked={checked}
            onCheck={() => onCheck(checked)}
          />
        )}
        expanded={defaultExpanded}
      >
        <Divider sx={{ mt: 4 }} />
        <Box sx={{ pointerEvents: disabled ? 'none' : 'unset' }}>
          {props.optionsComponent && props.optionsComponent}
          {props.children}
        </Box>
      </Collapse>
    </Section>
  )
}

export default DimensionBlock
