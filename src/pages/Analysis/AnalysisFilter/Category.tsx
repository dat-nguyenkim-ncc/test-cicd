import React from 'react'
import { Box, Divider, Flex } from 'theme-ui'
import { Button, Collapse, Radio } from '../../../components'
import Tree, { ITree } from '../../../components/Tree'
import { EnumCompanyTypeSector } from '../../../types/enums'
import { CheckList } from '../../CompanyManagement/CompanyFilter'
import CollapseHeader from '../../CompanyManagement/CompanyFilter/CollapseHeader'
import CombinationForm from '../../CompanyManagement/CompanyFilter/CombinationForm'
import {
  blankId,
  categoryOptions,
  ECombination,
  getChildrenCluster,
} from '../../CompanyManagement/CompanyFilter/helpers'
import { SummaryOperation } from '../../CompanyManagement/CompanyFilter/Overview'
import { GetDimensionsItem } from '../../TaxonomyManagement'
import { getLevel } from '../../TaxonomyManagement/helper'
import { AnalysisFilterType } from '../helpers'
import { DataFilterType } from './AnalysisFilter'

type CategoryProps = {
  setCurrentFilter(filter: AnalysisFilterType): void
  currentFilter: AnalysisFilterType
  dataFilter: DataFilterType
  clusters: GetDimensionsItem[]
}

