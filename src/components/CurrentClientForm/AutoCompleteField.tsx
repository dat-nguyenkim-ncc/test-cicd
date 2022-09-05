import { useLazyQuery } from '@apollo/client'
import React, { useState } from 'react'
import { Box } from 'theme-ui'
import { Popover, TextField, Updating } from '..'
import { SEARCH_CURRENT_CLIENT } from '../../pages/CompanyForm/graphql'
import { ChangeFieldEvent } from '../../types'
import { reasonPopverZIndex } from '../../utils/consts'
import { Paragraph } from '../primitives'
import { CurrentClient, CurrentClientResult } from './CurrentClientForm'

type AutoCompleteFieldProps = {
  state: CurrentClient
  onChange(arr: CurrentClient): void
  index: number
  invalidName: boolean
}

let timer: any

const AutoCompleteField = ({ state, onChange, index, invalidName }: AutoCompleteFieldProps) => {
  // GRAPHQL
  const [searchCurrentClient, { loading, data }] = useLazyQuery(SEARCH_CURRENT_CLIENT, {
    // fetchPolicy: 'network-only',
    notifyOnNetworkStatusChange: true,
  })

  const [open, setOpen] = useState<boolean>(false)

  const onChangeField = (value: any) => {
    onChange && onChange({ ...state, name: value, client_id: undefined })
    clearTimeout(timer)
    if (state.name !== value && value.length > 1) {
      timer = setTimeout(() => {
        searchCurrentClient({ variables: { keyword: value } })
      }, 500)
    }
  }

  return (
    <>
      <Popover
        open={open}
        setOpen={setOpen}
        positions={['bottom', 'top']}
        align="start"
        noArrow
        content={
          <>
            {state.name.length > 1 ? (
              <Box
                sx={{
                  py: 3,
                  mt: 2,
                  bg: 'white',
                  border: `1px solid rgb(226, 226, 226)`,
                  borderRadius: 12,
                  minWidth: 363,
                  maxWidth: 'fit-content',
                  wordBreak: 'break-all',
                  maxHeight: 500,
                  overflowY: 'auto',
                }}
              >
                {loading ? (
                  <Updating loading sx={{ textAlign: 'center', py: 5 }} />
                ) : (
                  <CurrentClientList
                    data={data?.searchCurrentClient}
                    onSelect={c => {
                      onChange(c)
                      setOpen(false)
                    }}
                  />
                )}
              </Box>
            ) : null}
          </>
        }
        zIndex={reasonPopverZIndex}
      >
        <TextField
          name={`add-name-${index}`}
          required
          fieldState={invalidName ? 'error' : 'default'}
          value={state.name}
          label="Name"
          labelSx={{ mb: 3 }}
          onChange={(event: ChangeFieldEvent) => onChangeField(event.target.value)}
          placeholder={'Client name'}
          onBlur={() => {}}
        />
      </Popover>
    </>
  )
}

export default AutoCompleteField

const CurrentClientList = ({
  data,
  onSelect,
}: {
  data: CurrentClientResult[]
  onSelect(item: CurrentClient): void
}) => {
  return !data?.length ? (
    <Paragraph sx={{ textAlign: 'center', p: 5 }}>NO DATA AVAILABLE</Paragraph>
  ) : (
    <>
      {data.map(c => (
        <Box
          key={c.client_id}
          sx={{
            '&:hover': {
              bg: 'bgPrimary',
            },
            borderRadius: 4,
            py: 2,
            px: 3,
            cursor: 'pointer',
          }}
          onClick={() => {
            onSelect(c)
          }}
        >
          <Paragraph sx={{ mb: 1 }} bold>
            {c.name}
          </Paragraph>
          <Paragraph
            onClick={e => {
              e.preventDefault()
            }}
          >
            {c.url}
          </Paragraph>
        </Box>
      ))}
    </>
  )
}
