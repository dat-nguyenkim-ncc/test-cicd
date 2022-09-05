import React from 'react'
import { Box, Flex } from 'theme-ui'
import { CompanyItem, Message, AggregatedSource, Button } from '..'
import { Heading, Paragraph } from '../primitives'
import strings from '../../strings'
import { SearchBlockType } from '../SearchResults/SearchResults'
import { ButtonProps, SearchResultItem, ViewInterface } from '../../types'
import Popover from '../Popover'
import { Palette } from '../../theme'
import { isGrantedPermissions } from '../../utils'
import { PERMISSIONS, Routes } from '../../types/enums'
import { UserContext } from '../../context'

type State = {
  [x: string]: boolean
}

// TODO: retrieve total number of results from BE so we dont have to limit on the FE
const MAX_RESULTS = 100

export type onChangeProps = {
  type: keyof typeof SearchBlockType
  state: State
  companyId?: string
}

export type SearchResultBlockProps = ViewInterface<{
  list: SearchResultItem[]
  type: keyof typeof SearchBlockType
  onChange(event: onChangeProps): void
  state: Record<string, boolean>
  isInDefaultSelected?: boolean // true if is in aggregate company or create new company, check a company and it will be default
  isInReAggregate?: boolean
  onMergeCompany?(): void
  disabledList?: string[]
}>

export type Props = {
  buttons: Array<ButtonProps & { isCancel?: boolean }>
}

const Menu = ({ buttons }: Props) => {
  const [open, setOpen] = React.useState(false)
  return (
    <Flex sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
      <Flex
        sx={{
          justifyContent: 'space-between',
          alignItems: 'center',
          '& > *': { mx: '4px !important' },
          mx: '-4px',
        }}
      >
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
      </Flex>
    </Flex>
  )
}

const SearchResultBlock = ({
  list,
  sx,
  type,
  onChange,
  state,
  isInDefaultSelected,
  isInReAggregate,
  onMergeCompany,
  disabledList,
}: SearchResultBlockProps) => {
  // const [state, setState] = useState<State>(
  //   list.reduce((initial, c) => {
  //     initial[c.companyDetails.companyId.toString()] = false
  //     return initial
  //   }, {} as State)
  // )

  const { searchResults: copy } = strings

  const { user } = React.useContext(UserContext)

  const onChangeTick = (companyId: string) => {
    const newState = { ...state, [companyId]: !state[companyId] }

    onChange({
      type: SearchBlockType[type],
      state: newState,
      companyId: companyId,
    })
  }

  const hasPermission = React.useMemo(
    () => isGrantedPermissions({ permissions: PERMISSIONS[Routes.MERGE_COMPANY] }, user),
    [user]
  )

  return (
    <Box sx={sx}>
      {list.length > MAX_RESULTS && (
        <Message
          sx={{ mb: 5 }}
          variant="alert"
          body={copy.tooManyResults.replace('{number}', MAX_RESULTS.toString())}
        />
      )}
      <Flex sx={{ justifyContent: 'space-between' }}>
        <Paragraph bold sx={{ mb: 5 }}>
          {type === 'internal' ? copy.heading_internal : copy.heading_external}
        </Paragraph>
        {onMergeCompany && (
          <Menu
            buttons={[
              {
                label: 'Merge',
                action: onMergeCompany,
                type: 'secondary',
                isCancel: true,
                disabled: !hasPermission,
              },
            ]}
          />
        )}
      </Flex>
      {list.length === 0 ? (
        <Heading center as="h4" sx={{ opacity: 0.3 }}>
          {copy.companyNotInDatabase}
        </Heading>
      ) : (
        <>
          <Paragraph sx={{ mb: 5 }}>
            {type === 'internal' ? copy.body_internal : copy.body_external}
          </Paragraph>
          {list.map((c, index) => {
            if (Array.isArray(c.source)) {
              return (
                <AggregatedSource
                  sx={{ mt: type === 'internal' && index > 0 ? 2 : 0 }}
                  key={index}
                  disabled={disabledList?.includes(c.companyDetails.companyId)}
                  company={c.companyDetails}
                  sources={c.source}
                  onCheck={onChangeTick}
                  checked={!!state[c.companyDetails.companyId]}
                  isInDefaultSelected={isInDefaultSelected}
                  stateCheck={state}
                  isInReAggregate={isInReAggregate}
                />
              )
            }

            return (
              <CompanyItem
                sx={{ mt: type === 'internal' && index > 0 ? 2 : 0 }}
                type={type}
                disabled={disabledList?.includes(c.companyDetails.companyId)}
                onCheck={onChangeTick}
                checked={!!state[c.companyDetails.companyId]}
                invertBg={index % 2 !== 0 && type === 'external'}
                key={index}
                {...c}
                isInDefaultSelected={isInDefaultSelected}
              />
            )
          })}
        </>
      )}
    </Box>
  )
}

export default SearchResultBlock
