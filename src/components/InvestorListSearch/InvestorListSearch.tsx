import React from 'react'
import { Box, Grid } from '@theme-ui/components'
import { Paragraph } from '../primitives'
import InvestorInline from './InvestorInline'
import { Investor } from '../InvestorForm'
import { ButtonType } from './InvestorInline/InvestorInline'
import { ViewInterface } from '../../types'
import { ETLRunTimeContext, UserContext } from '../../context'
import { EnumExpandStatusId } from '../../types/enums'
import { ChangeRequestResultType } from '../../pages/ChangeRequestManagement/ChangeRequestManagement'
import { IPengdingCQData } from '../PendingChangeRequest/PendingChangeRequest'

export const GRID = ['1fr 1fr']

type InvestorListSearchProps = ViewInterface<{
  border?: boolean
  isEdit?: boolean
  showCheck?: boolean
  investors: Investor[]
  pendingCR?: ChangeRequestResultType[]
  selected: Investor[]
  hasPermission?: boolean
  setSelected(state: Investor[]): void
  onEdit?(state: Investor): void
  onDelete?(state: Investor): void
  onCheck?(state: Investor): void
  showPending?: boolean
  onHandleChangeRequest(approved: boolean, id?: string): void
  onHandleReject?(item: IPengdingCQData[]): void
  refetch?(): void
}>

const InvestorListSearch = ({
  sx,
  border,
  showCheck,
  isEdit,
  investors,
  selected,
  hasPermission = false,
  setSelected,
  onEdit,
  onCheck,
  showPending = true,
  onHandleChangeRequest,
  pendingCR,
  onHandleReject,
}: InvestorListSearchProps) => {
  const { checkTimeETL } = React.useContext(ETLRunTimeContext)
  const { user } = React.useContext(UserContext)

  const onSelect = (investor: Investor, isChecked: boolean) => {
    const cloneState = !isChecked
      ? [...selected, investor]
      : [...selected].filter(({ investor_id }) => investor_id !== investor.investor_id)
    setSelected(cloneState)
    onCheck && onCheck(investor)
  }

  const getEditButtons = (investor: Investor): ButtonType => ({
    action: () => {
      if (!checkTimeETL()) return
      onEdit && onEdit(investor)
    },
    icon: 'pencil',
    size: 'tiny',
    color: 'primary',
    type: 'invert',
  })

  const getCRButtons = (investor: Investor): ButtonType[] => {
    const pendingItem =
      pendingCR?.find((cr: ChangeRequestResultType) =>
        cr.dataOverride.some(({ rowId }) => rowId === investor.investor_id)
      )?.dataOverride || []
    return !hasPermission && !pendingItem.some(item => item.user === user.email)
      ? []
      : [
          hasPermission
            ? {
                action: () => {
                  if (!checkTimeETL()) return
                  onHandleChangeRequest(true, investor.investor_id)
                },
                icon: 'tick',
                size: 'tiny',
                color: 'white',
                type: 'invert',
                sx: { bg: 'primary' },
              }
            : getEditButtons(investor),
          {
            action: () => {
              if (!checkTimeETL()) return
              if (hasPermission) {
                onHandleChangeRequest(false, investor.investor_id)
              } else {
                onHandleReject && onHandleReject(pendingItem)
              }
            },
            icon: 'remove',
            size: 'tiny',
            color: 'white',
            type: 'invert',
            sx: { bg: 'red', mr: !isEdit ? 3 : 0 },
          },
        ]
  }

  const getButtons = (investor: Investor, isChecked: boolean): ButtonType[] =>
    showCheck
      ? []
      : investor.expand_status_id === EnumExpandStatusId.CHANGE_REQUEST &&
        (showPending || hasPermission)
      ? getCRButtons(investor)
      : isEdit
      ? [getEditButtons(investor)]
      : [
          {
            sx: { height: 30, borderRadius: 6, mr: 3, my: '-2px' },
            action: () => {
              onSelect(investor, isChecked)
            },
            label: isChecked ? 'Added' : 'Add',
            size: 'tiny',
            type: 'primary',
            disabled: isChecked,
          },
        ]

  return (
    <Box
      sx={{
        py: 3,
        borderRadius: '10px',
        width: '100%',
        border: border ? '1px solid' : undefined,
        borderColor: 'gray01',
      }}
    >
      <Grid sx={{ py: 3, px: 20 }} columns={GRID}>
        <Paragraph bold>Investor name</Paragraph>
        <Paragraph bold>Type</Paragraph>
      </Grid>
      <Box sx={{ ...sx }}>
        {investors
          .slice()
          .sort(function (a, b) {
            let nameA = a.investor_name.toUpperCase()
            let nameB = b.investor_name.toUpperCase()
            return nameA.localeCompare(nameB)
          })
          .map((investor: Investor, index) => {
            const isChecked = selected.some(
              ({ external_investor_id }) => external_investor_id === investor.external_investor_id
            )
            return (
              <InvestorInline
                key={index}
                onCheck={
                  showCheck
                    ? () => {
                        onSelect(investor, isChecked)
                      }
                    : undefined
                }
                isEdit={isEdit}
                checked={isChecked}
                investor={investor}
                buttons={getButtons(investor, isChecked)}
                showPending={showPending}
              />
            )
          })}
      </Box>
    </Box>
  )
}

export default InvestorListSearch
