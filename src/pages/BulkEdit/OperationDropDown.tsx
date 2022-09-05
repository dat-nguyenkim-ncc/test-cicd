import React from 'react'
import { Box, Flex } from '@theme-ui/components'
import { Button, Dropdown } from '../../components'
import { Paragraph } from '../../components/primitives'
import { ChangeFieldEvent, ViewInterface } from '../../types'
import { bulkEditOptions, EBulkEditOptions } from './helpers'

type OperationDropDownProps = ViewInterface<{
  operation: EBulkEditOptions
  onChange(e: ChangeFieldEvent): void
  onRemove?(): void
  disabled?: boolean
  index?: number
}>

const OperationDropDown = ({
  sx,
  operation,
  onChange,
  onRemove,
  disabled,
  index,
}: OperationDropDownProps) => {
  return (
    <Box sx={{ mt: 4, opacity: disabled ? 0.5 : 1, ...sx }}>
      <Flex sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
        <Paragraph bold>{`Operation ${index !== undefined ? index + 1 : ''}`}</Paragraph>
        {onRemove && (
          <Button
            onPress={onRemove}
            icon="remove"
            size="tiny"
            variant="black"
            disabled={disabled}
          />
        )}
      </Flex>
      <Flex sx={{ mt: 3, alignItems: 'center' }}>
        <Dropdown
          sx={{ width: '50%', mr: 4 }}
          name="aux_options"
          options={bulkEditOptions}
          disabled={disabled}
          value={operation}
          onChange={onChange}
        />
      </Flex>
    </Box>
  )
}

export default OperationDropDown
