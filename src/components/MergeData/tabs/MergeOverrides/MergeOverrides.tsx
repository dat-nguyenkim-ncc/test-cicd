import React from 'react'
import { Box, Flex } from '@theme-ui/components'
import { Checkbox, Collapse, Icon, Pill } from '../../..'
import { Paragraph } from '../../../primitives'
import { startCase } from '../../../../utils'
import { EnumExpandStatusId } from '../../../../types/enums'
import { expandStatusIdToName } from '../../../../utils/helper'
import {
  HeadquarterConflictValue,
  OverridesConflicts,
  OverridesConflictsValueWithUId,
} from '../../../../types'
import MergeStepLayout from '../../MergeStepLayout'
import { ViewInterface } from '../../../../types'
import CompanyLogo from '../../../CompanyLogo'

export const getValue = (
  field: string,
  value: string | null,
  action?: Function
): string | React.ReactElement => {
  const mapper: any = {
    fct_status_id: expandStatusIdToName(value as EnumExpandStatusId),
  }
  if (!value) return <Pill label={`Empty`} variant="muted" />
  if (field === 'hashed_image')
    return (
      <CompanyLogo
        sx={{ cursor: 'pointer' }}
        onClick={() => {
          action && action()
        }}
        src={value}
        width={108}
        height={108}
      ></CompanyLogo>
    )
  return (mapper[field] || value) as string
}

type Props = ViewInterface<{
  label: string
  data: OverridesConflicts<OverridesConflictsValueWithUId>[]
  isSelected(field: string, item: OverridesConflictsValueWithUId): boolean
  onSelect(field: string, item: OverridesConflictsValueWithUId): void
}>

export default function MergeOverrides(props: Props) {
  return (
    <MergeStepLayout sx={props.sx || { px: 6 }} label={props.label} isEmpty={!props.data?.length}>
      {props.data.map((item, index) => (
        <Box key={index} sx={{ mb: 3, overflowY: 'auto' }}>
          <OverrideConflictItem
            item={item}
            isSelected={props.isSelected}
            onSelect={props.onSelect}
          />
        </Box>
      ))}
    </MergeStepLayout>
  )
}

export const getLabel = (field: string) => {
  const mapper: any = {
    fct_status_id: 'FCT Status',
    headquarter: 'Headquarter Location',
    hashed_image: 'Logo',
  }

  return mapper[field] || startCase(field)
}

// Child Component
const OverrideConflictItem = (
  props: {
    item: OverridesConflicts<OverridesConflictsValueWithUId>
    isSelected(field: string, item: OverridesConflictsValueWithUId): boolean
  } & Pick<Props, 'isSelected' | 'onSelect'>
) => {
  const selectedItem = props.item.values.find(v => props.isSelected(props.item.field, v))
  return (
    <Collapse
      expanded
      header={collapseState => (
        <CollapseHeader {...collapseState} label={getLabel(props.item.field)} />
      )}
    >
      <Box
        sx={{
          border: 'solid 1px rgba(0, 0, 0, 0.1)',
          borderTop: '0px',
          borderRadius: '0 0 10px 10px',
        }}
      >
        {[...props.item.values].map((v, index) => {
          const onClick = () => {
            props.onSelect(props.item.field, v)
          }
          const value = getValue(props.item.field, v.value, onClick)
          const headquarterData = v.headquarterLocation as HeadquarterConflictValue
          return !headquarterData ? (
            <React.Fragment key={index}>
              <Flex
                sx={{
                  alignItems: 'center',
                  py: 12,
                  px: 30,
                  gap: 3,
                  '& p': { overflow: 'hidden', textOverflow: 'ellipsis' },
                  justifyContent: 'space-between',
                }}
              >
                <Flex sx={{ px: 0, py: 0, alignItems: 'center', gap: 3, maxWidth: '70%' }}>
                  <Checkbox
                    square={true}
                    label={typeof value === 'string' ? value : ''}
                    onPress={onClick}
                    checked={selectedItem?.uid === v.uid}
                  />
                  {typeof value !== 'string' && <>{value}</>}
                </Flex>
                <Flex sx={{ px: 0, py: 0, alignItems: 'center', gap: 2 }}>
                  {!v.dataOverrideId && <Pill label="Source Value" />}
                  {v.user && <Pill sx={{ maxWidth: '150px' }} label={v.user} />}
                  {v.dateTime && <Pill label={v.dateTime} />}
                </Flex>
              </Flex>
            </React.Fragment>
          ) : (
            <React.Fragment key={index}>
              <Flex
                sx={{
                  alignItems: 'center',
                  py: 12,
                  px: 30,
                  gap: 3,
                  '& p': { overflow: 'hidden', textOverflow: 'ellipsis' },
                  justifyContent: 'space-between',
                  width: '100%',
                }}
              >
                <Flex sx={{ px: 0, py: 0, alignItems: 'center', gap: 3, maxWidth: '70%' }}>
                  <Checkbox
                    square={true}
                    onPress={() => {
                      props.onSelect(props.item.field, v)
                    }}
                    checked={selectedItem?.uid === v.uid}
                  />
                </Flex>
                <Box
                  sx={{
                    border: 'solid 1px rgba(0, 0, 0, 0.1)',
                    borderRadius: '10px',
                    padding: '0 12px',
                    width: 'inherit',
                    backgroundColor: '#F2F2F2',
                  }}
                >
                  {['country', 'city'].map((item, index) => {
                    const data = headquarterData[item as keyof typeof headquarterData]
                    const value = getValue('', data.value)
                    return (
                      <Flex
                        sx={{
                          px: 12,
                          py: 12,
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          cursor: 'pointer',
                          fontSize: '14px',
                        }}
                        onClick={() => {
                          props.onSelect(props.item.field, v)
                        }}
                        key={index}
                      >
                        <div
                          style={{
                            padding: '0',
                            alignItems: 'center',
                            maxWidth: '65%',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                          }}
                        >
                          {<>{value}</>}
                        </div>
                        <Flex sx={{ px: 0, py: 0, alignItems: 'center', gap: 2 }}>
                          {!data.dataOverrideId && <Pill label="Source Value" />}
                          {data.user && <Pill sx={{ maxWidth: '150px' }} label={data.user} />}
                          {data.dateTime && <Pill label={data.dateTime} />}
                        </Flex>
                      </Flex>
                    )
                  })}
                </Box>
              </Flex>
            </React.Fragment>
          )
        })}
      </Box>
    </Collapse>
  )
}

const CollapseHeader = ({
  expanded,
  setExpanded,
  ...props
}: {
  expanded: boolean
  setExpanded(b: boolean): void
  label: string
}) => {
  return (
    <Flex
      onClick={() => setExpanded(!expanded)}
      sx={{
        alignItems: 'center',
        justifyContent: 'space-between',
        py: 12,
        px: 20,
        border: 'solid 1px rgba(0, 0, 0, 0.1)',
        borderRadius: `10px 10px ${expanded ? '0 0' : '10px 10px'}`,
        backgroundColor: '#F2F2F2',
        cursor: 'pointer',
      }}
    >
      <Paragraph>{props.label}</Paragraph>
      <Icon
        sx={{ transform: expanded ? 'rotate(180deg) translateY(4px)' : 'translateY(4px)' }}
        icon="arrow"
        color="text"
        size="tiny"
      />
    </Flex>
  )
}
