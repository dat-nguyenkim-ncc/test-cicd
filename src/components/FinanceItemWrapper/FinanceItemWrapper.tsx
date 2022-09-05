import React from 'react'
import { Box, Flex, Grid } from 'theme-ui'
import { Button, Popover } from '..'
import { ColumnNames, findCQ } from '../../pages/CompanyForm/helpers'
import { Palette } from '../../theme'
import {
  ButtonProps,
  FinancialItemHeaderProps,
  SharedFinancialWrapperProps,
  ViewInterface,
} from '../../types'
import { EnumExpandStatus, EnumExpandStatusId } from '../../types/enums'
import { FCTStatusAction } from '../FCTStatusAction'
import { Props as FCTStatusActionProps } from '../FCTStatusAction/FCTStatusAction'
import { Paragraph } from '../primitives'
import { SwitchProps } from '../Switch/Switch'

export interface FCTStatusItem {
  selfDeclared?: boolean
  expandStatus: EnumExpandStatus | EnumExpandStatusId
  id: string
  tableName: string
  source: string
}

export type Props<T extends FCTStatusItem> = ViewInterface<{
  item: T
  children: React.ReactElement
  hideSwitch?: boolean
  unfollowItem(input: {
    id: string
    status: EnumExpandStatus.FOLLOWING | EnumExpandStatus.UNFOLLOWED
    reason: string
  }): void
}> &
  SharedFinancialWrapperProps &
  Omit<HeaderProps, 'switchProps' | 'isFollowing' | 'onSave' | 'fctStatusActionProps'> &
  Pick<
    FCTStatusActionProps,
    'handleAppendDataCQAction' | 'viewPendingCQFn' | 'viewHistoryFn' | 'getNumPending'
  >

function FinanceItemWrapper<T extends FCTStatusItem>({
  item,
  sx,
  hideSwitch,
  unfollowItem,
  handleAppendDataCQAction,
  viewPendingCQFn,
  viewHistoryFn,
  getNumPending,
  ...props
}: Props<T>) {
  const [isLoading, setIsLoading] = React.useState(false)
  const isFollowing =
    item.expandStatus === EnumExpandStatus.FOLLOWING ||
    item.expandStatus === EnumExpandStatusId.FOLLOWING

  const handleSave = async (reason: string) => {
    setIsLoading(true)
    await unfollowItem({
      id: item.id,
      status: !isFollowing ? EnumExpandStatus.FOLLOWING : EnumExpandStatus.UNFOLLOWED,
      reason,
    })
    setIsLoading(false)
  }
  const iden = {
    tableName: item.tableName,
    rowId: item.id,
    source: item.source,
    columnName: ColumnNames.FCT_STATUS_ID,
  }
  return (
    <Box sx={sx} id={item.id}>
      <Grid sx={{ p: 3, bg: Palette['white'], borderRadius: '10px', position: 'relative' }}>
        <ItemHeader
          isReadOnly={props.isReadOnly}
          label={props.label}
          isOverride={props.isOverride}
          buttons={props.buttons}
          fctStatusActionProps={{
            reasonRequired:
              !props.isOverride && item.expandStatus !== EnumExpandStatus.CHANGE_REQUEST,
            hideSwitch: hideSwitch,
            identity: iden,
            fctStatusId: item.expandStatus as EnumExpandStatus,
            selfDeclared: item.selfDeclared,
            handleUpdateStatus: async (reason: string, identity) => {
              await handleSave(reason)
            },
            viewHistoryFn,
            viewPendingCQFn,
            handleAppendDataCQAction,
            getNumPending,
            users: findCQ(props.pendingCR, iden)?.users || [],
          }}
          onSave={handleSave}
          isLoading={isLoading}
          switchProps={{
            checked: isFollowing,
            onToggle: () => {},
            hide: hideSwitch,
          }}
        />
        {props.children}
      </Grid>
    </Box>
  )
}

export default FinanceItemWrapper

type HeaderProps = {
  label: string | React.ReactElement
  buttons: Array<ButtonProps & { isCancel?: boolean }>
  switchProps: SwitchProps
  onSave(reason: string): Promise<void>
  isLoading?: boolean
  fctStatusActionProps: FCTStatusActionProps
} & FinancialItemHeaderProps

const ItemHeader = ({
  isReadOnly = false,
  label,
  buttons,
  switchProps,
  onSave,
  isOverride = true,
  fctStatusActionProps,
  ...props
}: HeaderProps) => {
  return (
    <Flex sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
      {typeof label === 'string' ? (
        <Paragraph sx={{ py: isReadOnly ? 3 : 0 }} bold>
          {label}
        </Paragraph>
      ) : (
        <>{label}</>
      )}
      <Flex
        sx={{
          justifyContent: 'space-between',
          alignItems: 'center',
          '& > *': { mx: '4px !important' },
          mx: '-4px',
        }}
      >
        {isReadOnly || (
          <>
            <FCTStatusAction
              {...fctStatusActionProps}
              followingProps={{
                reasonProps: {
                  suffix: <Menu buttons={buttons} />,
                },
              }}
            />
            {(fctStatusActionProps.fctStatusId === EnumExpandStatus.CHANGE_REQUEST ||
              fctStatusActionProps.fctStatusId === EnumExpandStatusId.CHANGE_REQUEST) && (
              <Menu buttons={buttons} />
            )}
          </>
        )}
      </Flex>
    </Flex>
  )
}

const Menu = ({ buttons }: { buttons: Array<ButtonProps & { isCancel?: boolean }> }) => {
  const [open, setOpen] = React.useState(false)
  return (
    <Popover
      open={open}
      setOpen={setOpen}
      noArrow
      content={<></>}
      buttonSx={{
        border: `1px solid ${Palette.gray01}`,
        bg: Palette.white,
        borderRadius: '10px',
        minWidth: '93px',
        justifyContent: 'flex-start',
        '& > *': {
          width: '100%',
          justifyContent: 'flex-start !important',
          padding: '12px !important',
        },
      }}
      buttons={buttons}
      positions={['right', 'bottom']}
    >
      <Button icon="menu" variant="invert" sx={{ width: '100%' }} />
    </Popover>
  )
}
