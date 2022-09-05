import React from 'react'
import { Box, Flex } from '@theme-ui/components'
import { Button, Icon } from '..'
import { Palette } from '../../theme'
import { Paragraph } from '../primitives'
import { ButtonProps, ViewInterface } from '../../types'

type FilterTemplateProps = ViewInterface<{
  noReset?: boolean
  onClose(): void
  resetFilter(): void
  buttons?: ButtonProps[]
}>

const FilterTemplate = ({
  onClose,
  resetFilter,
  children,
  buttons,
  noReset = false,
}: FilterTemplateProps) => {
  return (
    <>
      <Flex
        sx={{
          position: 'sticky',
          top: 0,
          justifyContent: 'space-between',
          p: 2,
          borderBottom: `1px solid ${Palette.gray01}`,
          bg: 'white',
          zIndex: 10,
        }}
      >
        <Flex sx={{ alignItems: 'center' }}>
          <Icon sx={{ px: 3 }} icon="filter" />
          <Paragraph>Filter</Paragraph>
        </Flex>
        <Flex>
          {buttons &&
            buttons.map((b, index) => (
              <Button
                key={index}
                sx={{
                  ...b.sx,
                }}
                onPress={b.action}
                icon={b.icon}
                {...b}
              />
            ))}
          {!noReset && (
            <Button
              onPress={() => {
                resetFilter()
              }}
              sx={{ color: 'orange' }}
              icon="refresh"
              variant="invert"
              label="Reset"
              color="orange"
              iconLeft
            />
          )}
          <Button
            onPress={() => {
              onClose()
            }}
            icon="remove"
            variant="invert"
            color="gray04"
          />
        </Flex>
      </Flex>
      <Box sx={{ p: 20, mb: 20 }}>{children}</Box>
    </>
  )
}
export default FilterTemplate
