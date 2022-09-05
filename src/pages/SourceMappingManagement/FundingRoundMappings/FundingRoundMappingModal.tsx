import { ApolloError, useMutation, useQuery } from '@apollo/client'
import React, { useContext, useEffect, useState } from 'react'
import { Modal, Updating } from '../../../components'
import { ETLRunTimeContext } from '../../../context'
import strings from '../../../strings'
import { GET_COMPANY_OVERRIDES_HISTORY, OVERRIDE_COMPANY_DATA } from '../../CompanyForm/graphql'
import { ColumnNames, OverridesCompanyDataInput, TableNames } from '../../CompanyForm/helpers'
import { FundingRoundMappingDTO } from '../types'
import { onError } from '../../../sentry'
import { idNANumber } from '../../../utils/consts'
import { EnumCompanySource } from '../../../types/enums'
import { OverrideResponse, RoundTypesOption } from '../../../types'
import FundingRoundMappingForm from '../../../components/FundingRoundMappingForm'
import { validateRound2Id } from '../helpers'

type Props = {
  fundingRoundMappingEdit: FundingRoundMappingDTO | undefined
  setErrorMessage(message: string): void
  onCancel(): void
  refreshFundingRoundMappings(): void
  roundTypeOptions: RoundTypesOption
}

const FundingRoundMappingModal = ({
  fundingRoundMappingEdit,
  setErrorMessage,
  onCancel,
  refreshFundingRoundMappings,
  roundTypeOptions,
}: Props) => {
  const { common: labels } = strings

  const { checkTimeETL } = useContext(ETLRunTimeContext)

  const [pendingFundingRoundMapping, setPendingFundingRoundMapping] = useState<
    FundingRoundMappingDTO
  >({} as FundingRoundMappingDTO)

  const [reason, setReason] = useState<string>('')

  //GraphQL

  const [updateFundingRoundMapping, { loading: updating }] = useMutation<
    { data: string },
    { input: OverridesCompanyDataInput[]; isAppendData?: boolean }
  >(OVERRIDE_COMPANY_DATA)

  useEffect(() => {
    setPendingFundingRoundMapping(fundingRoundMappingEdit || ({} as FundingRoundMappingDTO))
  }, [fundingRoundMappingEdit])

  //data override for round 2 id
  const dataOverrideInput = {
    tableName: TableNames.DATA_MAPPING,
    columnName: ColumnNames.EXPAND_VALUE,
    companyId: idNANumber,
    rowId: fundingRoundMappingEdit?.id?.toString(),
    source: EnumCompanySource.BCG,
  }

  const { data: dataOverride, loading: loadingDataOverride } = useQuery<OverrideResponse>(
    GET_COMPANY_OVERRIDES_HISTORY,
    {
      fetchPolicy: 'network-only',
      skip: !fundingRoundMappingEdit?.id,
      variables: { input: dataOverrideInput },
    }
  )

  const loading = loadingDataOverride

  const onSave = async () => {
    try {
      if (!checkTimeETL()) return
      const { id, round2Id } = pendingFundingRoundMapping || {}
      if (id && round2Id && fundingRoundMappingEdit?.round2Id !== round2Id) {
        const input = [
          {
            columnName: ColumnNames.EXPAND_VALUE,
            companyId: idNANumber,
            id: id.toString(),
            tableName: TableNames.DATA_MAPPING,
            newValue: round2Id,
            reason,
            source: EnumCompanySource.BCG,
            oldValue: fundingRoundMappingEdit?.round2Id?.toString(),
          },
        ] as OverridesCompanyDataInput[]

        await updateFundingRoundMapping({ variables: { input, isAppendData: false } })
        setReason('')
        onCancel()
        refreshFundingRoundMappings()
      }
    } catch (error) {
      setErrorMessage((error as ApolloError).message)
      onError(error)
    } finally {
      onCancel()
    }
  }

  return (
    <>
      {fundingRoundMappingEdit && (
        <Modal
          sx={{ padding: 6, minWidth: 500 }}
          buttonsStyle={{ justifyContent: 'flex-end', width: '100%' }}
          buttons={[
            {
              label: labels.cancel,
              action: onCancel,
              type: 'secondary',
              disabled: updating,
            },
            {
              label: labels.save,
              action: onSave,
              type: 'primary',
              disabled:
                updating ||
                validateRound2Id(pendingFundingRoundMapping.round2Id) ||
                +pendingFundingRoundMapping.round2Id === +fundingRoundMappingEdit.round2Id,
            },
          ]}
        >
          {loading ? (
            <Updating sx={{ py: 7 }} loading />
          ) : (
            <>
              <FundingRoundMappingForm
                dataOverrides={dataOverride?.getCompanyOverrideHistory || []}
                fundingRoundMapping={fundingRoundMappingEdit}
                loading={loading}
                pendingFundingRoundMapping={pendingFundingRoundMapping}
                reason={reason}
                roundTypeOptions={roundTypeOptions}
                setPendingFundingRoundMapping={setPendingFundingRoundMapping}
                setReason={setReason}
                updating={updating}
              />
            </>
          )}
        </Modal>
      )}
    </>
  )
}

export default FundingRoundMappingModal
