import React from 'react'
import { Flex } from 'theme-ui'
import { ButtonText } from '..'
import strings from '../../strings'
import { Palette } from '../../theme'
import { ViewDataOverrides, ViewInterface } from '../../types'

type Props = ViewInterface<ViewDataOverrides & { callback?(): void; disabled?: boolean }>

export default function ({
  sx,
  viewPendingChangeRequest,
  totalItemPendingCR = 0,
  viewHistory,
  callback = () => {},
  disabled,
}: Props) {
  if (!viewPendingChangeRequest && !viewHistory) return null
  return (
    <Flex sx={{ gap: 20, ...sx }} variant={disabled ? 'disabled' : ''}>
      {viewPendingChangeRequest && (
        <ButtonText
          onPress={(event: MouseEvent) => {
            if (disabled) return
            viewPendingChangeRequest()
            callback()
            event.stopPropagation()
          }}
          label={strings.common.viewPendingChangeRequest + ` (${totalItemPendingCR})`}
          sx={{ borderBottom: 0, color: Palette.orange, whiteSpace: 'nowrap' }}
        />
      )}
      {viewHistory && (
        <ButtonText
          onPress={(event: MouseEvent) => {
            if (disabled) return
            viewHistory()
            callback()
            event.stopPropagation()
          }}
          label={strings.common.viewHistory}
          sx={{ borderBottom: 0, whiteSpace: 'nowrap' }}
        />
      )}
    </Flex>
  )
}
