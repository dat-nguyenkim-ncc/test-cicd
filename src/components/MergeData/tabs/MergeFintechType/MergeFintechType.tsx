import React from 'react'
import { Paragraph } from '../../../primitives'
import { Box, Flex } from 'theme-ui'
import strings from '../../../../strings'
import { Checkbox } from '../../..'

type MergeFintechTypeProps = {
  label?: string
  data: string[]
  onChange(data: string[]): void
}
const options = strings.pages.addCompanyForm.taxonomy.radio.options
const fintechType = [options.enabler, options.disruptor]

const MergeFintechType = ({ label, data, onChange }: MergeFintechTypeProps) => {
  return (
    <Box sx={{ px: 60 }}>
      {label && (
        <Paragraph sx={{ fontSize: '20px', mb: 4 }} bold>
          {label}
        </Paragraph>
      )}
      <Flex>
        {fintechType.map(str => (
          <Checkbox
            key={str}
            sx={{ mr: 4 }}
            label={str}
            checked={data?.includes(str)}
            onPress={() => {
              const value = str
              const tagIndex = (data || []).indexOf(value)
              let newFintechType = [...(data || [])]

              if (tagIndex !== -1) {
                newFintechType.splice(tagIndex, 1)
              } else {
                newFintechType = [...newFintechType, value]
              }

              onChange(newFintechType)
            }}
          />
        ))}
      </Flex>
    </Box>
  )
}

export default MergeFintechType
