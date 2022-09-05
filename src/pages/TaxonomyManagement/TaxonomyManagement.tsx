import React, { MouseEvent } from 'react'
import { Heading, Paragraph } from '../../components/primitives'
import {
  Button,
  Checkbox,
  FooterCTAs,
  Icon,
  List,
  Modal,
  SwipeButton,
  TabButtonMenu,
  TabMenuCategories,
  TextField,
  Updating,
  VerticalDivider,
  BoundCard,
  MergeClusters,
} from '../../components'
import { Section } from '../../components/primitives'
import strings from '../../strings'
import { EnumDimensionCategories } from '../../types/enums'
import { Flex, Grid, Text } from '@theme-ui/components'
import EditInline, { IconButtons } from '../../components/EditInline'
import { useApolloClient, useLazyQuery, useMutation, useQuery } from '@apollo/client'
import {
  MODIFY_DIMENSIONS,
  GetDimensionsInput,
  GET_DIMENSIONS,
  GET_NUMBER_OF_MAPPING,
  CHECK_CLUSTERS_MOVABLE,
  CheckClustersMovableInput,
  CheckClustersMovableResult,
  UpdateMappingInput,
  UPDATE_MAPPING,
  MERGE_CLUSTERS,
  Category,
  GET_CATEGORY,
  CATEGORY_ID,
  EditCategoryInput,
  EDIT_CATEGORY,
} from './graphql/'
import Tree from '../../components/Tree'
import { ITree, Node } from '../../components/Tree'
import useSelection from '../../hooks/useSelection'
import { ButtonProps, ChangeFieldEvent } from '../../types'
import { onError } from '../../sentry'
import { localstorage, LocalstorageFields, startCase, uniq } from '../../utils'
import { Box } from 'theme-ui'
import {
  DimensionInputItem,
  GetDimensionsItem,
  EditDimensionInputItem,
  Dimension,
  MovingDimensionsItem,
} from '.'
import { v4 as uuidv4 } from 'uuid'
import { AddDimensionInputItem, ModifyDimensionsInput } from './graphql/modifyDimensions'
import MoveTaxonomyModal from '../../components/MoveTaxonomyModal'
import {
  SubMenuKeys,
  CategoryDimension,
  map,
  getDescendants,
  DimensionMenuItem,
  getLevel,
  mergeList,
  dimensionInputToNode,
  getSubTree,
  menuItems,
  Interrelationship,
  nodeToDimensionInput,
  getDeep,
  getAncestorAtLevel,
  isSector,
} from './helper'
import { GET_TAXONOMY } from '../CompanyForm/graphql'
import NavigationConfirm from '../../components/NavigationConfirm/NavigationConfirm'
import { ErrorModal } from '../../components/ErrorModal'
import { Palette } from '../../theme'
import { HandleClusterMoving } from '../../components/HandleClusterMoving'
import { MergeClustersInput } from './graphql/mergeClusters'
import { TextFieldProps } from '../../components/TextField/TextField'
import EditCategoryForm from '../../components/EditCategoryForm/EditCategoryForm'
import { ETLRunTimeContext } from '../../context'
import { getChildrenCluster } from '../CompanyManagement/CompanyFilter/helpers'

enum Modals {
  add = 'add',
  move = 'move',
  edit = 'edit',
  success = 'success',
  saving = 'saving',
  merge = 'mergeClusters',
}

type ModalState = {
  type: Modals
  data?: any
}

export const MAX_LEVELS: Record<EnumDimensionCategories, Record<string, number>> = {
  [EnumDimensionCategories.FIN]: {
    [SubMenuKeys.sector]: 1,
    [SubMenuKeys.cluster]: 5,
  },
  [EnumDimensionCategories.INS]: {
    [SubMenuKeys['value chain']]: 1,
    [SubMenuKeys.cluster]: 4,
  },
  [EnumDimensionCategories.REG]: {
    [SubMenuKeys.risk]: 1,
    [SubMenuKeys.cluster]: 2,
  },
}

type Props = any

