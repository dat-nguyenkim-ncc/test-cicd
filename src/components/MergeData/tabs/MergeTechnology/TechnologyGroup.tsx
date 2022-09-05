import React, { useState } from 'react'
import { Paragraph } from '../../../primitives'
import { Box, Flex } from 'theme-ui'
import { Checkbox, Icon, Radio } from '../../..'
import { EnumExpandStatusId } from '../../../../types/enums'
import { Technology } from '../../../../pages/CompanyForm/TechnologyForm'

type TechnologyGroupProps = {
  label?: string
  data: Technology[]
  technology: Technology[]
  isMultiple: boolean
  onChange(technology: Technology, isAdd: boolean): void
}

const TechnologyGroup = ({
  label,
  data,
  technology,
  isMultiple,
  onChange,
}: TechnologyGroupProps) => {
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
          {!technology.length ? (
            <Paragraph sx={{ opacity: 0.5 }}>{`Select ${label}`}</Paragraph>
          ) : (
            <Paragraph bold>{`${technology.length} Selected...`}</Paragraph>
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
            {data.map((uc, index) => {
              const isChecked = !!technology.find(
                ({ technology_id }) => +technology_id === uc.technology_id
              )
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
                  {isMultiple ? (
                    <Checkbox
                      onPress={() => onChange(uc, !isChecked)}
                      checked={isChecked}
                      square={true}
                      label={`${uc.technology_value}`}
                    />
                  ) : (
                    <Radio
                      key={index}
                      sx={{ mr: 4 }}
                      label={uc.technology_value}
                      selected={isChecked}
                      onClick={() => {
                        onChange(uc, !isChecked)
                      }}
                      size="tiny"
                    />
                  )}
                  {uc.fct_status_id !== +EnumExpandStatusId.FOLLOWING && (
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

export default TechnologyGroup
