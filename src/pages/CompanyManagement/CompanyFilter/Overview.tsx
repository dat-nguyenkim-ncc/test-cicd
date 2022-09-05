import React from 'react'
import { CheckList, SearchBox, YearRange } from '.'
import { Box, Divider, Flex } from '@theme-ui/components'
import { Button, Checkbox, Collapse, Dropdown, Icon, Radio } from '../../../components'
import {
  blankText,
  categoryOptions,
  ECombination,
  employeeCountOptions,
  fintechTypeOptions,
  getChildrenCluster,
  mappingTypeOptions,
  OperationFilterType,
  OverviewFilterType,
} from './helpers'
import Tree, { ITree } from '../../../components/Tree'
import { GetDimensionsItem } from '../../TaxonomyManagement'
import { getLevel } from '../../TaxonomyManagement/helper'
import { fctStatusOptions, status } from '../../CompanyForm/mock'
import { EnumCompanyTypeSector } from '../../../types/enums'
import CollapseHeader from './CollapseHeader'
import { blankId } from './helpers'
import CombinationForm from './CombinationForm'
import { FormOption, TagData } from '../../../types'
import { Text } from 'theme-ui'

type OverviewProps = {
  data: {
    sector: GetDimensionsItem[]
    cluster: GetDimensionsItem[]
    valueChain: GetDimensionsItem[]
    insCluster: GetDimensionsItem[]
    risk: GetDimensionsItem[]
    regCluster: GetDimensionsItem[]
    tagGroups: TagData[]
  }
  state: OverviewFilterType
  clusters: GetDimensionsItem[]
  onChange(state: OverviewFilterType): void
}

const TagGroupsTree = ({
  data,
  selected,
  onChange,
}: {
  data: TagData
  selected: number[]
  onChange(selected: FormOption[]): void
}) => {
  return (
    <Collapse
      header={collapseState => (
        <CollapseHeader
          {...collapseState}
          label={data.label}
          shrink="indicatorDown"
          expand="indicatorUp"
          sx={{ py: 1, borderRadius: 2, px: 1, '&:hover': { bg: 'bgGray' } }}
          bold={false}
        />
      )}
    >
      <Box sx={{ py: 1, pl: 1, bg: 'gray03', borderRadius: 4 }}>
        {!!data.children?.length &&
          data.children.map((item, index) => (
            <Box
              key={index}
              sx={{
                borderLeft: '1px solid #D7D7D7',
                pl: 1,
                position: 'relative',
              }}
            >
              <Radio
                sx={{
                  '&:before': {
                    content: '""',
                    position: 'absolute',
                    left: 0,
                    top: '50%',
                    borderTop: '1px solid #D7D7D7',
                    width: '8px',
                  },
                  '&:hover': {
                    bg: 'white',
                  },
                  p: 1,
                  ml: 1,
                  borderRadius: 2,
                }}
                label={item.label}
                selected={selected.includes(+item.id)}
                onClick={() => {
                  onChange(
                    selected.includes(+item.id) ? [] : [{ label: item.label, value: item.id }]
                  )
                }}
                size="tiny"
              />
            </Box>
          ))}
      </Box>
    </Collapse>
  )
}
export const SummaryOperation = ({ list }: { list: OperationFilterType[] }) => {
  const sum = list.filter(item => !!item.value.length)
  return !!sum.length ? (
    <Text sx={{ fontSize: 14 }}>
      <span style={{ fontWeight: 'bold' }}>{`Summary: `}</span>
      {`${sum.map((item, index) => (index + 1 < sum.length ? '(' : '')).join('')}${sum
        .map(
          (item, index) =>
            `${index > 0 ? ` ${item.combination.toUpperCase()} ` : ''} ${item.isNot ? 'NOT ' : ''}${
              item.value[0].label
            }${index > 0 ? ')' : ''}`
        )
        .join('')}`}
    </Text>
  ) : (
    <></>
  )
}

