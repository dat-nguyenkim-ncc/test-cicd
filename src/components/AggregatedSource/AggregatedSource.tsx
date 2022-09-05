import React, { useState } from 'react'
import { useHistory } from 'react-router-dom'
import { Box, Flex } from 'theme-ui'
import { Button, Icon, Pill } from '..'
import { CompanyDetail, SourceDetail, ViewInterface } from '../../types'
import strings from '../../strings'
import CompanyItem from '../CompanyItem'
import { Paragraph } from '../primitives'
import { EnumExpandStatus, EnumExpandStatusId, PERMISSIONS, Routes } from '../../types/enums'
import { ETLRunTimeContext, UserContext } from '../../context'
import { isGrantedPermissions } from '../../utils'

export type AggregatedSourceProps = ViewInterface<{
  company: CompanyDetail
  sources: SourceDetail[]
  onCheck(id: string): void
  checked?: boolean
  isInDefaultSelected?: boolean
  stateCheck?: Record<string, boolean>
  isInReAggregate?: boolean
  isInMerge?: boolean
  disabled?: boolean
}>

const AggregatedSource = ({
  company,
  sources,
  checked,
  onCheck,
  sx,
  isInDefaultSelected,
  stateCheck,
  isInReAggregate,
  isInMerge = false,
  disabled,
}: AggregatedSourceProps) => {
  const { aggregatedSource: copy } = strings
  const [state, setState] = useState({ opened: false })
  const history = useHistory()
  const { checkTimeETL } = React.useContext(ETLRunTimeContext)
  const { user } = React.useContext(UserContext)

  const onToggle = () => {
    setState({ ...state, opened: !state.opened })
  }

  const onSettingsClick = () => {
    if (!checkTimeETL()) return
    history.push(Routes.COMPANY_EDIT_SOURCE.replace(':id', company.companyId))
  }

  const companyDetails = sources[0].company

  const hasPermission = React.useMemo(
    () => isGrantedPermissions({ permissions: PERMISSIONS[Routes.COMPANY_EDIT_SOURCE] }, user),
    [user]
  )

  return (
    <Box sx={{ py: 3, bg: 'gray02', borderRadius: 10, ...sx }}>
      <Flex>
        <Flex
          sx={{ pl: 5, py: 3, flex: 1, alignItems: 'center', cursor: 'pointer' }}
          onClick={onToggle}
        >
          <Paragraph sx={{ mr: 2 }} bold>
            {copy.title}
          </Paragraph>
          <Icon sx={{ mr: 2 }} size="tiny" icon={state.opened ? 'indicatorUp' : 'indicatorDown'} />

          {companyDetails.expandStatusId === EnumExpandStatusId.DUPLICATED ? (
            <Pill sx={{ mr: 2 }} icon={EnumExpandStatus.DUPLICATED as any} variant="out" />
          ) : (
            companyDetails.primaryCategories?.map((t, index) => (
              <Pill key={index} sx={{ mr: 2 }} icon={t as any} />
            ))
          )}
        </Flex>
        {!isInMerge && state.opened && !disabled && (
          <Button
            disabled={!hasPermission}
            onPress={onSettingsClick}
            sx={{ mr: 2 }}
            variant="primary"
            label={copy.settings}
          />
        )}
      </Flex>
      <Box mt={3}>
        {sources.map((s, index) => {
          if (index > 0 && !state.opened) return null
          return (
            <CompanyItem
              key={index}
              disabled={disabled}
              aggregated
              checked={
                stateCheck && isInDefaultSelected
                  ? stateCheck[s.company.external_id || '']
                  : checked
              }
              type="internal"
              companyDetails={{ ...s.company, expandStatusId: null, primaryCategories: null }}
              source={s.source}
              onCheck={!isInMerge && (index === 0 || isInDefaultSelected) ? onCheck : undefined}
              isInReAggregate={isInReAggregate}
              isInDefaultSelected={isInDefaultSelected}
            />
          )
        })}
      </Box>
    </Box>
  )
}

export default AggregatedSource
