import { DebouncedFunc, groupBy, uniqBy } from 'lodash'
import React, { useEffect, useState } from 'react'
import { Box, Flex, Label } from 'theme-ui'
import { ColumnNames } from '../../../../pages/CompanyForm/helpers'
import { Palette } from '../../../../theme'
import { Product } from '../../../../types'
import ButtonText from '../../../ButtonText'
import Chips from '../../../Chips'
import { cloneDeep } from 'lodash'
import { defaultFilterProduct } from './CompanyDetailProducts'

type Props = {
  data: Product[]
  maximumNumberOfShownItems?: number
  productClusters: string[]
  filterProductNames: defaultFilterProduct[]
  setFilterProductNames: (state: defaultFilterProduct[]) => void
  debounceGetDataProduct: DebouncedFunc<(query: defaultFilterProduct[]) => void>
}

type GroupCluster = {
  name_ml_cluster: string
  data: Product[]
}

const DEFAULT_SHOW = 30

const ProductCluster = ({
  data,
  maximumNumberOfShownItems = DEFAULT_SHOW,
  productClusters,
  filterProductNames,
  setFilterProductNames,
  debounceGetDataProduct,
}: Props) => {
  const defaultShowAll = productClusters.reduce((acc: any, name) => {
    acc[name] = false
    return acc
  }, {})

  const [showAll, setShowAll] = React.useState(defaultShowAll)
  const groupData = groupBy(data, ColumnNames.ML_CLUSTER)

  const groups: GroupCluster[] = []
  Object.keys(groupData).forEach(key => {
    groups.push({
      name_ml_cluster: key,
      data: uniqBy(groupData[key], ColumnNames.PRODUCT_NAME),
    })
  })

  const [groupCluster, setGroupCluster] = useState<GroupCluster[]>(
    groups.map(item => ({ ...item, data: item.data.map(item2 => ({ ...item2, isActive: false })) }))
  )

  useEffect(() => {
    setFilterProductNames(
      [...productClusters]
        .sort((a: string, b: string) => a?.localeCompare(b))
        .map((item: string) => ({
          name_ml_cluster: item,
          data: [],
        }))
    )
  }, [productClusters, setFilterProductNames])

  const debounceClickChips = (
    parentIdx: number,
    currentIdx: number,
    nameProduct: string,
    isActive: boolean | undefined,
    nameCluster: string
  ) => {
    const newGroups = cloneDeep(groupCluster)
    newGroups[parentIdx].data[currentIdx].isActive = !isActive
    setGroupCluster(newGroups)

    const filters = cloneDeep(filterProductNames)

    const indexItem = filters.findIndex(item => item.name_ml_cluster === nameCluster)

    if (!filters[indexItem].data.includes(nameProduct)) {
      filters[indexItem].data.push(nameProduct)
      setFilterProductNames(filters)
      debounceGetDataProduct(filters)
    } else {
      filters[indexItem].data = filters[indexItem].data.filter(item => item !== nameProduct)
      setFilterProductNames(filters)
      debounceGetDataProduct(filters)
    }
  }

  return (
    <Box sx={{ display: 'flex', marginBottom: '50px' }}>
      {groupCluster
        .sort((a, b) => a.name_ml_cluster.localeCompare(b.name_ml_cluster))
        .map((item, index) => (
          <Box
            key={index}
            sx={{
              display: 'flex',
              flexDirection: 'column',
              maxWidth: `calc((95vw - 60px) / ${groupCluster.length})`,
              width: `calc((95vw - 60px) / ${groupCluster.length})`,
              borderRight: `1px solid ${
                index === groupCluster.length - 1 ? 'transparent' : Palette.gray04
              }`,
              paddingRight: '20px',
              paddingLeft: `${index === 0 ? 0 : '20px'}`,
            }}
          >
            <Label
              sx={{
                color: Palette.green,
                justifyContent: 'left',
                fontSize: '20px',
                textTransform: 'capitalize',
                marginLeft: '4px',
              }}
            >
              {item.name_ml_cluster}
            </Label>
            <Flex sx={{ flexFlow: 'wrap' }}>
              {(showAll[item.name_ml_cluster]
                ? item.data
                : item.data.slice(0, maximumNumberOfShownItems)
              ).map((product, idx) => (
                <Chips
                  key={idx}
                  label={product.product_name}
                  sx={{
                    minHeight: 40,
                    color: Palette.white,
                    backgroundColor: product.isActive ? Palette.primary : Palette.gray07,
                    textTransform: 'none',
                    cursor: 'pointer',
                  }}
                  onClick={() =>
                    debounceClickChips(
                      index,
                      idx,
                      product.product_name,
                      product.isActive,
                      product.ml_cluster
                    )
                  }
                />
              ))}
              {item.data.length > maximumNumberOfShownItems && (
                <ButtonText
                  sx={{ mt: 3, ml: 3, alignSelf: 'end', pb: 1, border: 'none' }}
                  onPress={() => {
                    setShowAll({
                      ...showAll,
                      [item.name_ml_cluster]: !showAll[item.name_ml_cluster],
                    })
                  }}
                  label={!showAll[item.name_ml_cluster] ? 'Show all ...' : 'Show less ...'}
                  color="primary"
                />
              )}
            </Flex>
          </Box>
        ))}
    </Box>
  )
}

export default ProductCluster
