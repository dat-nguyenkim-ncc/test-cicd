import React from 'react'
import { Box } from '@theme-ui/components'
import { SxStyleProp } from 'theme-ui'
import { Checkbox, Icon } from '..'
import { Palette } from '../../theme'
import { ViewInterface } from '../../types'
import { Paragraph } from '../primitives'
import { Node } from '../Tree'

export type TreeNodeProps = {
  node: Node
  getChildNodes: (node: Node) => Node[]
  deep: number
  onToggle(node: Node): void
  onNodeSelect?(node: Node): void
  format?(node: Node, onToggle: (node: Node) => void): React.ReactElement | null

  nodeWrapperSx?: SxStyleProp
  nodeSx?: SxStyleProp
}

const StyledTreeNode = (
  props: ViewInterface<{ node: Node; onClick(e?: React.MouseEvent): void }>
) => {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        pl: 2,
        justifyContent: 'space-between',

        '&:hover': {
          background: props.node.isRoot ? Palette.bgGray : Palette.white,
        },

        position: 'relative',
        '&:before': !props.node.isRoot
          ? {
              content: '""',
              position: 'absolute',
              left: -2,
              top: '50%',
              borderTop: '1px solid #D7D7D7',
              width: '8px',
            }
          : {},
        ...props.sx,
      }}
      onClick={props.onClick}
    >
      {props.children}
    </Box>
  )
}

const TreeNodeWrapper = (props: ViewInterface<{ parent: Node }>) => {
  return (
    <>
      <Box
        sx={{
          bg: '#F8F8F8',
          p: 2,
          pb: props.parent.isRoot ? 2 : 0,
          borderRadius: '5px',
          overflow: 'auto',
          ...props.sx,
        }}
      >
        <Box
          sx={{
            borderLeft: '1px solid #D7D7D7',
            pl: 2,
          }}
        >
          {props.children}
        </Box>
      </Box>
    </>
  )
}

const getNodeLabel = (node: Node) => node.name

const TreeNode = (props: TreeNodeProps) => {
  const { node, getChildNodes, deep, onToggle, onNodeSelect, format } = props
  const children = getChildNodes(node)
  return !node ? null : (
    <React.Fragment>
      <StyledTreeNode
        sx={{ ...(node.disabled ? { opacity: 0.5, pointerEvents: 'none' } : {}), ...props.nodeSx }}
        node={node}
        onClick={() => {
          onToggle(node)
        }}
      >
        {onNodeSelect && (
          <Checkbox
            checked={node.isChecked}
            square
            size="small"
            onPress={e => {
              onNodeSelect(node)
              e.stopPropagation()
            }}
          />
        )}
        <Box sx={{ flex: 1 }}>
          {format ? (
            format(node, onToggle)
          ) : (
            <Paragraph bold={node.isRoot}>{getNodeLabel(node)}</Paragraph>
          )}
        </Box>

        {!!children?.length &&
          (node.isOpen ? <Icon icon="indicatorUp" /> : <Icon icon="indicatorDown" />)}
      </StyledTreeNode>

      {node.isOpen && !!children?.length && (
        <TreeNodeWrapper parent={node} sx={props.nodeWrapperSx}>
          {children?.map((childNode: Node, index: number) => (
            <TreeNode key={index} {...props} node={childNode} deep={deep + 1} />
          ))}
        </TreeNodeWrapper>
      )}
    </React.Fragment>
  )
}

export default TreeNode
