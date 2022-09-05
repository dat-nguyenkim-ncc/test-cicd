import React from 'react'
import TreeNode, { TreeNodeProps } from '../TreeNode/TreeNode'

export type Node = {
  id: string
  name: string
  isRoot?: boolean
  children?: string[]
  content?: string
  isOpen?: boolean
  isChecked?: boolean
  disabled?: boolean
}

export type ITree<T extends Node = Node> = Record<string, T>

export type TreeProps = {
  data: ITree
  onSelect?(node: Node): void
  setOpenState?(node: Node): void
  getKey?: (node: Node) => string
} & Pick<TreeNodeProps, 'format' | 'nodeWrapperSx' | 'nodeSx'>

const Tree = ({
  data,
  onSelect,
  format,
  setOpenState,
  getKey = (node: Node) => node.id,
  nodeWrapperSx,
  ...props
}: TreeProps) => {
  const [nodes, setNodes] = React.useState(data)

  React.useEffect(() => {
    setNodes(data)
  }, [data])

  const getChildNodes = (node: Node) => {
    if (!node?.children) return []
    return (node?.children?.map(path => nodes[path]) || []).filter(i => !!i)
  }

  const onToggle = (node: Node) => {
    if (!node.children?.length) return
    setNodes({ ...nodes, [getKey(node)]: { ...node, isOpen: !node.isOpen } })
    setOpenState && setOpenState(node)
  }

  const rootNodes = React.useMemo(() => {
    return Object.values(nodes).filter(node => !!node.isRoot)
  }, [nodes])

  return (
    <div>
      {rootNodes.map((node, index) => (
        <TreeNode
          key={index}
          node={node}
          getChildNodes={getChildNodes}
          onToggle={onToggle}
          onNodeSelect={onSelect}
          deep={0}
          format={format}
          nodeWrapperSx={nodeWrapperSx}
          nodeSx={props.nodeSx}
        />
      ))}
    </div>
  )
}

export default Tree
