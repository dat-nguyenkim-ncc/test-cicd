import React, { useState } from 'react'
import { Box } from 'theme-ui'
import { FooterCTAs, Updating } from '../../components'
import { FundingFields, FundingForm, FundingRoundItem } from '../../components/FundingRound'
import { Section } from '../../components/primitives'
import strings from '../../strings'
import { FormOption } from '../../types'
import {
  FieldNames,
  FormRoundFieldsState,
  TableNames,
  validateDate,
  validateMoney,
} from './helpers'
import { roundType1, roundType2 } from './mock'
import moment from 'moment'
import { localstorage, LocalstorageFields } from '../../utils'
import { useQuery } from '@apollo/client'
import { useHistory } from 'react-router-dom'
import { EnumReverseCompanySource, Routes } from '../../types/enums'
import { ViewHistoryProps } from './CompanyForm'
import { Investor } from '../../components/InvestorForm'
import usePagination from '../../hooks/usePagination'
import { GET_COMPANY_INVESTMENTS } from './graphql'
import { DEFAULT_VIEW_DATE_FORMAT } from '../../utils/consts'

export const fields: FundingFields[] = [
  {
    name: FieldNames?.roundType1,
    key: 'roundType1',
    type: 'dropdown',
    option: roundType1,
    table: TableNames?.FUNDINGS,
  },
  {
    name: FieldNames?.roundType2,
    key: 'roundType2',
    type: 'dropdown',
    customOptions: (formState?: FormRoundFieldsState): FormOption[] => {
      return formState ? roundType2[formState?.roundType1] : []
    },
    table: TableNames?.FUNDINGS,
  },
  {
    name: FieldNames?.investment,
    key: 'investment',
    format: validateMoney,
    formatError: 'Invalid money',
    type: 'input',
    table: TableNames?.FUNDINGS,
  },
  {
    name: FieldNames?.date,
    key: 'date',
    placeholder: DEFAULT_VIEW_DATE_FORMAT,
    format: validateDate,
    formatError: 'Invalid date',
    type: 'input',
    table: TableNames?.FUNDINGS,
  },
  {
    name: FieldNames?.source,
    key: 'source',
    type: 'input',
    format: (v: string | number) =>
      EnumReverseCompanySource[v as keyof typeof EnumReverseCompanySource]?.toLocaleUpperCase() ||
      (v as string),
    placeholder: 'BCG',
    required: true,
    disabled: true,
  },
  {
    name: FieldNames?.valuation,
    key: 'valuation',
    format: validateMoney,
    formatError: 'Invalid money',
    type: 'input',
    table: TableNames?.FUNDINGS,
  },
  {
    name: FieldNames?.comment,
    key: 'comment',
    type: 'textarea',
    maxlength: 2083,
    table: TableNames?.FUNDINGS,
  },
]

type InvestmentsProps = {
  companyId: number
  isEdit?: boolean
  info?: React.ReactElement
  setError(error: string): void
} & ViewHistoryProps

const Investments = ({
  companyId,
  isEdit,
  showViewHistory,
  refetchViewHistoryCols = async () => {},
  setError,
}: InvestmentsProps) => {
  const {
    pages: { addCompanyForm: copy },
  } = strings

  const history = useHistory()
  const { pagination, total, setTotal, Pagination } = usePagination({
    gotoPageCallback: () => {},
  })

  const [viewState, setViewState] = useState<FundingForm[]>([])

  const { data, loading: queryLoading } = useQuery(GET_COMPANY_INVESTMENTS, {
    variables: {
      id: +companyId || localstorage.get(LocalstorageFields.COMPANY_ID),
      page: pagination.page,
      size: pagination.pageSize,
      showAll: true,
    },
    fetchPolicy: 'network-only',
    notifyOnNetworkStatusChange: true,
    onCompleted(data) {
      const viewState: FundingForm[] = []
      data.getCompanyInvestments.investments.forEach((e: any) => {
        const editStateItem = {
          expandStatus: e.expandStatus,
          selfDeclared: e.selfDeclared,
          id: e.funding_id,
          round: {
            roundType1: String(e.roundType1.id),
            roundType2: String(e.roundType2.id),
            investment: e.investment,
            date: e.date ? moment(e.date).format(DEFAULT_VIEW_DATE_FORMAT) : '',
            source: e.source,
            valuation: e.valuation,
            comment: e.comment,
            // readonly
            apiAppend: e.apiAppend,
            investmentCurrency: e.investmentCurrency,
            sourceInvestment: e.sourceInvestment,
          },
          investors: [...(e.lead_investors || []), ...(e.investors || [])].map((obj: Investor) => ({
            ...obj,
            isEdit: true,
            isLead: e.lead_investors.some((item: Investor) => item.investor_id === obj.investor_id),
          })),
          company: e.company,
        }
        const viewItem = {
          ...editStateItem,
          round: {
            ...editStateItem.round,
            roundType1: e.roundType1.name,
            roundType2: e.roundType2.name,
          },
        }

        viewState.push(viewItem)
      })
      setViewState(viewState)
    },
    onError(error) {
      setError(error.message)
    },
  })

  // Effect
  React.useEffect(() => {
    if (data?.getCompanyInvestments?.total !== total)
      setTotal(data?.getCompanyInvestments?.total || 0)
  }, [data, total, setTotal])

  return (
    <>
      {queryLoading ? (
        <Section sx={{ bg: 'white', p: 5, mt: 5, maxWidth: 'none' }}>
          <Updating sx={{ p: 5 }} loading />
        </Section>
      ) : (
        <>
          <Section
            sx={{
              maxWidth: 'none',
              ...(isEdit ? { bg: 'transparent', px: 0, mt: -5 } : { bg: 'white', p: 5, mt: 5 }),
            }}
          >
            {isEdit &&
              !!viewState?.length &&
              viewState.map(el => {
                return (
                  <Box key={el.id} id={el.id}>
                    <FundingRoundItem
                      isReadOnly={true}
                      sx={{ mb: 5 }}
                      funding={el}
                      unfollowFundingRound={() => {}}
                      buttons={[]}
                      viewHistoryFn={() => undefined}
                      viewPendingCQFn={() => undefined}
                      handleAppendDataCQAction={() => {}}
                      getNumPending={() => 0}
                      viewHistory={() => {}}
                      pendingCR={[]}
                    />
                  </Box>
                )
              })}
            <Pagination bg="white" />
          </Section>

          <FooterCTAs
            buttons={[
              {
                label: copy.buttons.backToCompanyRecord,
                variant: 'outlineWhite',
                onClick: () => history.push(Routes.COMPANY.replace(':id', companyId.toString())),
              },
            ]}
          />
        </>
      )}
    </>
  )
}
export default Investments