const TaxonomyManagement = (props: Props) => {
  const { taxonomyManagement: copy } = strings
  // STATE

  const { checkTimeETL } = React.useContext(ETLRunTimeContext)

  const [category, _setCategory] = React.useState<EnumDimensionCategories>(
    EnumDimensionCategories.FIN
  )
  const [levelState] = React.useState(1)
  const [dimensionState, setDimensionState] = React.useState<SubMenuKeys>(SubMenuKeys.cluster)

  const setCategory = (c: EnumDimensionCategories) => {
    _setCategory(c)
    setExtra([])
    setDimensionState(SubMenuKeys.cluster)
  }

  const {
    selectionList: modifiedCategoryList,
    select: selectModifiedCategories,
    reset: resetModifiedCategories,
  } = useSelection<CategoryDimension>()

  const [extra, setExtra] = React.useState<GetDimensionsItem[]>([])
  const [loadingState, setLoadingState] = React.useState(false)

  // NOTE: Use getMovingList() to get data of movingList with each category
  const {
    selectionList: movingList,
    isSelected: isInMovingList,
    reset: resetMovingList,
    // select,
    deselect: deselectMovingList,
    toggleSelect,
  } = useSelection<GetDimensionsItem>([], (item: GetDimensionsItem) => item?.id)
  const [moveToState, setMoveToState] = React.useState<GetDimensionsItem>()
  const [checkMovableState, setCheckMovableState] = React.useState<CheckClustersMovableResult>()
  // Keep open state
  const { select: selectOpening, isSelected: isOpening, toggleSelect: toggleOpen } = useSelection<
    string
  >()

  const [modal, setModal] = React.useState<ModalState>()
  const [defaultCluster, setDefaultCluster] = React.useState<GetDimensionsItem | null>(null)

  const defaultCreateEditItem: DimensionInputItem = {
    id: '',
    name: '',
    canBeFinal: false,
    level: 1,
    category,
    dimension: map[category][dimensionState],
    description: '',
  }
  const [createEditItem, setCreateEditItem] = React.useState(defaultCreateEditItem)
  // Each item in "createList" must have an uniq "id" auto generate by "uuidv4"
  // "id" is undefined until user click "Create" on add modal
  const [createList, setCreateList] = React.useState<DimensionInputItem[]>([])
  const [editList, _setEditList] = React.useState<DimensionInputItem[]>([])
  const setEditList = (list: DimensionInputItem[]) => {
    const keys: Array<keyof DimensionInputItem> = [
      'id',
      'name',
      'canBeFinal',
      'category',
      'parentId',
      'dimension',
      'level',
      'description',
    ]
    const actualEditedList = list.filter(
      value =>
        !data?.getDimensions?.items.some(i =>
          keys.every(key =>
            typeof i[key] === 'string'
              ? `${i[key]}`.trim() === `${value[key]}`.trim()
              : i[key] === value[key]
          )
        )
    )
    _setEditList(actualEditedList)
  }
  const updateCreateEditItem = (obj: Partial<typeof defaultCreateEditItem>) => {
    setCreateEditItem({ ...createEditItem, ...obj })
  }

  const [removeList, setRemoveList] = React.useState<string[]>([])
  const [pendingRemove, setPendingRemove] = React.useState<{
    deleteItems: Node[]
    affectedList: string[]
    pendingRemoveList: string[]
  }>()

  const [activeSector, setActiveSector] = React.useState<GetDimensionsItem>()
  const {
    selectionList: interrelationshipList,
    toggleSelect: toggleInterrelationship,
    find: findInterrelationship,
    reset: resetInterrelationship,
    deselect: deselectInterrelationship,
  } = useSelection(
    [],
    (item: Interrelationship) => `${item.dimension1Id}-${item.dimension2Id}-${item.category}`
  )

  const onRemoveList = (list: GetDimensionsItem[]) => {
    const affectedList = list.reduce((acc, curr) => {
      acc.push(...getDescendants(tree, curr.id))
      return acc
    }, [] as string[])

    const pendingRemoveList = uniq([...list.map(i => i.id), ...(affectedList || [])])
    if (pendingRemoveList.some((id: string) => !isCreate(id))) {
      getNumberOfMaping({
        variables: { dimensionIds: pendingRemoveList.filter((i: string) => !isCreate(i)) },
      })
    }
    setPendingRemove({ deleteItems: list, affectedList, pendingRemoveList })
  }

  const onConfirmRemove = () => {
    const pendingRemoveList = [...(pendingRemove?.pendingRemoveList || [])]
    const newRemoveList = [...removeList, ...pendingRemoveList]
    setRemoveList(newRemoveList.filter(i => i && !isCreate(i)))

    // Add category that has been modified to refetch after save
    if (pendingRemoveList.some(id => !isCreate(id))) {
      selectModifiedCategories([{ category, dimension: map[category][dimensionState] }])
    }
    // Clear removed items from list
    setCreateList([...createList].filter(i => !pendingRemoveList.some(p => `${p}` === `${i.id}`)))
    setEditList([...editList].filter(i => !pendingRemoveList.some(p => `${p}` === `${i.id}`)))
    setPendingRemove(undefined)
    deselectMovingList(newRemoveList.map(id => tree[id]))
  }

  const onReset = () => {
    resetMovingList()
    // resetOpening()
    resetModifiedCategories()
    setCreateList([])
    setEditList([])
    setRemoveList([])
    // setActiveSector(undefined)
    resetInterrelationship()
    setMoveToState(undefined)
  }

  const [error, setError] = React.useState<{ message: string; title?: string }>()

  const handleSave = async (params: {
    createList?: DimensionInputItem[]
    editList?: DimensionInputItem[]
    interrelationshipList?: Interrelationship[]
    removeList?: string[]
    modifiedCategoryList?: CategoryDimension[]
  }) => {
    if (!checkTimeETL()) return
    const {
      createList = [],
      editList = [],
      interrelationshipList = [],
      removeList = [],
      modifiedCategoryList = [],
    } = params

    const input: ModifyDimensionsInput = {
      items: createList.map(({ id, parentId, ...rest }) => {
        const item: AddDimensionInputItem = {
          name: rest.name.trim(),
          canBeFinal: rest.canBeFinal,
          category: rest.category,
          dimension: rest.dimension,
          level: rest.level,
          createId: id,
          description: rest.description,
        }
        return parentId
          ? {
              ...item,
              parent: { id: '' + parentId, isCreate: isCreate(parentId) },
            }
          : item
      }),
      editItems: editList.map(({ parentId, ...rest }) => {
        const item = {
          id: rest.id,
          name: rest.name.trim(),
          canBeFinal: rest.canBeFinal,
          category: rest.category,
          dimension: rest.dimension,
          level: rest.level,
          description: rest.description,
        } as EditDimensionInputItem

        return parentId
          ? ({
              ...item,
              parent: { id: '' + parentId, isCreate: isCreate(parentId) },
            } as EditDimensionInputItem)
          : item
      }),
      interrelationships: interrelationshipList.map(i => {
        return {
          dimension1: { id: '' + i.dimension1Id, isCreate: isCreate(i.dimension1Id) },
          dimension2: { id: '' + i.dimension2Id, isCreate: isCreate(i.dimension2Id) },
          dimension1ChildIds: getChildrenCluster(data?.getDimensions?.items || [], i.dimension1Id),
          category: i.category,
          isRemove: i.isRemove,
        }
      }),
      removeIds: removeList.filter(i => +i).map(i => +i),
    }
    const mc: CategoryDimension[] = [...editList, ...createList, ...modifiedCategoryList].reduce(
      (acc, curr) => {
        if (!acc.some((i: any) => i.category === curr.category && i.dimension === curr.dimension)) {
          acc.push({ category: curr.category, dimension: curr.dimension })
        }
        return acc
      },
      [] as any
    )

    setModal({ type: Modals.saving })

    await modifyDimensions({
      variables: { input },
      awaitRefetchQueries: true,
      refetchQueries: [
        ...mc
          .filter(i => !isSector(i))
          .map(i => ({
            query: GET_DIMENSIONS,
            variables: {
              input: { category: i.category, dimension: i.dimension, level: 1 },
            },
          })),
        ...mc.map(i => ({
          query: GET_TAXONOMY,
          variables: { category: i.category },
        })),
      ],
    })

    // If Fintech Sector update => update the cache for both 2 tab sector & interrelationships
    if (mc.filter(isSector).length || interrelationshipList.length) {
      await getSectors(true)
    }
    localstorage.remove(LocalstorageFields.COMPANY_TAXONOMY)
  }

  const onSave = async () => {
    if (!checkTimeETL()) return
    try {
      await handleSave({
        createList,
        editList,
        interrelationshipList,
        removeList,
        modifiedCategoryList,
      })
      localstorage.remove(LocalstorageFields.COMPANY_TAXONOMY)
      onReset()
      // !error && setModal({ type: Modals.success })
    } catch (error) {
      onError(error)
      setModal(undefined)
      setError({ message: error.message })
    } finally {
      // setLoadingState(false)
    }
  }

  // GRAPHQl

  const [updateMapping, { loading: updateMappingLoading }] = useMutation<
    boolean,
    { input: UpdateMappingInput }
  >(UPDATE_MAPPING)
  const [mergeClusters, { loading: mergeLoading }] = useMutation<
    boolean,
    { input: MergeClustersInput }
  >(MERGE_CLUSTERS)

  const { data, loading: getDimensionsLoading } = useQuery<{
    getDimensions: { items: GetDimensionsItem[] }
  }>(GET_DIMENSIONS, {
    variables: {
      input:
        dimensionState !== SubMenuKeys.relationship
          ? {
              category: category,
              level: levelState,
              dimension: map[category][dimensionState],
            }
          : {
              category: EnumDimensionCategories.FIN,
              level: 1,
              dimension: map[EnumDimensionCategories.FIN].cluster,
            },
    },
  })

  const [editCategory] = useMutation<{ input: EditCategoryInput }>(EDIT_CATEGORY)

  const { data: getCategoryData, refetch: refetchGetCategory } = useQuery<{
    getCategory: Category
  }>(GET_CATEGORY, {
    variables: { id: CATEGORY_ID[category] },
  })

  const categoryDescription = getCategoryData?.getCategory

  const [
    getNumberOfMaping,
    { data: numberOfMapping, loading: loadingGetNumberOfMapping, error: errorGetNumberOfMapping },
  ] = useLazyQuery(GET_NUMBER_OF_MAPPING, {
    fetchPolicy: 'network-only',
    onCompleted() {
      const count = numberOfMapping?.getNumberOfCompanyMapping?.count
      if (count > 0 && !pendingRemove?.pendingRemoveList.length) {
        setError({
          message: `Cannot remove valid end point as there are companies mapped to this cluster. Number of mapped companies: ${count}`,
        })
        const revertList = editList.filter(item => item.id !== createEditItem.id)
        setEditList(revertList)
      }
    },
  })

  const client = useApolloClient()

  const [modifyDimensions, { loading: loadingModifyDimensions }] = useMutation<
    any,
    { input: ModifyDimensionsInput }
  >(MODIFY_DIMENSIONS, {
    onCompleted: () => {
      setModal({ type: Modals.success })
    },
    onError: error => {
      editList.forEach(i => {
        if (!isSector(i)) {
          client.query({
            query: GET_DIMENSIONS,
            variables: {
              input: { category: i.category, dimension: i.dimension, level: 1 },
            },
          })
        }
        client.query({
          query: GET_TAXONOMY,
          variables: { category: i.category },
        })
      })

      onError(error)
      setError({ message: error.message })
      setModal(undefined)
    },
  })

  const getSectors = async (refetch = false) => {
    await client
      .query<{ getDimensions?: { items: GetDimensionsItem[] } }, GetDimensionsInput>({
        query: GET_DIMENSIONS,
        variables: {
          input: {
            category: EnumDimensionCategories.FIN,
            dimension: map[EnumDimensionCategories.FIN].sector,
            level: 1,
          },
        },
        fetchPolicy: refetch ? 'network-only' : 'cache-first',
      })
      .then(({ data }) => {
        const items = data?.getDimensions?.items || []
        setExtra(items)
        if (activeSector?.id) {
          setActiveSector(items.find(i => i.id === activeSector?.id))
        }
      })
  }

  const onChangeDimension = async (i: DimensionMenuItem) => {
    setDimensionState(i.value)
    if (i.value === SubMenuKeys.relationship) {
      try {
        setLoadingState(true)
        // get sectors
        await getSectors()
      } catch (error) {
        onError(error)
      } finally {
        setLoadingState(false)
      }
    } else setExtra([])
  }

  const getCreateIndex = (id: string) => createList.findIndex(({ id: id2 }) => `${id2}` === `${id}`)
  const isCreate = (id: string) => getCreateIndex(id) !== -1
  const onCreateItem = (parent?: GetDimensionsItem) => {
    let init = { ...defaultCreateEditItem }
    if (parent) {
      init = {
        ...init,
        level: parent.level + 1,
        parentId: parent.id,
      }
    }
    setCreateEditItem(init)
    setModal({ type: Modals.add })
  }

  const onSubmitModal = () => {
    if (modal?.type === Modals.add) {
      // add to list
      const newItem = {
        ...createEditItem,
        id: createEditItem.id || uuidv4(), // fake id
        level: createEditItem.level || 1,
      }
      if (!newItem.name) return
      if (createEditItem.parentId) {
        selectOpening(createEditItem.parentId)
      }
      setCreateList([...createList, newItem])
    }

    if (modal?.type === Modals.edit && createEditItem.id) {
      const createIndex = getCreateIndex(createEditItem.id)
      if (createIndex !== -1) {
        const clone = [...createList]
        clone[createIndex] = { ...clone[createIndex], ...createEditItem }
        setCreateList(clone)
      } else {
        const parentId = tree[createEditItem.id].parentId
        const level = getLevel(createEditItem.id, tree)
        const value: DimensionInputItem = {
          id: createEditItem.id,
          name: createEditItem.name,
          canBeFinal: createEditItem.canBeFinal,
          description: createEditItem.description,
          category: tree[createEditItem.id].category,
          dimension: tree[createEditItem.id].dimension,
          level,
          parentId,
        }
        setEditList(mergeList(editList, [value]))
        const unFinalDimensionIds = value.id && !value.canBeFinal ? [value.id] : []

        if (unFinalDimensionIds.length) {
          getNumberOfMaping({
            variables: {
              dimensionIds: unFinalDimensionIds,
            },
          })
        }
      }
    }

    setModal(undefined)
  }

  const itemVisible = (category: EnumDimensionCategories, dimensionState: number | SubMenuKeys) => (
    item: DimensionInputItem
  ) =>
    item.category === category &&
    (item.dimension === dimensionState || item.dimension === map[category][dimensionState])

  const getMovingList = () => movingList.filter(itemVisible(category, dimensionState))

  const editInlineActions = [
    {
      icon: 'add',
      action: (e: MouseEvent, n: GetDimensionsItem) => {
        onCreateItem(n)
        e.stopPropagation()
      },
      visible: (n: GetDimensionsItem) =>
        n.level < MAX_LEVELS[category][dimensionState] && dimensionState !== 'relationship',
    },
  ]

  const showMergeCluster = (list: GetDimensionsItem[]): boolean => {
    return list?.length > 1 && uniq(list.map(item => item.parentId)).length === 1
  }

  const actions: Array<ButtonProps & { visible?: boolean }> = [
    {
      label: 'Create Sector',
      icon: 'plus',
      action: () => {
        onCreateItem()
      },
      visible: category === EnumDimensionCategories.FIN && dimensionState === 'sector',
    },
    {
      label: 'Create Item',
      icon: 'plus',
      action: () => {
        onCreateItem()
      },
      visible:
        category !== EnumDimensionCategories.FIN ||
        (dimensionState !== 'sector' && dimensionState !== 'relationship'),
    },
    {
      label: 'Merge Clusters',
      icon: 'merge',
      action: () => {
        const mergeList = getMovingList()

        if (invalidMergeList(mergeList)) {
          setError({
            title: 'Warning',
            message: `You have unsave change with cluster(s): <strong>${mergeList
              .filter(item => invalidMergeList([item]))
              .map(item => item.name)
              .join(', ')}</strong>. Please save it before merge.`,
          })
        } else if (mergeList.length > 1) {
          setDefaultCluster(mergeList[0])
          setModal({ type: Modals.merge })
        }
      },
      visible: showMergeCluster(getMovingList()) && dimensionState === 'cluster',
    },
    {
      label: 'Move selected items',
      icon: 'expandArrow',
      action: () => {
        const moveList = getMovingList()
        const duplicated = moveList.reduce((acc, curr, index) => {
          if (moveList.findIndex(i => i.name === curr.name) !== index) return [...acc, curr.name]
          return acc
        }, [] as string[])

        if (duplicated.length) {
          setError({
            message: `Cannot move 2 or more dimensions with the same name. (${Array.from(
              new Set(duplicated)
            ).join(', ')})`,
            title: 'Error',
          })
        } else {
          setModal({ type: Modals.move })
        }
      },
      visible: !!getMovingList().length && dimensionState === SubMenuKeys.cluster,
    },
    {
      label: 'Delete',
      icon: 'trash',
      type: 'error',
      action: () => {
        onRemoveList(getMovingList())
      },
      visible:
        !!getMovingList().length &&
        (category !== EnumDimensionCategories.FIN ||
          (dimensionState !== 'sector' && dimensionState !== 'relationship')),
      sx: { color: 'red' },
    },
  ]

  const handleMergeClusters = async (
    defaultCluster: GetDimensionsItem | null,
    list: GetDimensionsItem[]
  ) => {
    if (!checkTimeETL()) return
    if (!defaultCluster || invalidMergeList(list)) return
    try {
      const input = {
        defaultId: +defaultCluster.id,
        listId: list.map(i => +i.id),
      }

      const mc: CategoryDimension[] = list.reduce((acc, curr) => {
        if (!acc.some((i: any) => i.category === curr.category && i.dimension === curr.dimension)) {
          acc.push({ category: curr.category, dimension: curr.dimension })
        }
        return acc
      }, [] as any)

      setModal({ type: Modals.saving })

      await mergeClusters({
        variables: { input },
        awaitRefetchQueries: true,
        refetchQueries: [
          ...mc
            .filter(i => !isSector(i))
            .map(i => ({
              query: GET_DIMENSIONS,
              variables: {
                input: { category: i.category, dimension: i.dimension, level: 1 },
              },
            })),
          ...mc.map(i => ({
            query: GET_TAXONOMY,
            variables: { category: i.category },
          })),
        ],
      })

      if (mc.filter(i => i.category === EnumDimensionCategories.FIN).length) {
        await getSectors(true)
      }

      setModal({
        type: Modals.success,
        data: {
          message: 'Merge Clusters Successfully',
        },
      })
      resetMovingList()
    } catch (error) {
      setModal(undefined)
      onError(error)
      setError({ message: error?.message || '' })
    }
  }

  const invalidMergeList = (mergeList: GetDimensionsItem[]) => {
    return (
      mergeList.some(item => editList.some(i => i.id === item.id)) ||
      mergeList.some(item => isCreate(item.id))
    )
  }

  const mergeClusterActions: ButtonProps[] = [
    {
      label: 'Save',
      action: async () => {
        const mergeList = getMovingList()

        await handleMergeClusters(defaultCluster, mergeList)
      },
      disabled: !defaultCluster || mergeLoading,
    },
    {
      label: 'Cancel',
      action: () => {
        setModal(undefined)
      },
      type: 'secondary',
      disabled: mergeLoading,
    },
  ]

  const dimensionItems: DimensionMenuItem[] = [
    {
      value: SubMenuKeys.cluster,
      label: 'Cluster',
      categories: [
        EnumDimensionCategories.FIN,
        EnumDimensionCategories.INS,
        EnumDimensionCategories.REG,
      ],
    },
    { value: SubMenuKeys.sector, label: 'Sector', categories: [EnumDimensionCategories.FIN] },
    {
      value: SubMenuKeys.relationship,
      label: 'Sector Cluster Relationship',
      categories: [EnumDimensionCategories.FIN],
    },
    {
      value: SubMenuKeys['value chain'],
      label: 'Value Chain',
      categories: [EnumDimensionCategories.INS],
    },
    { value: SubMenuKeys.risk, label: 'Risk', categories: [EnumDimensionCategories.REG] },
  ]

  const convertToEditedVersion = React.useCallback(
    (item: GetDimensionsItem): GetDimensionsItem => {
      const editedVersion = editList.find(i => i.id === item.id)

      // get new children of item
      const newChildren = [...editList, ...createList]
        .filter(i => i.parentId && i.parentId === item.id && !item.children?.includes(i.id))
        .map(({ id }) => id)

      const movedChildren = (item.children || []).filter(child => {
        return editList.some(
          edit => edit.id === child && edit.parentId && edit.parentId !== item.id
        )
      })

      return {
        ...item,
        name: (editedVersion?.name || item.name)?.trim(),
        description: (editedVersion?.description || item.description || '')?.trim(),
        canBeFinal:
          editedVersion?.canBeFinal !== undefined && editedVersion?.canBeFinal !== null
            ? editedVersion?.canBeFinal
            : item.canBeFinal,
        children: [...(item.children || []), ...newChildren].filter(
          id => ![...removeList, ...movedChildren].some(v => v === id)
        ),
        parentId: editedVersion?.parentId || item.parentId,
      }
    },
    [editList, removeList, createList]
  )

  const needSelectSector = React.useMemo(() => {
    return (
      category === EnumDimensionCategories.FIN &&
      dimensionState === SubMenuKeys.relationship &&
      !activeSector
    )
  }, [activeSector, category, dimensionState])

  const tree: ITree<GetDimensionsItem> = React.useMemo(() => {
    const items = [
      ...(data?.getDimensions?.items || [])
        .filter((item: GetDimensionsItem) => !removeList.some(id => id === item.id))
        .map(convertToEditedVersion)
        .map((i: GetDimensionsItem) => ({
          ...i,
          isRoot: !i.parentId,
        })),
      ...createList
        .filter(
          i =>
            itemVisible(category, dimensionState)(i) ||
            (dimensionState === SubMenuKeys.relationship &&
              i.category === EnumDimensionCategories.FIN &&
              i.dimension !== map[EnumDimensionCategories.FIN][SubMenuKeys.sector])
        )
        .map(dimensionInputToNode)
        .map((item: GetDimensionsItem) => {
          const children = [...editList, ...createList]
            .filter(i => i.parentId === item.id)
            .map(i => i.id)
          return { ...item, children }
        }),
    ]

    const t = items.reduce((acc: ITree<GetDimensionsItem>, curr: GetDimensionsItem, index) => {
      acc[`${curr.id}`] = { ...curr, isOpen: isOpening(curr.id) }
      return acc
    }, {})

    // Recalculate level
    items.forEach(i => {
      const level = getLevel(i.id, t)
      t[i.id].level = level
    })

    return t
  }, [
    data,
    createList,
    category,
    dimensionState,
    removeList,
    isOpening,
    convertToEditedVersion,
    editList,
  ])

  const leftSideData: GetDimensionsItem[] = React.useMemo(() => {
    if (dimensionState !== SubMenuKeys.relationship) return []
    return [
      ...(extra || [])
        .filter(item => !removeList.some(id => id === item.id))
        .map(convertToEditedVersion),
      ...(createList || [])
        .filter(itemVisible(EnumDimensionCategories.FIN, SubMenuKeys.sector))
        .map(dimensionInputToNode),
    ]
  }, [extra, createList, removeList, convertToEditedVersion, dimensionState])

  const loading = getDimensionsLoading || loadingState

  const onNodeEdit = (e: MouseEvent, n: GetDimensionsItem) => {
    setCreateEditItem({
      id: n.id,
      name: n.name,
      canBeFinal: n.canBeFinal,
      category: n.category,
      dimension: n.dimension,
      level: n.level,
      parentId: n.parentId,
      description: n.description,
    })

    setModal({ type: Modals.edit })
    e.stopPropagation()
  }

  const isSelected = (n: GetDimensionsItem): boolean => {
    if (dimensionState !== SubMenuKeys.relationship) {
      return isInMovingList(n)
    } else if (activeSector) {
      const item = findInterrelationship({
        dimension2Id: activeSector.id,
        dimension1Id: n.id,
        category,
      })
      if (!item) {
        return activeSector.interrelationships.some(id => `${id}` === `${n.id}`)
      } else {
        return !item.isRemove
      }
    }
    return false
  }

  const onToggleNode = (n: GetDimensionsItem) => {
    if (dimensionState !== SubMenuKeys.relationship) {
      toggleSelect(n)
    } else if (activeSector) {
      const item = {
        dimension2Id: activeSector.id,
        dimension1Id: n.id,
        category,
        isRemove: activeSector.interrelationships.some(id => `${id}` === `${n.id}`),
      } as Interrelationship
      toggleInterrelationship(item)
    }
  }

  const getMovingAffectedDescendants = (
    moveTo: GetDimensionsItem
  ): {
    affectedDescendants: GetDimensionsItem[]
    parentId: string
    level: number
    cleanMovingList: DimensionInputItem[]
  } => {
    const parentId = moveTo.id
    const level = getLevel(moveTo.id, tree) + 1
    const cleanMovingList = getMovingList()
      .filter(i => ![i.parentId, i.id].includes(parentId))
      .map(nodeToDimensionInput)

    // Update the level of all decendants (exclude the nodes which is selected)
    const affectedDescendants = cleanMovingList
      .map(i => {
        const subTree = getSubTree(tree, i.id)
        return Object.values(subTree).map(i => ({
          ...i,
          level: i.level + level,
          parentId: i.parentId || undefined,
        }))
      })
      .reduce((acc, curr) => {
        return [...acc, ...curr]
      }, [])
      .filter(i => !cleanMovingList.some(c => i.id === c.id))

    return { affectedDescendants, parentId, level, cleanMovingList }
  }

  const doTheMoving = (moveTo: GetDimensionsItem) => {
    if (!moveTo) return
    const { affectedDescendants, parentId, level, cleanMovingList } = getMovingAffectedDescendants(
      moveTo
    )

    const createItems: DimensionInputItem[] = cleanMovingList
      .filter(i => isCreate(i.id))
      .map(i => {
        return { ...i, level, parentId }
      })

    const editItems: DimensionInputItem[] = cleanMovingList
      .filter(i => !isCreate(i.id))
      .map(i => {
        return { ...i, level, parentId }
      })

    const movedCreateItems = [...createItems, ...affectedDescendants.filter(i => isCreate(i.id))]
    const movedEditItems = [...editItems, ...affectedDescendants.filter(i => !isCreate(i.id))]

    if (movedEditItems.length) {
      setEditList(mergeList(editList, movedEditItems))
    }
    if (movedCreateItems.length) {
      setCreateList(mergeList(createList, movedCreateItems))
    }

    resetMovingList()
    setModal(undefined)
    setMoveToState(undefined)
    setCheckMovableState(undefined)
  }

  const getMovableCheckingInput = (moveToInput?: GetDimensionsItem) => {
    const moveTo = moveToInput || moveToState || ({} as GetDimensionsItem)

    const parentId = moveTo.id
    const level = getLevel(moveTo.id, tree) + 1
    const cleanMovingList = getMovingList()
      .filter(i => ![i.parentId, i.id].includes(parentId))
      .map(nodeToDimensionInput)

    // Update the level of all decendants (exclude the nodes which is selected)
    const affectedDescendants = cleanMovingList
      .map(i => {
        const subTree = getSubTree(tree, i.id)
        return Object.values(subTree).map(i => ({
          ...i,
          level: i.level + level,
          parentId: i.parentId || undefined,
        }))
      })
      .reduce((acc, curr) => {
        return [...acc, ...curr]
      }, [])
      .filter(i => !cleanMovingList.some(c => i.id === c.id))

    const movingClusters = [...cleanMovingList, ...affectedDescendants]
      .map(i => +i.id)
      .filter(id => id)

    return { movingClusters, targetCluster: +parentId }
  }

  const onConfirmMoving = async (moveTo: GetDimensionsItem) => {
    setMoveToState(moveTo)
    const { movingClusters, targetCluster } = getMovableCheckingInput(moveTo)

    try {
      const checkMovableResult = !movingClusters.length
        ? ({ invalid: false } as CheckClustersMovableResult)
        : await client
            .query<
              { checkClustersMovable: CheckClustersMovableResult },
              { input: CheckClustersMovableInput }
            >({
              query: CHECK_CLUSTERS_MOVABLE,
              fetchPolicy: 'no-cache',
              variables: {
                input: {
                  targetCluster,
                  movingClusters,
                },
              },
            })
            .then(res => res.data.checkClustersMovable)

      if (checkMovableResult.invalid) {
        setCheckMovableState(checkMovableResult)
        setModal(undefined)
      } else {
        doTheMoving(moveTo)
      }
    } catch (err) {
      onError(err)
      setError({ message: err.message || '' })
    }
  }

  const dimensionIsAlreadyExists = (
    parentId: string | undefined,
    match: { name: string; id?: string }
  ) => {
    let siblings = []
    if (!parentId) {
      siblings = Object.values(tree).filter(item => !item.parentId && item.id !== match.id)
    } else {
      siblings = Object.values(tree).filter(
        item => item.parentId === parentId && item.id !== match.id
      )
    }
    return siblings.map(item => item.id).some(id => tree[id].name === match.name)
  }

  const getTreeForMoving = (): ITree<MovingDimensionsItem> => {
    const moveList = getMovingList()

    //  Get deep of dimensions that children of it not being selected. Then pick the highest deep
    const deep = Math.max(
      ...moveList
        .filter(item => !moveList.some(i => item.children?.includes(i.id)))
        .map(i => getDeep(i, tree))
    )
    const decendants = moveList.reduce((acc, item) => {
      return [...acc, ...getDescendants(tree, item.id)]
    }, [] as string[])

    const validId = Object.values(tree)
      .filter(node => {
        return (
          !moveList.some(i => i.id === node.id) &&
          node.level + deep <= MAX_LEVELS[category][dimensionState] &&
          moveList.every(item => !dimensionIsAlreadyExists(node.id, { name: item.name })) &&
          !decendants.includes(node.id)
        )
      })
      .map(i => `${i.id}`)

    const t = Object.keys(tree).reduce((obj, key) => {
      obj[key] = { ...tree[key], isInvalid: !validId.includes(key) }
      return obj
    }, {} as ITree<MovingDimensionsItem>)

    return t
  }

  // Use on HandlerClusterMoving
  const getReadyToMoveClusterImmediately = (moveTo: GetDimensionsItem) => {
    const { affectedDescendants, parentId, level, cleanMovingList } = getMovingAffectedDescendants(
      moveTo
    )

    const editItems: DimensionInputItem[] = cleanMovingList
      .filter(i => !isCreate(i.id))
      .map(i => {
        const originItem = data?.getDimensions.items.find(o => o.id === i.id) || i
        return {
          id: originItem.id,
          name: originItem.name,
          canBeFinal: originItem.canBeFinal,
          category: originItem.category,
          dimension: originItem.dimension,
          description: originItem.description,
          level,
          parentId,
        }
      })

    const movedEditItems = [...editItems, ...affectedDescendants.filter(i => !isCreate(i.id))]

    return movedEditItems
  }

  const hasDataChange = !!(
    createList.length ||
    removeList.length ||
    editList.length ||
    interrelationshipList.length
  )

  const handleEditCategory = async (category: Category) => {
    if (!checkTimeETL()) return
    try {
      const input = {
        id: category.id,
        description: category.description,
      }
      await editCategory({ variables: { input } })
      await refetchGetCategory({ variables: { id: category.id } })
    } catch (error) {
      onError(error)
      setError(error.message || '')
    }
  }

  return (
    <>
      <Heading as="h2">{copy.title}</Heading>
      <Section sx={{ mt: 6 }}>
        <Flex sx={{ flexDirection: 'column' }}>
          <Heading as="h4">Categories</Heading>
          <TabButtonMenu
            sx={{ mt: 5, mx: 3 }}
            buttons={menuItems.map(b => ({
              label: copy.label[b.label],
              active: b.label === category,
              onPress: () => {
                setCategory(b.label)
              },
            }))}
          />
          <Box sx={{ fontSize: '14px', my: 5 }}>
            <EditCategoryForm
              categoryDescription={categoryDescription}
              handleEditCategory={handleEditCategory}
            />
          </Box>
        </Flex>

        <Flex sx={{ flexDirection: 'column', mx: 3 }}>
          <TabMenuCategories
            buttonSx={{
              pb: 3,
              px: 6,
              width: undefined,
            }}
            buttons={dimensionItems
              .filter(i => i.categories?.includes(category) && !i.hidden)
              .map(i => ({
                label: i.label,
                active: i.value === dimensionState,
                onClick: () => {
                  onChangeDimension(i)
                },
              }))}
          />
        </Flex>

        <Grid
          sx={{ p: 4, pr: 3, border: '1px solid ', borderRadius: '12px' }}
          columns={!!leftSideData?.length ? '0.7fr 0.05fr 1fr' : '1fr'}
          gap={0}
        >
          {loading ? (
            <Updating noPadding loading />
          ) : (
            <>
              {!!leftSideData?.length && (
                <>
                  <BoundCard title="Sector" buttons={[]}>
                    <Flex
                      sx={{ flexDirection: 'column', mt: 5, maxHeight: '500px', overflowY: 'auto' }}
                    >
                      {leftSideData.map((n: GetDimensionsItem, index) => {
                        return (
                          <EditInline
                            key={index}
                            sx={{
                              bg: activeSector?.id === n.id ? 'mint' : 'inherit',
                              '&:hover': {
                                bg: activeSector?.id === n.id ? 'mint' : Palette.bgGray,
                              },
                              minHeight: `50px`,
                            }}
                            onClick={() => {
                              setActiveSector(n)
                            }}
                            selected={activeSector?.id === n.id}
                            onSelect={() => {}}
                            onEdit={e => onNodeEdit(e, n)}
                            onCancel={() => {}}
                            onSave={newValue => {}}
                            onDelete={e => {
                              setRemoveList([...removeList, n.id])
                              e.stopPropagation()
                            }}
                            value={n.name}
                            suffix={<Text color="primary">{n.canBeFinal ? '✔' : ''}</Text>}
                            isBold
                            hideDefaultButtons={dimensionState === SubMenuKeys.relationship}
                          />
                        )
                      })}
                    </Flex>
                  </BoundCard>
                  <VerticalDivider />
                </>
              )}

              <BoundCard
                title={startCase(
                  dimensionState === SubMenuKeys.relationship ? 'Cluster' : dimensionState
                )}
                buttons={actions.filter(({ visible }) => visible)}
              >
                {needSelectSector ? (
                  <Flex
                    sx={{
                      width: '100%',
                      height: '100%',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Paragraph bold>Please select the Sector</Paragraph>
                  </Flex>
                ) : (
                  <Flex
                    sx={{ flexDirection: 'column', mt: 5, maxHeight: '500px', overflowY: 'auto' }}
                  >
                    <Tree
                      data={tree}
                      setOpenState={(node: Node) => {
                        toggleOpen(node.id)
                      }}
                      format={(n: GetDimensionsItem, onToggle: (n: GetDimensionsItem) => void) => {
                        const checkboxHidden =
                          category === EnumDimensionCategories.FIN &&
                          (dimensionState === SubMenuKeys.sector ||
                            (dimensionState === SubMenuKeys.relationship && n.level > 1))

                        if (!n) return null
                        return (
                          <Box onClick={() => onToggle(n)}>
                            <EditInline
                              sx={{
                                bg: 'transparent !important',
                                ml: checkboxHidden ? -3 : 'auto',
                              }}
                              onSelect={e => {}}
                              onSave={newValue => {}}
                              onCancel={() => {}}
                              checked={isSelected(n)}
                              onCheck={
                                checkboxHidden
                                  ? undefined
                                  : e => {
                                      onToggleNode(n)
                                      e.stopPropagation()
                                    }
                              }
                              onEdit={e => onNodeEdit(e, n)}
                              onDelete={e => {
                                onRemoveList([n])
                                e.stopPropagation()
                              }}
                              value={n?.name || ''}
                              suffix={<Text color="primary">{n.canBeFinal ? '✔' : ''}</Text>}
                              isBold={n?.isRoot}
                              hideDefaultButtons={dimensionState === SubMenuKeys.relationship}
                              buttons={
                                editInlineActions
                                  .filter(i => i.visible(n))
                                  .map(i => ({
                                    icon: i.icon,
                                    action: e => {
                                      i.action(e, n)
                                    },
                                  })) as IconButtons[]
                              }
                            />
                          </Box>
                        )
                      }}
                    />
                  </Flex>
                )}
              </BoundCard>
            </>
          )}
        </Grid>
      </Section>
      <FooterCTAs
        buttons={[
          {
            label: 'Reset',
            variant: 'outlineWhite',
            onClick: onReset,
            disabled: loadingModifyDimensions,
          },
          { label: 'Save', onClick: onSave, disabled: loadingModifyDimensions || !hasDataChange },
        ]}
      />
      {moveToState && checkMovableState && checkMovableState.invalid && (
        <Modal sx={{ p: 6, maxHeight: '80vh', minWidth: 500, position: 'relative' }}>
          <Button
            sx={{
              position: 'absolute',
              top: 20,
              right: 20,
            }}
            icon="remove"
            size="tiny"
            variant="black"
            onPress={() => {
              setCheckMovableState(undefined)
              setMoveToState(undefined)
            }}
          />

          <HandleClusterMoving
            moveToState={moveToState}
            checkMovableState={checkMovableState}
            onContinue={async (selectedSector: Dimension) => {
              if (!checkTimeETL()) return
              try {
                setModal({ type: Modals.saving })

                // Update to the DB
                const readyToMoveItems = getReadyToMoveClusterImmediately(moveToState)

                // Bug may appear: if "updateMapping" success but "handleSave" throw Err
                const { movingClusters } = getMovableCheckingInput()
                await updateMapping({
                  variables: {
                    input: {
                      companyIds: (checkMovableState.mappings || []).map(i => i.companyId),
                      updateSectors: (checkMovableState.movingSectorsInterrelated || []).map(
                        i => i.id
                      ),
                      sectorId: selectedSector.id,
                      movingClusters,
                    },
                  },
                })

                await handleSave({
                  editList: readyToMoveItems,
                })
                setEditList(
                  // Keep item that has been edit name or canBeFinal
                  editList
                    .filter(i => {
                      const originItem = data?.getDimensions.items.find(o => o.id === i.id)
                      return !(
                        originItem?.id === i.id &&
                        originItem?.name === i.name &&
                        originItem?.canBeFinal === i.canBeFinal &&
                        originItem?.category === i.category
                      )
                    })
                    .map(i => {
                      const movedItem = readyToMoveItems.find(r => r.id === i.id) || i
                      return {
                        ...i,
                        parentId: movedItem.parentId,
                        level: movedItem.level,
                      }
                    })
                )

                setCheckMovableState(undefined)
                setMoveToState(undefined)
                resetMovingList()
              } catch (err) {
                onError(err)
                setError({ message: err.message })
              } finally {
                setModal(undefined)
              }
            }}
            onGoBack={async () => {
              if (!checkTimeETL()) return
              const level1 = getAncestorAtLevel(tree, moveToState.id, 1)
              try {
                setModal({ type: Modals.saving })

                const createMoveTo = isCreate(moveToState.id)
                  ? createList.find(i => i.id === moveToState.id)
                  : undefined

                const newInterrelationships = (
                  checkMovableState.movingSectorsInterrelated || []
                ).map((i: Dimension) => ({
                  dimension1Id: `${level1.id}`,
                  dimension2Id: `${i.id}`,
                  category,
                }))

                await handleSave({
                  createList: createMoveTo ? [createMoveTo] : [],
                  interrelationshipList: newInterrelationships,
                })

                if (createMoveTo) {
                  setCreateList(createList.filter(i => i.id !== createMoveTo.id))
                  deselectInterrelationship(newInterrelationships)
                }
                setCheckMovableState(undefined)
                resetMovingList()
              } catch (err) {
                onError(err)
                setError({ message: err.message })
              } finally {
                setModal(undefined)
              }
            }}
          />
        </Modal>
      )}
      {modal && (
        <Modal
          sx={{
            p: [Modals.add, Modals.edit].includes(modal.type) ? 20 : 6,
            width: 500,
            maxHeight: '80vh',
            alignItems: 'flex-start',
            position: 'relative',
          }}
        >
          {[Modals.add, Modals.edit, Modals.move].includes(modal.type) && (
            <>
              <Button
                sx={{
                  position: 'absolute',
                  top: 20,
                  right: 20,
                }}
                icon="remove"
                size="tiny"
                variant="black"
                onPress={() => {
                  setModal(undefined)
                }}
              />

              {[Modals.add, Modals.edit].includes(modal.type) && (
                <>
                  <Box
                    sx={{
                      overflow: 'auto',
                      flex: 1,
                      width: '100%',
                    }}
                  >
                    <Heading sx={{ fontWeight: 600, mb: 4 }} as={'h4'}>
                      {(modal.type === Modals.edit ? `Edit ` : '') + startCase(dimensionState)}
                    </Heading>

                    <CreateEditDimensionForm
                      updateCreateEditItem={updateCreateEditItem}
                      dimensionIsAlreadyExists={dimensionIsAlreadyExists}
                      createEditItem={createEditItem}
                      dimensionState={dimensionState}
                      onSubmitModal={onSubmitModal}
                      modal={modal}
                    />
                  </Box>
                </>
              )}
              {modal.type === Modals.move && (
                <MoveTaxonomyModal
                  data={getTreeForMoving()}
                  list={getMovingList().map(n => ({ id: n.name, label: n.name }))}
                  onConfirm={onConfirmMoving}
                />
              )}
            </>
          )}
          {modal.type === Modals.success && (
            <Flex sx={{ width: '100%', alignItems: 'center', flexDirection: 'column' }}>
              <Heading sx={{ fontWeight: 600, mb: 4 }} as={'h4'}>
                Success
              </Heading>
              <Paragraph
                center
                sx={{ maxHeight: '60vh', overflow: 'auto', flex: 1, width: '100%' }}
              >
                {modal.data?.message || `Save Taxonomy Successfully`}
              </Paragraph>
              <Button sx={{ mt: 4 }} label="OK" onPress={() => setModal(undefined)} />
            </Flex>
          )}
          {modal.type === Modals.merge && (
            <MergeClusters
              list={getMovingList()}
              buttons={mergeClusterActions}
              defaultItem={defaultCluster}
              setDefaultItem={setDefaultCluster}
            />
          )}
          {modal.type === Modals.saving && (
            <Updating loading noPadding text={updateMappingLoading ? 'Update mapping' : 'Saving'} />
          )}
        </Modal>
      )}
      {!!pendingRemove && (
        <Modal sx={{ p: 6, maxHeight: '80vh', minWidth: 500 }}>
          {loadingGetNumberOfMapping ? (
            <Updating loading sx={{ py: 4 }} />
          ) : errorGetNumberOfMapping ? (
            <ErrorModal
              message={`An error has been ocurred. Please try again later.`}
              onOK={() => setPendingRemove(undefined)}
            />
          ) : (
            <Box
              sx={{
                textAlign: 'center',
                width: '100%',
              }}
            >
              <Flex sx={{ width: '100%', justifyContent: 'center' }}>
                <Icon icon="alert" size="small" background="red" color="white" />
                <Heading center as="h4" sx={{ ml: 2, mb: 3 }}>
                  Warning
                </Heading>
              </Flex>
              {!!numberOfMapping?.getNumberOfCompanyMapping &&
              numberOfMapping?.getNumberOfCompanyMapping?.count > 0 ? (
                <Box sx={{ textAlign: 'center', mt: 3 }}>
                  <Text sx={{ fontSize: 14, lineHeight: 1.5 }}>
                    {`Cannot delete ${dimensionState}(s) as this will effect existing mappings.`}
                    <br />
                    {`Please update the mapping of these companies and try again.`}
                    <br />
                    {`Number of mapped companies: ${numberOfMapping?.getNumberOfCompanyMapping?.count}`}
                  </Text>

                  <Box mt={4}>
                    <Button
                      sx={{ m: '0 auto' }}
                      label="OK"
                      onPress={() => setPendingRemove(undefined)}
                    />
                  </Box>
                </Box>
              ) : (
                <>
                  <Text sx={{ textAlign: 'center', fontSize: 14, lineHeight: 1.5 }}>
                    {`Are you sure to delete the following ${dimensionState}(s): `}
                    <Text color="primary" sx={{ display: 'inline', fontWeight: 600 }}>
                      {pendingRemove.deleteItems?.map(i => i.name).join(', ')}
                    </Text>
                    ?
                  </Text>
                  {!!pendingRemove.affectedList.length && (
                    <>
                      <Text sx={{ textAlign: 'center', fontSize: 14, lineHeight: 1.5 }}>
                        {`This also means all items within ${
                          pendingRemove.deleteItems.length > 1 ? 'these' : 'this'
                        }${' '}${dimensionState}(s) and all mappings with it will be deleted.`}
                        <br />
                        {`Please check the list of items below again before making decision.`}
                        <br />
                      </Text>
                      <List
                        label={`Items: ${pendingRemove.affectedList.length}`}
                        list={pendingRemove.affectedList.map(id => ({
                          id: id,
                          label: tree[id]?.name || '',
                        }))}
                      />
                    </>
                  )}

                  <Box sx={{ mt: 5, width: '100%' }}>
                    <SwipeButton endSwipe={onConfirmRemove} />
                  </Box>
                  <Button
                    label={'Cancel'}
                    sx={{ color: 'black', m: '0 auto', mt: 3 }}
                    onPress={() => setPendingRemove(undefined)}
                    variant="invert"
                    disabled={false}
                  />
                </>
              )}
            </Box>
          )}
        </Modal>
      )}
      {createEditItem.id && loadingGetNumberOfMapping && (
        <Modal sx={{ p: 6, maxHeight: '80vh', minWidth: 500 }}>
          <Updating loading sx={{ py: 4 }} />
        </Modal>
      )}
      {error && (
        <ErrorModal message={error.message} title={error.title} onOK={() => setError(undefined)} />
      )}
      <NavigationConfirm when={hasDataChange} callback={onSave} />
    </>
  )
}

export default TaxonomyManagement

type Props1 = any

const CreateEditDimensionForm = ({
  updateCreateEditItem,
  dimensionIsAlreadyExists,
  createEditItem,
  dimensionState,
  onSubmitModal,
  modal,
}: Props1) => {
  const { taxonomyManagement: copy } = strings

  const fields: Array<TextFieldProps & { errorMessage: string }> = [
    {
      label: 'Name',
      type: 'input',
      value: createEditItem.name,
      onChange: (e: ChangeFieldEvent) => updateCreateEditItem({ name: e.target.value }),
      name: 'name',
      required: true,
      errorMessage: copy.error.dimensionAlreadyExists,
      maxLength: 70,
      fieldState: dimensionIsAlreadyExists(createEditItem.parentId, createEditItem)
        ? 'error'
        : 'default',
    },
    {
      label: 'Description',
      type: 'textarea',
      value: createEditItem.description,
      onChange: (e: ChangeFieldEvent) => updateCreateEditItem({ description: e.target.value }),
      name: 'description',
      maxLength: 4000,
      required: true,
      errorMessage: '',
      fieldState: 'default',
    },
  ]

  const invalidForm =
    dimensionIsAlreadyExists(createEditItem.parentId, createEditItem) ||
    fields.some(f => !f.value && f.required)

  return (
    <>
      {fields.map(f => (
        <React.Fragment key={f.name}>
          <Flex
            sx={{
              position: 'relative',
              flexDirection: 'column',
              alignItems: 'flex-end',
            }}
          >
            <TextField
              sx={{ mb: 4, flex: 1, width: '100%' }}
              placeholder={`Enter ${dimensionState.toLowerCase()} ${f.name}`}
              {...f}
            />
            {f.fieldState === 'error' && (
              <Text sx={{ position: 'absolute', bottom: 0, right: 0 }} variant="error">
                {f.errorMessage}
              </Text>
            )}
          </Flex>
        </React.Fragment>
      ))}

      <Flex sx={{ justifyContent: 'flex-end' }}>
        <Checkbox
          sx={{ flex: 1 }}
          label={`This ${dimensionState} is a valid end point`}
          size={'tiny'}
          square
          checked={createEditItem.canBeFinal}
          onPress={() => updateCreateEditItem({ canBeFinal: !createEditItem.canBeFinal })}
        />

        <Button
          label={modal.type === Modals.edit ? 'Save' : 'Create'}
          onPress={onSubmitModal}
          disabled={invalidForm}
        />
      </Flex>
    </>
  )
}