const Category = ({ setCurrentFilter, currentFilter, dataFilter, clusters }: CategoryProps) => {
  const tree: ITree<GetDimensionsItem> = React.useMemo(() => {
    const items = [
      ...(clusters || []).map((i: GetDimensionsItem) => ({
        ...i,
        isRoot: !i.parentId,
      })),
    ]

    const t = items.reduce((acc: ITree<GetDimensionsItem>, curr: GetDimensionsItem, index) => {
      acc[`${curr.id}`] = { ...curr, isOpen: false }
      return acc
    }, {})

    // Recalculate level
    items.forEach(i => {
      const level = getLevel(i.id, t)
      t[i.id].level = level
    })

    return t
  }, [clusters])

  const isOpenCollapse = (
    currentFilter: AnalysisFilterType,
    typeCategory: EnumCompanyTypeSector
  ) => {
    return (
      !currentFilter.category.length ||
      currentFilter.category.some(({ value }) => value === typeCategory)
    )
  }

  return (
    <>
      <Collapse
        expanded={true}
        header={collapseState => <CollapseHeader {...collapseState} label="Overview" />}
      >
        <Collapse
          sx={{ mt: 3 }}
          header={collapseState => (
            <CollapseHeader
              {...collapseState}
              label="Category"
              shrink="indicatorDown"
              expand="indicatorUp"
              sx={{ bg: 'gray03', px: 3, py: 3, borderRadius: 10 }}
            />
          )}
        >
          <Box sx={{ my: 3, mx: 2 }}>
            <CheckList
              list={categoryOptions}
              listCheck={currentFilter.category}
              onChange={category => {
                setCurrentFilter({
                  ...currentFilter,
                  category,
                  sector: [],
                  cluster: [],
                  valueChain: [],
                  risk: [],
                })
              }}
            />
            <CombinationForm
              state={currentFilter.categoryCombination}
              onChange={categoryCombination => {
                setCurrentFilter({ ...currentFilter, categoryCombination })
              }}
            />
          </Box>
        </Collapse>
        {isOpenCollapse(currentFilter, EnumCompanyTypeSector.FIN) && (
          <Collapse
            sx={{ mt: 3 }}
            header={collapseState => (
              <CollapseHeader
                {...collapseState}
                label="Sector"
                shrink="indicatorDown"
                expand="indicatorUp"
                sx={{ bg: 'gray03', px: 3, py: 3, borderRadius: 10 }}
              />
            )}
          >
            <Box sx={{ my: 3, mx: 2 }}>
              <CheckList
                list={[
                  blankId,
                  ...dataFilter?.sector.map(item => ({ label: item.name, value: item.id })),
                ]}
                listCheck={currentFilter.sector}
                onChange={sector => {
                  setCurrentFilter({
                    ...currentFilter,
                    sector,
                  })
                }}
              />
              <CombinationForm
                state={currentFilter.sectorsCombination}
                onChange={sectorsCombination => {
                  setCurrentFilter({ ...currentFilter, sectorsCombination })
                }}
              />
            </Box>
          </Collapse>
        )}
        {isOpenCollapse(currentFilter, EnumCompanyTypeSector.INS) && (
          <Collapse
            sx={{ mt: 3 }}
            header={collapseState => (
              <CollapseHeader
                {...collapseState}
                label="Value Chain"
                shrink="indicatorDown"
                expand="indicatorUp"
                sx={{ bg: 'gray03', px: 3, py: 3, borderRadius: 10 }}
              />
            )}
          >
            <Box sx={{ my: 3, mx: 2 }}>
              <CheckList
                list={[
                  blankId,
                  ...dataFilter?.valueChain.map(item => ({ label: item.name, value: item.id })),
                ]}
                listCheck={currentFilter.valueChain}
                onChange={valueChain => {
                  setCurrentFilter({ ...currentFilter, valueChain })
                }}
              />
              <CombinationForm
                state={currentFilter.valueChainsCombination}
                onChange={valueChainsCombination => {
                  setCurrentFilter({ ...currentFilter, valueChainsCombination })
                }}
              />
            </Box>
          </Collapse>
        )}

        {isOpenCollapse(currentFilter, EnumCompanyTypeSector.REG) && (
          <Collapse
            sx={{ mt: 3 }}
            header={collapseState => (
              <CollapseHeader
                {...collapseState}
                label="Risk"
                shrink="indicatorDown"
                expand="indicatorUp"
                sx={{ bg: 'gray03', px: 3, py: 3, borderRadius: 10 }}
              />
            )}
          >
            <Box sx={{ my: 3, mx: 2 }}>
              <CheckList
                list={[
                  blankId,
                  ...dataFilter?.risk.map(item => ({ label: item.name, value: item.id })),
                ]}
                listCheck={currentFilter.risk}
                onChange={risk => {
                  setCurrentFilter({ ...currentFilter, risk })
                }}
              />
              <CombinationForm
                state={currentFilter.risksCombination}
                onChange={risksCombination => {
                  setCurrentFilter({ ...currentFilter, risksCombination })
                }}
              />
            </Box>
          </Collapse>
        )}

        {(!currentFilter.category.length ||
          currentFilter.category.some(({ value }) =>
            [
              EnumCompanyTypeSector.FIN,
              EnumCompanyTypeSector.INS,
              EnumCompanyTypeSector.REG,
            ].includes(value as EnumCompanyTypeSector)
          )) && (
          <Collapse
            sx={{ mt: 3 }}
            header={collapseState => (
              <CollapseHeader
                {...collapseState}
                label="Cluster"
                shrink="indicatorDown"
                expand="indicatorUp"
                sx={{ bg: 'gray03', px: 3, py: 3, borderRadius: 10 }}
              />
            )}
          >
            <Box sx={{ my: 3, mx: 2 }}>
              {currentFilter.cluster.map((c, index) => (
                <Box key={index}>
                  <Collapse
                    sx={{ mt: 3 }}
                    header={collapseState => (
                      <Flex>
                        <CollapseHeader
                          {...collapseState}
                          label={`Operation ${index + 1}`}
                          shrink="indicatorDown"
                          expand="indicatorUp"
                          sx={{ flex: 1, bg: 'gray03', px: 3, py: 2, mr: 3, borderRadius: 10 }}
                        />
                        <Button
                          onPress={() => {
                            const newCluster = [...currentFilter.cluster]
                            newCluster.splice(index, 1)
                            setCurrentFilter({ ...currentFilter, cluster: newCluster })
                          }}
                          icon="remove"
                          size="tiny"
                          variant="invert"
                        />
                      </Flex>
                    )}
                  >
                    {index > 0 && (
                      <CombinationForm
                        sx={{ mx: 2 }}
                        state={c.combination}
                        onChange={combination => {
                          const cluster = [...currentFilter.cluster]
                          cluster[index] = { ...cluster[index], combination }
                          setCurrentFilter({ ...currentFilter, cluster })
                        }}
                      />
                    )}
                    <Box sx={{ maxHeight: 222, overflowY: 'auto', my: 3 }}>
                      <Radio
                        label="Blank"
                        sx={{ py: 1, px: 2 }}
                        selected={c.value.some(({ value }) => +value === +blankId.value)}
                        onClick={() => {
                          let cluster = [...currentFilter.cluster]
                          if (c.value.some(({ value }) => +value === +blankId.value)) {
                            cluster[index] = { ...cluster[index], value: [] }
                          } else
                            cluster[index] = {
                              ...cluster[index],
                              value: [blankId],
                            }
                          setCurrentFilter({ ...currentFilter, cluster })
                        }}
                        size="tiny"
                      />
                      <Tree
                        data={tree}
                        format={(
                          n: GetDimensionsItem,
                          onToggle: (n: GetDimensionsItem) => void
                        ) => {
                          const checkList = getChildrenCluster(
                            dataFilter.cluster,
                            c.value[0]?.value
                          )
                          const isChecked = !!checkList.find(item => item === +n.id)
                          if (!n) return null
                          return (
                            <Box onClick={e => e.stopPropagation()} sx={{ width: 'fit-content' }}>
                              <Radio
                                sx={{ py: 1, width: 'fit-content' }}
                                label={n.name}
                                onClick={e => {
                                  let cluster = [...currentFilter.cluster]
                                  if (c.value.some(({ value }) => +value === +n.id)) {
                                    cluster[index] = { ...cluster[index], value: [] }
                                  } else
                                    cluster[index] = {
                                      ...cluster[index],
                                      value: [{ label: n.name, value: +n.id }],
                                    }
                                  setCurrentFilter({ ...currentFilter, cluster })
                                }}
                                size="tiny"
                                selected={isChecked}
                              />
                            </Box>
                          )
                        }}
                      />
                    </Box>
                  </Collapse>

                  <Divider opacity={0.3} my={3} />
                </Box>
              ))}
              <Button
                label="Add operation +"
                sx={{
                  borderRadius: 10,
                  color: 'primary',
                  py: 2,
                  px: 3,
                  mx: 'auto',
                  my: 3,
                }}
                variant="outline"
                onPress={() => {
                  const cluster = [...currentFilter.cluster]
                  cluster.push({
                    value: [],
                    combination: !currentFilter.cluster.length ? ECombination.AND : ECombination.OR,
                  })
                  setCurrentFilter({ ...currentFilter, cluster })
                }}
                size="tiny"
              />
              <SummaryOperation list={currentFilter.cluster} />
            </Box>
          </Collapse>
        )}
      </Collapse>
      <Divider opacity={0.3} my={4} />
    </>
  )
}

export default Category
