import { useLazyQuery, useQuery } from '@apollo/client'
import { debounce } from 'lodash'
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { Box } from 'theme-ui'
import {
  GET_COMPANY_PRODUCTS,
  GET_COMPANY_PRODUCTS_CLUSTER,
  GET_TOTAL_COMPANY_PRODUCTS,
} from '../../../../pages/CompanyForm/graphql'
import { CompanyPeople, IPagination } from '../../../../types'
import Pagination from '../../../Pagination'
import { Heading, Paragraph } from '../../../primitives'
import { ProductList } from '../../../ProductList'
import Updating from '../../../Updating'
import ProductCluster from './ProductCluster'
import { PRODUCT_CLUSTER_CHANGE_DEBOUNCE_TIME } from '../../../../utils/consts'
import { Icon, Modal } from '../../../../components'
import { Flex } from '@theme-ui/components'

type Props = {
  data: CompanyPeople
}

export type defaultFilterProduct = {
  name_ml_cluster: string
  data: string[]
}

export default function CompanyDetailProducts(props: Props) {
  const [pagination, setPagination] = React.useState<IPagination>({
    page: 1,
    pageSize: 10,
  })
  const firstRender = React.useRef(true)
  const [filterProductNames, setFilterProductNames] = useState<defaultFilterProduct[]>([])
  const [totalProducts, setTotalProducts] = useState<number>(0)
  const [message, setMessage] = useState<{ title: string; content: string }>({
    title: '',
    content: '',
  })

  const { data: dataProductCluster, loading: loadingProductCluster } = useQuery(
    GET_COMPANY_PRODUCTS_CLUSTER,
    {
      skip: !props.data?.companyId,
      variables: {
        companyId: props.data.companyId,
      },
      notifyOnNetworkStatusChange: true,
    }
  )

  const [getDataProduct, { data: dataProduct, loading: loadingProduct }] = useLazyQuery(
    GET_COMPANY_PRODUCTS,
    {
      notifyOnNetworkStatusChange: true,
      onError(error) {
        setMessage({ title: 'Error', content: error.message })
      },
    }
  )

  const [getTotalProducts, { loading: loadingTotal }] = useLazyQuery(GET_TOTAL_COMPANY_PRODUCTS, {
    notifyOnNetworkStatusChange: true,
    onCompleted(res) {
      setTotalProducts(+res.getTotalCompanyProducts.total)
    },
    onError() {
      setTotalProducts(0)
    },
  })

  const input = useMemo(() => {
    return {
      companyId: props.data.companyId,
      pageSize: pagination.pageSize,
      page: pagination.page,
    }
  }, [props.data.companyId, pagination.page, pagination.pageSize])

  const getData = useCallback(
    (isFirstRender: boolean, query?: defaultFilterProduct[]) => {
      getDataProduct({
        variables: {
          input: {
            ...input,
            page: 1,
            filterProductClusters: isFirstRender ? filterProductNames : query,
          },
        },
      })
      getTotalProducts({
        variables: {
          input: {
            ...input,
            filterProductClusters: isFirstRender ? filterProductNames : query,
          },
        },
      })
    },
    [getTotalProducts, getDataProduct, input, filterProductNames]
  )

  useEffect(() => {
    if (firstRender.current) {
      getData(true)
      firstRender.current = false
    }
  }, [filterProductNames, input, getDataProduct, getTotalProducts, getData])

  const debounceGetDataProduct = useCallback(
    debounce(query => {
      getData(false, query)
    }, PRODUCT_CLUSTER_CHANGE_DEBOUNCE_TIME),
    [input, getData]
  )

  const gotoPage = (p: IPagination) => {
    const newPagination = { ...p, page: p.page < 1 ? 1 : p.page }
    setPagination(newPagination)

    if (props.data.companyId) {
      getDataProduct({
        variables: {
          input: {
            companyId: props.data.companyId,
            page: p.page,
            pageSize: p.pageSize,
            filterProductClusters: filterProductNames,
          },
        },
      })
    }
  }

  if (loadingProduct && loadingProductCluster) return <Updating loading />

  return (
    <Box mt={6}>
      {!!dataProductCluster?.getCompanyProductClusters?.data?.length && (
        <ProductCluster
          filterProductNames={filterProductNames || []}
          setFilterProductNames={setFilterProductNames}
          data={dataProductCluster?.getCompanyProductClusters?.data || []}
          productClusters={dataProductCluster?.getCompanyProductClusters?.productClusters || []}
          debounceGetDataProduct={debounceGetDataProduct}
        />
      )}
      {loadingProduct || loadingTotal ? (
        <Updating loading />
      ) : !!dataProduct && !!dataProduct?.getCompanyProducts?.data?.length ? (
        <Box>
          <ProductList
            data={dataProduct?.getCompanyProducts?.data || []}
            productClusters={dataProduct?.getCompanyProducts?.productClusters || []}
          />
          <Pagination
            sx={{ justifyContent: 'center' }}
            currentPage={pagination.page}
            pageSize={pagination.pageSize}
            totalPages={Math.ceil(totalProducts / pagination.pageSize)}
            changePage={page => {
              gotoPage({ ...pagination, page })
            }}
            changePageSize={pageSize => {
              gotoPage({ page: 1, pageSize })
            }}
          />
        </Box>
      ) : (
        <Paragraph sx={{ textAlign: 'center', p: 20, my: 30 }}>NO DATA AVAILABLE</Paragraph>
      )}

      {message.title && message.content && (
        <Modal
          sx={{ minWidth: 500 }}
          buttons={[
            {
              label: 'Ok',
              type: 'primary',
              action: () => {
                setMessage({ title: '', content: '' })
              },
            },
          ]}
        >
          <Flex>
            <Icon icon="alert" size="small" background="red" color="white" />
            <Heading center as="h4" sx={{ ml: 2, mb: 3 }}>
              {message.title}
            </Heading>
          </Flex>
          <Paragraph center sx={{ mt: 3, fontSize: 16 }}>
            {message.content}
          </Paragraph>
        </Modal>
      )}
    </Box>
  )
}
