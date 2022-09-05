import { useQuery } from '@apollo/client'
import React, { useState } from 'react'
import { useHistory } from 'react-router-dom'
import { Box } from 'theme-ui'
import { FooterCTAs, Updating } from '../../components'
import { AcquisitionRoundItem } from '../../components/AcquisitionRound'
import { AcquisitionForm } from '../../components/AcquisitionRound/AcquisitionRound'
import { Section } from '../../components/primitives'
import strings from '../../strings'
import { ViewHistoryProps } from './CompanyForm'
import { GET_COMPANY_ACQUIREES_BY_ID } from './graphql'
import moment from 'moment'
import { EnumReverseApiSource, Routes } from '../../types/enums'
import { Investor } from '../../components/InvestorForm'
import usePagination from '../../hooks/usePagination'
import { DEFAULT_VIEW_DATE_FORMAT } from '../../utils/consts'

type Props = {
  info?: React.ReactElement
  acquisition?: any
  companyId: number
  viewState?: any
  onCancel?(): void
  onFinish(): void
  companySource: EnumReverseApiSource
  isEdit?: boolean
  setError(s: Error): void
} & ViewHistoryProps

const Acquirees = ({ companyId, isEdit, setError }: Props) => {
  const {
    pages: { addCompanyForm: copy },
  } = strings

  const history = useHistory()
  const { pagination, total, setTotal, Pagination } = usePagination({
    gotoPageCallback: () => {},
  })

  const [viewState, setViewState] = useState<AcquisitionForm[]>([])

  const { data, loading } = useQuery(GET_COMPANY_ACQUIREES_BY_ID, {
    variables: {
      companyId: +companyId,
      page: pagination.page,
      size: pagination.pageSize,
      showAll: true,
    },
    fetchPolicy: 'network-only',
    notifyOnNetworkStatusChange: true,
    onCompleted(data) {
      const viewState: AcquisitionForm[] =
        data?.getCompanyAcquireesById?.acquirees.map((item: any) => ({
          ...item,
          acquisition_date: moment(item.acquisition_date).format(DEFAULT_VIEW_DATE_FORMAT),
          investors: item.investors.map((e: Investor) => ({ ...e, isEdit: true })),
        })) || []

      setViewState(viewState)
    },
    onError(error) {
      setError(error)
    },
  })

  // Effect
  React.useEffect(() => {
    if (data?.getCompanyAcquireesById?.total !== total)
      setTotal(data?.getCompanyAcquireesById?.total || 0)
  }, [data, total, setTotal])

  return (
    <>
      {loading ? (
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
            {(viewState || []).map((el, index) => {
              return (
                <Box id={el.acquisition_id} key={el.acquisition_id}>
                  <AcquisitionRoundItem
                    isReadOnly={true}
                    sx={{ mb: 5 }}
                    acquisition={el}
                    unfollowAcquisitionRound={input => {}}
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
            buttons={
              !isEdit
                ? []
                : [
                    {
                      label: copy.buttons.backToCompanyRecord,
                      variant: 'outlineWhite',
                      onClick: () =>
                        history.push(Routes.COMPANY.replace(':id', companyId.toString())),
                    },
                  ]
            }
          />
        </>
      )}
    </>
  )
}

export default Acquirees
