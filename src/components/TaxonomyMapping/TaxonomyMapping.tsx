import React, { useEffect, useState } from 'react'
import { Flex, SxStyleProp } from 'theme-ui'
import { useLazyQuery } from '@apollo/client'

import {
  TaxonomyType,
  CompanyTypeSector,
  TagData,
  TagContainerParent,
  ButtonTagType,
  HistoryStack,
  TaxonomyProps,
  TaxonomyState,
  StateSelectedTags,
} from '../../types'
import {
  DimensionType,
  EnumCompanyTypeSector,
  EnumDimensionType,
  EnumDimensionValue,
} from '../../types/enums'
import { TagsSection, TagMapping, ButtonText, Updating, Message } from '..'
import { Paragraph, Section } from '../primitives'
import strings from '../../strings'
import { updatedStateBranch } from '../../utils/updateTaxonomyStateBranch'
import { GET_TAXONOMY } from '../../pages/CompanyForm/graphql'
import CategoryTabPills from '../CategoryTabPills/CategoryTabPills'

type Props = {
  shouldBlockCategory?: {
    [EnumCompanyTypeSector.FIN]?: boolean
    [EnumCompanyTypeSector.INS]?: boolean
    [EnumCompanyTypeSector.REG]?: boolean
  }
  sx?: SxStyleProp
  unSelectableTags?: TagData[]
} & Omit<
  TaxonomyProps,
  | 'setError'
  | 'showViewHistory'
  | 'showPendingChangeRequest'
  | 'overviewPendingRequest'
  | 'viewHistory'
>

