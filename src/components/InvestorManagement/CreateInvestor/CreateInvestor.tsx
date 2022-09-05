import React from 'react'
import { Button, Dropdown, TextField } from '../..'
import strings from '../../../strings'
import { ChangeFieldEvent } from '../../../types'
import { Investor } from '../../InvestorForm'
import HeadingManagement from '../HeadingManagement'
import { EnumInvestorManagementScreen, ScreenType } from '../helpers'
import { investor } from '../../../pages/CompanyForm/mock'
import { Box, Flex } from '@theme-ui/components'
import { useLazyQuery, useMutation } from '@apollo/client'
import { searchInvestorByName } from '../../../pages/CompanyForm/graphql'
import { Paragraph } from '../../primitives'
import { CREATE_INVESTOR } from '../graphql'
import { onError } from '../../../sentry'
import { ETLRunTimeContext } from '../../../context'

type CreateInvestorProps = {
  isEdit?: boolean
  state: Investor
  disabled?: boolean
  onChange(state: Investor): void
  changeScreen(state: ScreenType): void
  setError(error: string): void
  onSuccess(): void
}

let timer: any

const CreateInvestor = ({
  state,
  isEdit,
  disabled,
  onChange,
  changeScreen,
  setError,
  onSuccess,
}: CreateInvestorProps) => {
  const {
    pages: {
      addCompanyForm: {
        investor: { management: copy },
      },
    },
  } = strings

  // Context
  const { checkTimeETL } = React.useContext(ETLRunTimeContext)

  // GRAPHQL
  const [searchInvestor, { data, loading }] = useLazyQuery(searchInvestorByName, {
    fetchPolicy: 'network-only',
  })
  const [addInvestor, { loading: creating }] = useMutation(CREATE_INVESTOR)

  const onChangeField = (e: ChangeFieldEvent) => {
    const { name, value } = e.target
    if (name === 'investor_name' && state.investor_name !== value) {
      clearTimeout(timer)
      timer = setTimeout(() => {
        searchInvestor({ variables: { name: value?.trim(), getCR: false } })
      }, 500)
    }
    onChange({ ...state, [name]: value })
  }

  const onSubmit = async () => {
    if (!checkTimeETL()) return
    try {
      await addInvestor({ variables: { investor: state } })
      onSuccess()
    } catch (error) {
      setError(error.message)
      onError(error)
    }
  }

  const isDuplicated = data?.searchInvestorByName.data.some(
    (item: Investor) =>
      item.investor_name.toLocaleLowerCase().trim() ===
      state.investor_name?.toLocaleLowerCase().trim()
  )

  return (
    <>
      <HeadingManagement
        heading={isEdit ? copy.titles.edit : copy.titles.create}
        onPress={() => {
          !creating && changeScreen(EnumInvestorManagementScreen.management)
        }}
        disabled={creating}
      />
      <Box sx={{ px: 1 }}>
        <TextField
          disabled={creating}
          name="investor_name"
          placeholder="Enter investor name"
          onChange={onChangeField}
          value={state.investor_name}
        />
        {isDuplicated && (
          <Paragraph sx={{ pt: 1, pl: 2, color: 'red' }}>{copy.message.duplicate}</Paragraph>
        )}
        <Dropdown
          disabled={creating}
          sx={{ mt: 4 }}
          name="investor_type"
          placeholder="Type of investor"
          options={investor}
          value={state.investor_type}
          onChange={onChangeField}
        />
        <Flex sx={{ justifyContent: 'flex-end', my: 4 }}>
          <Button
            onPress={onSubmit}
            label={isEdit ? copy.buttons.save : copy.buttons.create}
            disabled={
              !state.investor_name?.length ||
              !state.investor_type ||
              disabled ||
              isDuplicated ||
              loading ||
              creating
            }
          />
        </Flex>
      </Box>
    </>
  )
}
export default CreateInvestor