const Overview = ({ data, state, clusters, onChange }: OverviewProps) => {
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

  return (
    <>
      <Collapse header={collapseState => <CollapseHeader {...collapseState} label="Overview" />}>
        <Box sx={{ my: 3, mx: 2 }}>
          <Collapse
            header={collapseState => (
              <CollapseHeader
                {...collapseState}
                label="Company Description"
                shrink="indicatorDown"
                expand="indicatorUp"
                sx={{ bg: 'gray03', px: 3, py: 3, borderRadius: 10 }}
              />
            )}
          >
            <Box sx={{ my: 3, mx: 2 }}>
              <Checkbox
                label="Blank"
                sx={{ mb: 3 }}
                square
                checked={state.isBlankDescription}
                onPress={() => {
                  onChange({
                    ...state,
                    isBlankDescription: !state.isBlankDescription,
                  })
                }}
              />
              <SearchBox
                onPress={value => {
                  if (!state.description.find(item => item === value)) {
                    onChange({ ...state, description: [...state.description, value] })
                  }
                }}
                onClose={value => {
                  onChange({
                    ...state,
                    description: [...state.description.filter(item => item !== value)],
                  })
                }}
                placeholder="Eg: RegTech, Account-based"
                state={state.description}
                disabled={state.isBlankDescription}
              />
              <CombinationForm
                state={state.descriptionCombination}
                disabled={state.isBlankDescription}
                onChange={descriptionCombination => {
                  onChange({ ...state, descriptionCombination })
                }}
              />
            </Box>
          </Collapse>
          <Collapse
            sx={{ mt: 3 }}
            header={collapseState => (
              <CollapseHeader
                {...collapseState}
                label="Mapping type"
                shrink="indicatorDown"
                expand="indicatorUp"
                sx={{ bg: 'gray03', px: 3, py: 3, borderRadius: 10 }}
              />
            )}
          >
            <Box sx={{ my: 3, mx: 2 }}>
              {mappingTypeOptions.map((item, index) => (
                <Radio
                  key={index}
                  sx={{ mt: index > 0 ? 3 : 0 }}
                  label={item.label}
                  selected={state.mappingType === item.value}
                  onClick={() => {
                    if (state.mappingType !== item.value)
                      onChange({ ...state, mappingType: item.value })
                    else onChange({ ...state, mappingType: null })
                  }}
                  size="tiny"
                />
              ))}
            </Box>
          </Collapse>
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
                listCheck={state.category}
                onChange={category => {
                  onChange({
                    ...state,
                    category,
                    sector: [],
                    valueChain: [],
                    risk: [],
                    cluster: state.cluster.map(item => ({ ...item, value: [] })),
                  })
                }}
              />
              <CombinationForm
                state={state.categoryCombination}
                onChange={categoryCombination => {
                  onChange({ ...state, categoryCombination })
                }}
              />
            </Box>
          </Collapse>
          {(!state.category.length ||
            state.category.some(({ value }) => value === EnumCompanyTypeSector.FIN)) && (
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
                    ...data?.sector.map(item => ({ label: item.name, value: item.id })),
                  ]}
                  listCheck={state.sector}
                  onChange={sector => {
                    onChange({
                      ...state,
                      sector,
                    })
                  }}
                />
                <CombinationForm
                  state={state.sectorsCombination}
                  onChange={sectorsCombination => {
                    onChange({ ...state, sectorsCombination })
                  }}
                />
              </Box>
            </Collapse>
          )}

          {(!state.category.length ||
            state.category.some(({ value }) => value === EnumCompanyTypeSector.INS)) && (
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
                    ...data?.valueChain.map(item => ({ label: item.name, value: item.id })),
                  ]}
                  listCheck={state.valueChain}
                  onChange={valueChain => {
                    onChange({ ...state, valueChain })
                  }}
                />
                <CombinationForm
                  state={state.valueChainsCombination}
                  onChange={valueChainsCombination => {
                    onChange({ ...state, valueChainsCombination })
                  }}
                />
              </Box>
            </Collapse>
          )}

          {(!state.category.length ||
            state.category.some(({ value }) => value === EnumCompanyTypeSector.REG)) && (
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
                    ...data?.risk.map(item => ({ label: item.name, value: item.id })),
                  ]}
                  listCheck={state.risk}
                  onChange={risk => {
                    onChange({ ...state, risk })
                  }}
                />
                <CombinationForm
                  state={state.risksCombination}
                  onChange={risksCombination => {
                    onChange({ ...state, risksCombination })
                  }}
                />
              </Box>
            </Collapse>
          )}

          {(!state.category.length ||
            state.category.some(({ value }) =>
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
                {state.cluster.map((c, index) => (
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
                              const newCluster = [...state.cluster]
                              newCluster.splice(index, 1)
                              onChange({
                                ...state,
                                cluster: newCluster,
                              })
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
                            const cluster = [...state.cluster]
                            cluster[index] = { ...cluster[index], combination }
                            onChange({ ...state, cluster })
                          }}
                        />
                      )}
                      <Box sx={{ maxHeight: 222, overflowY: 'auto', my: 3 }}>
                        <Radio
                          label="Blank"
                          sx={{ py: 1, px: 2 }}
                          selected={c.value.some(({ value }) => +value === +blankId.value)}
                          onClick={() => {
                            let cluster = [...state.cluster]
                            if (c.value.some(({ value }) => +value === +blankId.value)) {
                              cluster[index] = { ...cluster[index], value: [] }
                            } else
                              cluster[index] = {
                                ...cluster[index],
                                value: [blankId],
                              }
                            onChange({ ...state, cluster })
                          }}
                          size="tiny"
                        />
                        <Tree
                          data={tree}
                          format={(
                            n: GetDimensionsItem,
                            onToggle: (n: GetDimensionsItem) => void
                          ) => {
                            const checkList = getChildrenCluster(data.cluster, c.value[0]?.value)
                            const isChecked = !!checkList.find(item => item === +n.id)
                            if (!n) return null
                            return (
                              <Box onClick={e => e.stopPropagation()} sx={{ width: 'fit-content' }}>
                                <Radio
                                  sx={{ py: 1, width: 'fit-content' }}
                                  label={n.name}
                                  onClick={e => {
                                    let cluster = [...state.cluster]
                                    if (c.value.some(({ value }) => +value === +n.id)) {
                                      cluster[index] = { ...cluster[index], value: [] }
                                    } else
                                      cluster[index] = {
                                        ...cluster[index],
                                        value: [{ label: n.name, value: +n.id }],
                                      }
                                    onChange({ ...state, cluster })
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
                    const cluster = [...state.cluster]
                    cluster.push({
                      value: [],
                      combination: !state.cluster.length ? ECombination.AND : ECombination.OR,
                    })
                    onChange({
                      ...state,
                      cluster,
                    })
                  }}
                  size="tiny"
                />
                <SummaryOperation list={state.cluster} />
              </Box>
            </Collapse>
          )}
          <Collapse
            sx={{ mt: 3 }}
            header={collapseState => (
              <CollapseHeader
                {...collapseState}
                label="Tags"
                shrink="indicatorDown"
                expand="indicatorUp"
                sx={{ bg: 'gray03', px: 3, py: 3, borderRadius: 10 }}
              />
            )}
          >
            <Box sx={{ my: 3, mx: 2 }}>
              {state.tags.map((tag, index) => {
                const onChangeTags = (value: FormOption[]) => {
                  const tags = [...state.tags]
                  tags[index] = { ...tags[index], value }
                  onChange({ ...state, tags })
                }
                const selectedIds = tag.value.map(({ value }) => +value)
                return (
                  <Collapse
                    sx={{ mt: 3 }}
                    key={index}
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
                            const newTags = [...state.tags]
                            newTags.splice(index, 1)
                            onChange({
                              ...state,
                              tags: newTags,
                            })
                          }}
                          icon="remove"
                          size="tiny"
                          variant="invert"
                        />
                      </Flex>
                    )}
                  >
                    <Flex sx={{ mx: 2 }}>
                      {index > 0 && (
                        <CombinationForm
                          state={tag.combination}
                          onChange={combination => {
                            const tags = [...state.tags]
                            tags[index] = { ...tags[index], combination }
                            onChange({ ...state, tags })
                          }}
                        />
                      )}
                      <Checkbox
                        sx={{ flex: 1, mt: 3, px: 1, justifyContent: 'flex-end' }}
                        checked={!!tag.isNot}
                        gap={2}
                        onPress={() => {
                          const tags = [...state.tags]
                          tags[index] = { ...tags[index], isNot: !tags[index].isNot }
                          onChange({ ...state, tags })
                        }}
                        size="tiny"
                        label="Not"
                      />
                    </Flex>
                    <Box sx={{ my: 3, mx: 2, maxHeight: 222, overflowY: 'auto' }}>
                      <Radio
                        sx={{ py: 1, '&:hover': { bg: 'bgGray' } }}
                        label={blankId.label}
                        selected={selectedIds.includes(blankId.value)}
                        onClick={() => {
                          onChangeTags(!selectedIds.includes(blankId.value) ? [blankId] : [])
                        }}
                        size="tiny"
                      />
                      {data.tagGroups.map((item, i) => (
                        <TagGroupsTree
                          key={i}
                          data={item}
                          selected={selectedIds}
                          onChange={onChangeTags}
                        />
                      ))}
                    </Box>
                  </Collapse>
                )
              })}
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
                  const tags = [...state.tags]
                  tags.push({
                    value: [],
                    combination: !state.tags.length ? ECombination.AND : ECombination.OR,
                    isNot: false,
                  })
                  onChange({ ...state, tags })
                }}
                size="tiny"
              />
              <SummaryOperation list={state.tags} />
            </Box>
          </Collapse>
          <Collapse
            sx={{ mt: 3 }}
            header={collapseState => (
              <CollapseHeader
                {...collapseState}
                label="FinTech Type"
                shrink="indicatorDown"
                expand="indicatorUp"
                sx={{ bg: 'gray03', px: 3, py: 3, borderRadius: 10 }}
              />
            )}
          >
            <Box sx={{ my: 3, mx: 2 }}>
              <CheckList
                list={fintechTypeOptions}
                listCheck={state.fintechTypes}
                onChange={fintechTypes => {
                  onChange({ ...state, fintechTypes })
                }}
              />
              <CombinationForm
                state={state.fintechTypesCombination}
                onChange={fintechTypesCombination => {
                  onChange({ ...state, fintechTypesCombination })
                }}
              />
            </Box>
          </Collapse>
          <Collapse
            sx={{ mt: 3 }}
            header={collapseState => (
              <CollapseHeader
                {...collapseState}
                label="Operation Status"
                shrink="indicatorDown"
                expand="indicatorUp"
                sx={{ bg: 'gray03', px: 3, py: 3, borderRadius: 10 }}
              />
            )}
          >
            <Box sx={{ my: 3, mx: 2 }}>
              {[blankText, ...status].map((item, index) => {
                const isSelected = state.operationStatuses === item.value
                return (
                  <Radio
                    key={index}
                    sx={{ mt: index > 0 ? 3 : 0 }}
                    label={item.label}
                    selected={isSelected}
                    onClick={() =>
                      onChange({ ...state, operationStatuses: isSelected ? null : item.value })
                    }
                    size="tiny"
                  />
                )
              })}
            </Box>
          </Collapse>
          <Collapse
            sx={{ mt: 3 }}
            header={collapseState => (
              <CollapseHeader
                {...collapseState}
                label="Founded Year"
                shrink="indicatorDown"
                expand="indicatorUp"
                sx={{ bg: 'gray03', px: 3, py: 3, borderRadius: 10 }}
              />
            )}
          >
            <Box sx={{ my: 3, mx: 2 }}>
              <Checkbox
                label="Blank"
                sx={{ mb: 3 }}
                square
                checked={state.isBlankFoundedYear}
                onPress={() => {
                  onChange({
                    ...state,
                    isBlankFoundedYear: !state.isBlankFoundedYear,
                  })
                }}
              />
              <YearRange
                isRange={state.years.isRange}
                setIsRange={() => {
                  onChange({ ...state, years: { ...state.years, isRange: !state.years.isRange } })
                }}
                state={state.years}
                onChange={(years: any) => {
                  onChange({ ...state, years })
                }}
                disabled={state.isBlankFoundedYear}
              />
            </Box>
          </Collapse>
          <Collapse
            sx={{ mt: 3 }}
            header={collapseState => (
              <CollapseHeader
                {...collapseState}
                label="Employee Count"
                shrink="indicatorDown"
                expand="indicatorUp"
                sx={{ bg: 'gray03', px: 3, py: 3, borderRadius: 10 }}
              />
            )}
          >
            <Box sx={{ my: 3, mx: 2 }}>
              <Checkbox
                label="Blank"
                sx={{ mb: 3 }}
                square
                checked={state.isBlankEmployeesCount}
                onPress={() => {
                  onChange({
                    ...state,
                    isBlankEmployeesCount: !state.isBlankEmployeesCount,
                  })
                }}
              />
              <Flex>
                <Dropdown
                  sx={{ flex: 1 }}
                  name="from"
                  value={state.employeeCount.from}
                  options={employeeCountOptions.map(item => ({
                    ...item,
                    label: item.label.slice(0, item.label.indexOf('-')),
                  }))}
                  onChange={({ target: { value } }) => {
                    onChange({
                      ...state,
                      employeeCount: {
                        from: value,
                        to:
                          +value > +state.employeeCount.to
                            ? employeeCountOptions[employeeCountOptions.length - 1].value
                            : state.employeeCount.to,
                      },
                    })
                  }}
                  disabled={state.isBlankEmployeesCount}
                />
                <Icon sx={{ px: 3 }} icon="minus" />
                <Dropdown
                  sx={{ flex: 1 }}
                  name="to"
                  value={state?.employeeCount?.to}
                  options={employeeCountOptions
                    .filter(({ value }) => +value >= +state.employeeCount.from)
                    .map(item => ({
                      ...item,
                      label: item.label.slice(item.label.indexOf('-') + 1),
                    }))}
                  onChange={({ target }) => {
                    onChange({
                      ...state,
                      employeeCount: { ...state.employeeCount, to: target.value },
                    })
                  }}
                  disabled={state.isBlankEmployeesCount}
                />
              </Flex>
            </Box>
          </Collapse>
          <Collapse
            sx={{ mt: 3 }}
            header={collapseState => (
              <CollapseHeader
                {...collapseState}
                label="FCT status"
                shrink="indicatorDown"
                expand="indicatorUp"
                sx={{ bg: 'gray03', px: 3, py: 3, borderRadius: 10 }}
              />
            )}
          >
            <Box sx={{ my: 3, mx: 2 }}>
              {fctStatusOptions.map((item, index) => {
                const isSelected = state.fctStatusId === +item.value
                return (
                  <Radio
                    key={index}
                    sx={{ mt: index > 0 ? 3 : 0 }}
                    label={item.label}
                    selected={isSelected}
                    onClick={() =>
                      onChange({ ...state, fctStatusId: isSelected ? null : +item.value })
                    }
                    size="tiny"
                  />
                )
              })}
            </Box>
          </Collapse>
        </Box>
      </Collapse>
      <Divider opacity={0.3} my={4} />
    </>
  )
}

export default Overview
