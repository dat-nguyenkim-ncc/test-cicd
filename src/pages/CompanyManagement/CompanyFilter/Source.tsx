import React from 'react'
import { Box, Divider } from '@theme-ui/components'
import { Collapse } from '../../../components'
import { SourceFilterType, sourceOptions } from './helpers'
import { CheckList, CollapseHeader } from '.'
import CombinationForm from './CombinationForm'
import { EnumTagGroupSource } from '../../../types/enums'

type SourceProps = {
  state: SourceFilterType
  onChange(state: SourceFilterType): void
}

const Source = ({ state, onChange }: SourceProps) => {
  return (
    <>
      <Collapse header={collapseState => <CollapseHeader {...collapseState} label="Source" />}>
        <Box sx={{ mx: 2, my: 3 }}>
          <Collapse
            sx={{ mt: 3 }}
            header={collapseState => (
              <CollapseHeader
                {...collapseState}
                label="Priority Source"
                shrink="indicatorDown"
                expand="indicatorUp"
                sx={{ bg: 'gray03', px: 3, py: 3, borderRadius: 10 }}
              />
            )}
          >
            <Box sx={{ mx: 2, my: 3 }}>
              <CheckList
                list={sourceOptions}
                listCheck={state.priority}
                onChange={priority => onChange({ ...state, priority })}
              />
            </Box>
          </Collapse>
          <Collapse
            sx={{ mt: 3 }}
            header={collapseState => (
              <CollapseHeader
                {...collapseState}
                label="All Source "
                shrink="indicatorDown"
                expand="indicatorUp"
                sx={{ bg: 'gray03', px: 3, py: 3, borderRadius: 10 }}
              />
            )}
          >
            <Box sx={{ mx: 2, my: 3 }}>
              <CheckList
                list={[
                  ...sourceOptions,
                  { value: EnumTagGroupSource.FEEDLY, label: 'Feedly' },
                  { value: EnumTagGroupSource.SWITCHPITCH, label: 'Switchpitch' },
                ]}
                listCheck={state.all}
                onChange={all => onChange({ ...state, all })}
              />
              <CombinationForm
                state={state.allSourceCombination}
                onChange={allSourceCombination => {
                  onChange({ ...state, allSourceCombination })
                }}
              />
            </Box>
          </Collapse>
        </Box>
      </Collapse>
      <Divider opacity={0.3} my={4} />
    </>
  )
}

export default Source
