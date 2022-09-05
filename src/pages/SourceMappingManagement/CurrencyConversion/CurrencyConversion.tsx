import React, { useState } from 'react'
import { Flex } from 'theme-ui'
import { Button } from '../../../components'
import strings from '../../../strings'
import { ECurrencyConversionTab } from '../helpers'
import CurrencyConversionAdd from './CurrencyConversionAdd'
import CurrencyConversionEdit from './CurrencyConversionEdit'
const CurrencyConversion = () => {
  const [tab, setTab] = useState<ECurrencyConversionTab>(ECurrencyConversionTab.EDIT)

  const tabButtons = React.useMemo(() => {
    return [
      {
        label: strings.common.edit,
        active: tab === ECurrencyConversionTab.EDIT,
        onPress: () => {
          setTab(ECurrencyConversionTab.EDIT)
        },
      },
      {
        label: strings.common.add,
        active: tab === ECurrencyConversionTab.ADD,
        onPress: () => {
          setTab(ECurrencyConversionTab.ADD)
        },
      },
    ]
  }, [tab, setTab])

  return (
    <>
      <Flex sx={{ gap: 3, flexWrap: 'wrap' }}>
        {tabButtons.map((b, index) => (
          <Button
            key={index}
            active={!b.active}
            sx={{
              minWidth: b.active ? 150 : 120,
            }}
            onPress={b.onPress}
            variant={b.active ? 'primary' : 'muted'}
            label={b.label}
          />
        ))}
      </Flex>
      {tab === ECurrencyConversionTab.EDIT && <CurrencyConversionEdit />}
      {tab === ECurrencyConversionTab.ADD && <CurrencyConversionAdd />}
    </>
  )
}

export default CurrencyConversion
