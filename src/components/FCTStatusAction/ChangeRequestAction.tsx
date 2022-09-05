import React from 'react'
import { Flex } from 'theme-ui'
import SelfDeclareSVG from '../../theme/svg/SelfDeclareSVG'

import Button from '../Button'
import { ButtonProps } from '../Button/Button'

type IFn = (() => Promise<void>) | null

type Props = {
  hiddenButtons?: {
    approve?: boolean
    reject?: boolean
  }
  onApprove: IFn
  onReject: IFn
  disabled?: boolean
  isSelfDeclared?: boolean
}

export default function ChangeRequestAction(props: Props) {
  const [loading, setLoading] = React.useState(false)

  const loadingWrapper = async (fn: IFn) => {
    try {
      setLoading(true)
      fn && (await fn())
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async () => {
    loadingWrapper(props.onApprove)
  }

  const handleReject = async () => {
    loadingWrapper(props.onReject)
  }

  const buttons = [
    // { icon: 'pending', onPress: () => {}, hidden: !props.isSelfDeclared, disabled: true, background: null },
    { icon: 'tick', onPress: handleApprove, hidden: !!props.hiddenButtons?.approve },
    {
      icon: 'close',
      onPress: handleReject,
      hidden: !!props.hiddenButtons?.reject,
      sx: { bg: 'red' },
    },
  ] as Array<ButtonProps & { hidden?: boolean }>

  return (
    <Flex sx={{ gap: 2, alignItems: 'center' }}>
      {props.isSelfDeclared && <SelfDeclareSVG />}
      {buttons
        .filter(b => !b.hidden)
        .map(({ hidden, ...b }, index) => (
          <Button
            key={index}
            size="small"
            color="white"
            disabled={loading || props.disabled}
            {...b}
          />
        ))}
    </Flex>
  )
}
