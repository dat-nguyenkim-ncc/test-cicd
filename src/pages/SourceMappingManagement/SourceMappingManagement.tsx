import React, { useState } from 'react'
import { PageTemplate } from '../../components/PageTemplate'
import strings from '../../strings'
import CurrencyConversion from './CurrencyConversion/CurrencyConversion'
import FundingRoundMappings from './FundingRoundMappings'
import { ESourceMappingTab } from './helpers'

const SourceMappingManagement = () => {
  const [tab, setTab] = useState<ESourceMappingTab>(ESourceMappingTab.CURRENCY_CONVERSION)

  const tabButtons = React.useMemo(() => {
    const isActiveCurrencyConversion = tab === ESourceMappingTab.CURRENCY_CONVERSION
    const isActiveRoundMapping = tab === ESourceMappingTab.ROUND_MAPPING
    return [
      {
        label: strings.sourceMappingManagement.currencyConversion.title,
        active: isActiveCurrencyConversion,
        onPress: () => {
          setTab(ESourceMappingTab.CURRENCY_CONVERSION)
        },
        sx: {
          p: 5,
          bg: isActiveCurrencyConversion ? 'gray02' : 'white',
          color: isActiveCurrencyConversion ? 'primary' : 'gray04',
        },
      },
      {
        label: strings.sourceMappingManagement.roundMapping.title,
        active: isActiveRoundMapping,
        onPress: () => {
          setTab(ESourceMappingTab.ROUND_MAPPING)
        },
        sx: {
          p: 5,
          bg: isActiveRoundMapping ? 'gray02' : 'white',
          color: isActiveRoundMapping ? 'primary' : 'gray04',
        },
      },
    ]
  }, [tab, setTab])

  return (
    <>
      <PageTemplate
        title={strings.sourceMappingManagement.title}
        tabButtons={tabButtons}
        footerButtons={[]}
      >
        {tab === ESourceMappingTab.CURRENCY_CONVERSION && <CurrencyConversion />}
        {tab === ESourceMappingTab.ROUND_MAPPING && <FundingRoundMappings />}
      </PageTemplate>
    </>
  )
}

export default SourceMappingManagement
