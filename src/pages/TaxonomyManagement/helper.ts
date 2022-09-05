import { DimensionBase, GetDimensionsItem, DimensionInputItem } from '.'
import { ITree } from '../../components/Tree'
import { EnumDimensionCategories, EnumDimensionValue } from '../../types/enums'
import { v4 as uuidv4 } from 'uuid'

export enum SubMenuKeys {
  'sector' = 'sector',
  'cluster' = 'cluster',
  'value chain' = 'value chain',
  'risk' = 'risk',
  'relationship' = 'relationship',
}

export const map: Record<EnumDimensionCategories, Record<string, number>> = {
  [EnumDimensionCategories.FIN]: {
    [SubMenuKeys.sector]: EnumDimensionValue.SECONDARY,
    [SubMenuKeys.cluster]: EnumDimensionValue.PRIMARY,
  },
  [EnumDimensionCategories.INS]: {
    [SubMenuKeys.cluster]: EnumDimensionValue.PRIMARY,
    [SubMenuKeys['value chain']]: EnumDimensionValue.SECONDARY,
  },
  [EnumDimensionCategories.REG]: {
    [SubMenuKeys.risk]: EnumDimensionValue.SECONDARY,
    [SubMenuKeys.cluster]: EnumDimensionValue.PRIMARY,
  },
}
export const menuItems = [
  { label: EnumDimensionCategories.FIN },
  { label: EnumDimensionCategories.INS },
  { label: EnumDimensionCategories.REG },
]

export function mergeList<T extends DimensionBase>(list: T[], items: T[]): T[] {
  const clone = [...list]
  const appendItems: T[] = []
  items.forEach(i => {
    const dex = clone.findIndex(({ id }) => id === i.id)
    if (dex === -1) {
      appendItems.push(i)
    } else {
      clone[dex] = { ...clone[dex], ...i }
    }
  })
  return [...clone, ...appendItems]
}

export type Interrelationship = {
  dimension1Id: string
  dimension2Id: string
  category: EnumDimensionCategories
  isRemove?: boolean
}
// type IRelationship = Record<string, string>

export type DimensionMenuItem = {
  value: SubMenuKeys
  label: string
  categories: EnumDimensionCategories[]
  hidden?: boolean
}

export type CategoryDimension = {
  category: EnumDimensionCategories
  dimension: number
}

export const getDescendants = (tree: ITree<GetDimensionsItem>, id: string) => {
  const arr = []
  const item = tree[id]
  arr.push(...(item?.children || []))
  if (item?.children?.length) {
    item?.children?.map(i => arr.push(...getDescendants(tree, i)))
  }
  return arr
}

// Return SubTree (exclude the Root)
export function getSubTree<T extends GetDimensionsItem>(tree: ITree<T>, root: string): ITree<T> {
  const descendants = getDescendants(tree, root)
  const nodes = descendants.map(id => {
    return { ...tree[id], level: tree[id].level - tree[root].level }
  })
  return nodes.reduce((acc, curr) => {
    acc[curr.id] = curr
    return acc
  }, {} as ITree<T>)
}

export const nodeToDimensionInput = (item: GetDimensionsItem): DimensionInputItem => ({
  id: item.id,
  name: item.name.trim(),
  canBeFinal: item.canBeFinal,
  category: item.category,
  dimension: item.dimension,
  level: item.level,
  parentId: item.parentId,
  description: item.description,
})

export const dimensionInputToNode = (item: DimensionInputItem): GetDimensionsItem => ({
  id: item.id || uuidv4(),
  name: item.name?.trim(),
  canBeFinal: item.canBeFinal,
  isOpen: false,
  children: [],
  isRoot: !item.parentId,
  interrelationships: [],
  level: item.level,
  parentId: item.parentId,
  category: item.category,
  dimension: item.dimension,
  description: item.description,
})

export const getLevel = (id: string, paramTree: ITree<GetDimensionsItem>): number => {
  let level = 1
  let node = paramTree[id]
  while (node?.parentId) {
    level++
    node = paramTree[node.parentId]
  }
  return level
}

export function getDeep<T extends GetDimensionsItem>(node: T, tree: ITree<T>) {
  const highestLevel = [...getDescendants(tree, node.id), node.id]
    .map(id => tree[id])
    .reduce(
      (acc, curr) => {
        return curr.level > acc.level ? curr : acc
      },
      { level: 1 } as T
    ).level
  return highestLevel - node.level + 1
}

export function getHighestDeep<T extends GetDimensionsItem>(list: T[], tree: ITree<T>) {
  // return the decendant that have the highest level
  return list
    .map(i => getDeep(i, tree))
    .reduce((acc, curr) => {
      return curr > acc ? curr : acc
    }, 1)
}

export function getAncestorAtLevel<T extends GetDimensionsItem>(
  tree: Record<string, T>,
  id: string,
  level = 1
): T {
  let dimension = tree[id]

  while (dimension.level > level && dimension.parentId) {
    dimension = tree[dimension.parentId]
  }

  return dimension
}

export const isSector = (i: CategoryDimension) =>
  i.category === EnumDimensionCategories.FIN &&
  i.dimension === map[EnumDimensionCategories.FIN][SubMenuKeys.sector]