const TaxonomyMapping = ({ taxonomyState: state, setTaxonomyState: setState, ...props }: Props) => {
  const {
    pages: {
      addCompanyForm: { taxonomy: copy },
    },
  } = strings

  const [tags, setTags] = useState<Record<DimensionType, TagData[]>[]>()
  const [historyStack, setHistoryStack] = useState<HistoryStack>({
    primary: {
      [EnumCompanyTypeSector.FIN]: [],
      [EnumCompanyTypeSector.INS]: [],
      [EnumCompanyTypeSector.REG]: [],
    },
    aux: {
      [EnumCompanyTypeSector.FIN]: [],
      [EnumCompanyTypeSector.INS]: [],
      [EnumCompanyTypeSector.REG]: [],
    },
  })

  // graphql
  const [getTaxonomy, { data, loading, error: getTaxonomyError }] = useLazyQuery(GET_TAXONOMY)
  const isLoading = loading

  if (data?.getTaxonomy?.taxonomy && JSON.stringify(tags) !== data.getTaxonomy.taxonomy) {
    setTags(JSON.parse(data.getTaxonomy.taxonomy))
  }

  useEffect(() => {
    if (state.selectedMap === EnumCompanyTypeSector.OUT) return
    state.selectedMap && getTaxonomy({ variables: { category: state.selectedMap } })
  }, [state.selectedMap, getTaxonomy])

  const updateHistoryStack = () => {
    if (!selectedMap) return
    let temp = [
      ...(historyStack[tabActive] ? historyStack[tabActive][selectedMap] || [] : []),
    ] as TaxonomyState[]
    if (temp?.length === 100) {
      temp = [...temp.slice(1), state]
    } else {
      temp = [...temp, state]
    }
    setHistoryStack({
      ...historyStack,
      [tabActive]: updatedStateBranch(historyStack[tabActive], selectedMap, temp),
    })
  }

  const {
    tabActive,
    selectedMap,
    selectedTags,
    openedTags,
    tagGroupChildrenSelected,
    extraSelectedTags,
  } = state

  const isExistedCategory = (category: EnumCompanyTypeSector) =>
    tabActive === 'primary' &&
    selectedTags &&
    selectedTags[tabActive] &&
    selectedTags[tabActive]![category] &&
    selectedTags[tabActive]![category]!.length > 0

  const isExistedSomeCategory = (categories: EnumCompanyTypeSector[]) =>
    categories.some(item => isExistedCategory(item))

  const blockFin =
    props.shouldBlockCategory &&
    props.shouldBlockCategory[EnumCompanyTypeSector.FIN] &&
    isExistedSomeCategory([EnumCompanyTypeSector.INS, EnumCompanyTypeSector.REG])

  const blockIns =
    props.shouldBlockCategory &&
    props.shouldBlockCategory[EnumCompanyTypeSector.INS] &&
    isExistedSomeCategory([EnumCompanyTypeSector.FIN, EnumCompanyTypeSector.REG])

  const blockReg =
    props.shouldBlockCategory &&
    props.shouldBlockCategory[EnumCompanyTypeSector.REG] &&
    isExistedSomeCategory([EnumCompanyTypeSector.FIN, EnumCompanyTypeSector.INS])

  const correctSelectedMap = (() => {
    const isBlock = {
      [EnumCompanyTypeSector.FIN]: blockFin,
      [EnumCompanyTypeSector.INS]: blockIns,
      [EnumCompanyTypeSector.REG]: blockReg,
      [EnumCompanyTypeSector.OUT]: false,
    }
    if (selectedMap && !isBlock[selectedMap]) return selectedMap

    return blockFin
      ? blockIns
        ? blockReg
          ? selectedMap
          : EnumCompanyTypeSector.REG
        : EnumCompanyTypeSector.INS
      : EnumCompanyTypeSector.FIN
  })()

  useEffect(() => {
    if (correctSelectedMap !== selectedMap) {
      setState({ ...state, selectedMap: correctSelectedMap })
    }
  })

  const selectedMapsCount = {
    primary:
      selectedTags && selectedTags.primary
        ? Object.values(selectedTags.primary!).reduce((p: number, c) => p + (c || []).length, 0)
        : 0,
    aux:
      selectedTags && selectedTags.aux
        ? Object.values(selectedTags.aux).reduce((p: number, c) => p + (c || []).length, 0)
        : 0,
  }

  const buttonsMap: ButtonTagType[] = [
    {
      label: copy.maps.buttons.fintech,
      value: EnumCompanyTypeSector.FIN,
      disabled: blockFin,
    },
    {
      label: copy.maps.buttons.insuretech,
      value: EnumCompanyTypeSector.INS,
      disabled: blockIns,
    },
    {
      label: copy.maps.buttons.regTech,
      value: EnumCompanyTypeSector.REG,
      disabled: blockReg,
    },
    {
      label: copy.maps.buttons.out,
      value: EnumCompanyTypeSector.OUT,
      hidden: tabActive === 'aux',
    },
  ]

  const onMapButtonsPress = (selectedMap: CompanyTypeSector) => {
    let newState = { ...state, selectedMap }
    if (selectedMap === EnumCompanyTypeSector.OUT) {
      newState = {
        ...newState,
        selectedTags: undefined,
        tagGroupSelected: undefined,
        extraSelectedTags: [],
        tagGroupChildrenSelected: [],
      }
    }
    updateHistoryStack()

    setState(newState)
  }

  const onSelectTags = (
    type: Exclude<CompanyTypeSector, EnumCompanyTypeSector.OUT>,
    tags: TagData[]
  ) => {
    const last = tags[tags.length - 1]
    tags.filter(t => t.dimensionType !== last.dimensionType || t.id === last.id)

    const newSelectedTags = updatedStateBranch(
      selectedTags,
      `${tabActive}.${type}`,
      tabActive === 'primary'
        ? type === EnumCompanyTypeSector.FIN
          ? tags.slice(-1)
          : tags.filter(t => t.dimensionType !== last.dimensionType || t.id === last.id) // allow 2 tags with different dimensionType
        : tags
    )

    let newExtraSelectedTags: TagData[] = []
    if (
      newSelectedTags.primary &&
      newSelectedTags.primary.fintech &&
      newSelectedTags.primary.fintech.length > 0
    ) {
      newExtraSelectedTags = newSelectedTags.primary.fintech
        .filter((t: TagData) => t.parent && t.parent[0])
        .map((t: TagData) => t.parent[0])
    }
    updateHistoryStack()
    setState({
      ...state,
      selectedTags: newSelectedTags,
      extraSelectedTags: newExtraSelectedTags,
    })
  }

  const onOpenTags = (
    type: Exclude<CompanyTypeSector, EnumCompanyTypeSector.OUT>,
    dimension: DimensionType,
    parents: TagContainerParent
  ) => {
    const clone = updatedStateBranch(openedTags, `${tabActive}.${type}.${dimension}`, parents)
    updateHistoryStack()
    setState({
      ...state,
      openedTags: clone,
    })
  }

  const onClickRemove = (
    tab: TaxonomyType,
    type: Exclude<CompanyTypeSector, EnumCompanyTypeSector.OUT>,
    tagData: TagData
  ) => {
    if (tab === 'group') {
      setState({
        ...state,
        tagGroupChildrenSelected: tagGroupChildrenSelected.filter(t => t.id !== tagData.id),
      })
      return
    }

    if (!selectedTags || !selectedMap || selectedMap === EnumCompanyTypeSector.OUT) return

    const newSelectedTagsByTab = selectedTags![tab]![type]?.filter(a =>
      type === EnumCompanyTypeSector.FIN ? a.link_id !== tagData.link_id : a.id !== tagData.id
    )
    const newSelectedTags = {
      ...state.selectedTags,
      [tab]: { ...selectedTags![tab], [type]: newSelectedTagsByTab },
    }

    let newExtraSelectedTags: TagData[] = []
    if (
      newSelectedTags.primary &&
      newSelectedTags.primary.fintech &&
      newSelectedTags.primary.fintech.length > 0
    ) {
      newExtraSelectedTags = newSelectedTags.primary.fintech
        .filter((t: TagData) => t.parent && t.parent[0])
        .map((t: TagData) => t.parent[0])
    }
    updateHistoryStack()

    setState({
      ...state,
      selectedTags: newSelectedTags,
      extraSelectedTags: newExtraSelectedTags,
    })
  }

  const onClearAllSelectedTags = () => {
    updateHistoryStack()
    setState({
      ...state,
      selectedTags: undefined,
      extraSelectedTags: [],
    })
  }

  /* TODO: Update undo function */
  const onClickUndo = () => {
    if (!selectedMap) return
    const activeStack = historyStack[tabActive][selectedMap]
    if (!activeStack) return
    const last = activeStack[activeStack.length - 1]

    const newSelectedTags = updatedStateBranch(
      selectedTags,
      `${tabActive}.${selectedMap}`,
      last?.selectedTags &&
        last.selectedTags[tabActive] &&
        last.selectedTags[tabActive]![selectedMap]
        ? last.selectedTags[tabActive]![selectedMap]
        : []
    )

    let newExtraSelectedTags: TagData[] = []

    if (
      newSelectedTags.primary &&
      newSelectedTags.primary.fintech &&
      newSelectedTags.primary.fintech.length > 0
    ) {
      newExtraSelectedTags = newSelectedTags.primary.fintech
        .filter((t: TagData) => t.parent && t.parent[0])
        .map((t: TagData) => t.parent[0])
    }

    setState({
      ...state,
      selectedTags: newSelectedTags,
      openedTags: updatedStateBranch(
        openedTags,
        `${tabActive}.${selectedMap}`,
        last?.openedTags && last.openedTags[tabActive]
          ? last.openedTags[tabActive]![selectedMap] || []
          : {}
      ),
      extraSelectedTags: newExtraSelectedTags,
    })

    setHistoryStack({
      ...historyStack,
      [tabActive]: updatedStateBranch(
        historyStack[tabActive],
        selectedMap,
        [...activeStack].slice(0, -1) || []
      ),
    })
  }

  const getExtraMappings = ({
    selectedTags,
    typeTech,
    extraSelectedTags,
  }: {
    selectedTags: StateSelectedTags
    typeTech: EnumCompanyTypeSector
    extraSelectedTags?: TagData[]
  }) => {
    const prims = (selectedTags?.primary || {})[typeTech] || []
    const auxs = (selectedTags?.aux || {})[typeTech] || []
    const dimension = EnumDimensionValue.SECONDARY
    return {
      primary: {
        data: [
          ...(extraSelectedTags || []).filter(() => typeTech === EnumCompanyTypeSector.FIN),
          ...prims.filter(t => t.dimension === dimension),
        ],
      },
      aux: {
        data: auxs.filter(t => t.dimension === dimension),
      },
    }
  }

  return (
    <>
      <Section sx={{ p: 3, ...props.sx }}>
        <Flex sx={{ mt: 4, alignItems: 'center' }}>
          <CategoryTabPills
            buttonsMap={buttonsMap}
            onMapButtonsPress={onMapButtonsPress}
            selectedMap={selectedMap}
          />

          {selectedTags && selectedTags[tabActive] && (
            <Paragraph sx={{ color: 'primary' }} bold>{`${
              selectedMapsCount.primary + selectedMapsCount.aux
            } ${
              selectedMapsCount.primary + selectedMapsCount.aux === 1
                ? copy.maps.selected.one
                : copy.maps.selected.more
            }`}</Paragraph>
          )}
        </Flex>

        {getTaxonomyError && selectedMap !== EnumCompanyTypeSector.OUT ? (
          <Flex sx={{ alignItems: 'center', pt: 7, justifyContent: 'center' }}>
            <Message variant="alert" body="Failed to fetch data." />
            {state.selectedMap && (
              <ButtonText
                label="Retry ?"
                onPress={() => getTaxonomy({ variables: { category: state.selectedMap } })}
                sx={{
                  textTransform: 'uppercase',
                  color: 'red',
                  ml: 1,
                  borderColor: 'red',
                  '&:hover': {
                    color: 'red',
                  },
                }}
              />
            )}
          </Flex>
        ) : (
          <>
            {tags && selectedMap && selectedMap !== EnumCompanyTypeSector.OUT ? (
              <>
                {isLoading ? (
                  <Updating loading />
                ) : (
                  <>
                    {tags.map((objectTag, index) => {
                      const key = Object.keys(objectTag)[0] as EnumDimensionType
                      const tagData = objectTag[key]
                      return (
                        <TagsSection
                          key={index}
                          sx={{ mt: 6 }}
                          tags={tagData}
                          type={selectedMap}
                          dimension={key}
                          onSelectTags={onSelectTags}
                          onOpenTags={onOpenTags}
                          selected={
                            selectedTags &&
                            selectedTags[tabActive] &&
                            selectedTags[tabActive]![selectedMap]
                              ? selectedTags[tabActive]![selectedMap]
                              : []
                          }
                          openedTags={
                            openedTags &&
                            openedTags[tabActive] &&
                            openedTags[tabActive]![selectedMap] &&
                            openedTags[tabActive]![selectedMap]![key]
                              ? openedTags[tabActive]![selectedMap]![key]
                              : { parent: [], tags: [] }
                          }
                          onClickUndo={onClickUndo}
                          showUndo={index === tags.length - 1}
                          unselectable={props.unSelectableTags}
                        />
                      )
                    })}
                  </>
                )}
                {selectedTags && selectedMap && (
                  <>
                    {Object.values(EnumCompanyTypeSector).map((typeTech, index) => {
                      if (typeTech === EnumCompanyTypeSector.OUT) return null
                      if (
                        (selectedTags.primary &&
                          selectedTags.primary[typeTech] &&
                          selectedTags.primary[typeTech]!.length > 0) ||
                        (selectedTags.aux &&
                          selectedTags.aux[typeTech] &&
                          selectedTags.aux[typeTech]!.length > 0)
                      ) {
                        return (
                          <TagMapping
                            key={index}
                            sx={{ mt: 6 }}
                            typeTech={typeTech}
                            title={copy.types[typeTech as keyof typeof copy.types]}
                            onClickRemove={onClickRemove}
                            mappings={{
                              primary: {
                                data:
                                  selectedTags.primary && selectedTags.primary[typeTech]
                                    ? selectedTags.primary[typeTech]?.filter(
                                        t => t.dimension === EnumDimensionValue.PRIMARY
                                      ) || []
                                    : [],
                              },
                              aux: {
                                data:
                                  selectedTags.aux && selectedTags.aux[typeTech]
                                    ? selectedTags.aux[typeTech]?.filter(
                                        t => t.dimension === EnumDimensionValue.PRIMARY
                                      ) || []
                                    : [],
                              },
                            }}
                            extras={getExtraMappings({ selectedTags, typeTech, extraSelectedTags })}
                          />
                        )
                      }
                      return null
                    })}

                    {(!!selectedMapsCount.primary || !!selectedMapsCount.aux) && (
                      <ButtonText
                        onPress={onClearAllSelectedTags}
                        label={strings.common.clearAllButton}
                        sx={{ mt: 4 }}
                      />
                    )}
                  </>
                )}
              </>
            ) : (
              isLoading && selectedMap !== EnumCompanyTypeSector.OUT && <Updating loading />
            )}
          </>
        )}
      </Section>
    </>
  )
}

export default TaxonomyMapping
