import React, { useState } from 'react'
import { Paragraph } from '../../../primitives'
import { Box, Flex } from 'theme-ui'
import { Checkbox, Icon } from '../../..'
import { EnumExpandStatusId } from '../../../../types/enums'
import { CurrentClientResult } from '../../../CurrentClientForm/CurrentClientForm'

type CurrentClientGroupProps = {
  label?: string
  data: CurrentClientResult[]
  clients: CurrentClientResult[]
  onChange(client: CurrentClientResult, isAdd: boolean): void
}

const CurrentClientGroup = ({ label, data, clients, onChange }: CurrentClientGroupProps) => {
  const [isExpand, setExpand] = useState<boolean>(true)

  return (
    <Box sx={{ py: 1 }}>
      {label && <Paragraph>{label}</Paragraph>}
      <Box sx={{ py: 3 }}>
        <Flex
          sx={{
            alignItems: 'center',
            justifyContent: 'space-between',
            py: 12,
            px: 20,
            border: 'solid 1px rgba(0, 0, 0, 0.1)',
            borderRadius: `10px 10px ${isExpand ? '0 0' : '10px 10px'}`,
            backgroundColor: '#F2F2F2',
            cursor: 'pointer',
          }}
          onClick={() => setExpand(!isExpand)}
        >
          {!clients.length ? (
            <Paragraph sx={{ opacity: 0.5 }}>{`Select ${label}`}</Paragraph>
          ) : (
            <Paragraph bold>{`${clients.length} Selected...`}</Paragraph>
          )}
          <Icon
            sx={{ transform: isExpand ? 'rotate(180deg) translateY(4px)' : 'translateY(4px)' }}
            icon="arrow"
            color="text"
            size="tiny"
          />
        </Flex>
        {isExpand && (
          <Box
            sx={{
              border: 'solid 1px rgba(0, 0, 0, 0.1)',
              borderTop: '0px',
              borderRadius: '0 0 10px 10px',
            }}
          >
            {data.map((item, index) => {
              const isChecked = !!clients.find(({ client_id }) => +client_id === item.client_id)
              return (
                <Flex
                  key={index}
                  sx={{
                    alignItems: 'center',
                    py: 12,
                    px: 30,
                    borderRadius: index + 1 === data.length ? '0 0 10px 10px' : 0,
                    backgroundColor: index % 2 ? 'gray03' : '#FBFBFB',
                  }}
                >
                  <Checkbox
                    onPress={() => onChange(item, !isChecked)}
                    checked={isChecked}
                    square={true}
                    label={`${item.name}${item.url ? ` (${item.url})` : ''}`}
                  />
                  {item.fct_status_id !== +EnumExpandStatusId.FOLLOWING && (
                    <Paragraph sx={{ opacity: 0.5, ml: 2 }}>(unfollowed)</Paragraph>
                  )}
                </Flex>
              )
            })}
          </Box>
        )}
      </Box>
    </Box>
  )
}

export default CurrentClientGroup
