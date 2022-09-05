import { useMutation } from '@apollo/client'
import { Text } from '@theme-ui/components'
import React from 'react'
import { FormConfirm } from '../..'
import { ETLRunTimeContext } from '../../../context'
import { onError } from '../../../sentry'
import strings from '../../../strings'
import { Investor } from '../../InvestorForm'
import { DELETE_INVESTOR } from '../graphql'

type DeleteInvestorProps = {
  investor: Investor
  onSuccess(): void
  onCancel(): void
  setError(error: string): void
}

const DeleteInvestor = ({ investor, onSuccess, onCancel, setError }: DeleteInvestorProps) => {
  const { checkTimeETL } = React.useContext(ETLRunTimeContext)

  const {
    pages: {
      addCompanyForm: {
        investor: { management: copy },
      },
    },
  } = strings

  // GRAPHQL
  const [deleteInvestor, { loading: deleting }] = useMutation(DELETE_INVESTOR)

  const onConfirm = async () => {
    if (!checkTimeETL()) return
    try {
      await deleteInvestor({ variables: { investorId: investor.investor_id } })
      onSuccess()
    } catch (error) {
      setError(error.message)
      onError(error)
    }
  }

  return (
    <FormConfirm onConfirm={onConfirm} onCancel={onCancel} destructive={false} disabled={deleting}>
      <Text sx={{ textAlign: 'center', fontSize: 14, lineHeight: 1.5 }}>
        {copy.message.delete.replace('$name?', '')}
        <span style={{ fontWeight: 'bold' }}>{` ${investor.investor_name}?`}</span>
      </Text>
    </FormConfirm>
  )
}
export default DeleteInvestor
