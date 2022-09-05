import React from 'react'
import { Box, Divider } from '@theme-ui/components'
import { Checkbox, Collapse } from '../../../components'
import { AttachmentFilterType, attachmentTypeOptions } from './helpers'
import { CheckList, CollapseHeader } from '.'
import CombinationForm from './CombinationForm'

type AttachmentProps = {
  state: AttachmentFilterType
  onChange(state: AttachmentFilterType): void
}

const Attachment = ({ state, onChange }: AttachmentProps) => {
  return (
    <>
      <Collapse header={collapseState => <CollapseHeader {...collapseState} label="Attachment" />}>
        <Box sx={{ mx: 2, my: 3 }}>
          <Checkbox
            label="Blank"
            sx={{ mb: 3 }}
            square
            checked={state.isBlankAttachment}
            onPress={() => {
              onChange({
                ...state,
                isBlankAttachment: !state.isBlankAttachment,
              })
            }}
          />
          <Collapse
            sx={{ mt: 3 }}
            header={collapseState => (
              <CollapseHeader
                {...collapseState}
                label="Attachment Type"
                shrink="indicatorDown"
                expand="indicatorUp"
                sx={{ bg: 'gray03', px: 3, py: 3, borderRadius: 10 }}
              />
            )}
            disabled={state.isBlankAttachment}
          >
            <Box sx={{ mx: 2, my: 3 }}>
              <CheckList
                list={attachmentTypeOptions}
                listCheck={state.attachmentType}
                onChange={attachmentType => onChange({ ...state, attachmentType })}
              />
              <CombinationForm
                state={state.attachmentTypeCombination}
                onChange={attachmentTypeCombination => {
                  onChange({ ...state, attachmentTypeCombination })
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

export default Attachment
