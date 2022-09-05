import React from 'react'
import { Box, Flex, Text } from 'theme-ui'
import { List, TextField, Updating } from '..'
import { MovingDimensionsItem } from '../../pages/TaxonomyManagement'
import { reasonPopverZIndex } from '../../utils/consts'
import Button from '../Button'
import { ListType } from '../List'
import Popover from '../Popover'
import { Heading } from '../primitives'
import Tree, { ITree, Node } from '../Tree'

const MoveTaxonomyModal = (props: {
  list: ListType[]
  data: ITree<MovingDimensionsItem>
  onConfirm(moveTo: Node, list: ListType[]): Promise<void>
  closeAfterConfirm?: boolean
}) => {
  const [moveTo, setMoveTo] = React.useState<Node>()
  const [open, setOpen] = React.useState(false)
  const [loadingState, setLoadingState] = React.useState(false)

  return (
    <>
      <Box sx={{ overflow: 'auto', flex: 1, width: '100%', px: 3 }}>
        <Flex sx={{ width: '100%', justifyContent: 'center' }}>
          <Heading center as="h4" sx={{ mb: 3 }}>
            Taxonomy moving
          </Heading>
        </Flex>
        <List label={`Items ${props.list.length}`} list={props.list} />
        <Box>
          <Popover
            noArrow
            positions={['top']}
            zIndex={reasonPopverZIndex}
            disableClickOutside={true}
            content={
              <Box
                sx={{
                  bg: 'white',
                  py: '16px',
                  px: 3,
                  borderRadius: '10px',
                  border: '1px solid #D7D7D7',
                  minWidth: '360px',
                }}
              >
                <Box sx={{ maxHeight: '400px', overflow: 'auto', pr: '6px' }}>
                  <Tree
                    data={props.data}
                    nodeWrapperSx={{
                      background: 'transparent !important',
                      p: 0,
                      ml: 2,
                      maxHeight: 'auto',
                    }}
                    nodeSx={{ background: 'transparent !important' }}
                    format={(
                      n: MovingDimensionsItem,
                      onToggle: (n: MovingDimensionsItem) => void
                    ) => {
                      if (!n) return null
                      return (
                        <Box
                          sx={
                            n.isInvalid
                              ? { opacity: 0.5 }
                              : { '&:hover': { color: 'primary', bg: 'white', cursor: 'pointer' } }
                          }
                          onClick={e => {
                            e.stopPropagation()
                            if (n.isInvalid) return

                            setMoveTo(n)
                            setOpen(false)
                          }}
                        >
                          <Text sx={{ py: 2, fontSize: 14, lineHeight: 1.5 }}>{n.name}</Text>
                        </Box>
                      )
                    }}
                  />
                </Box>
              </Box>
            }
            open={open}
            setOpen={setOpen}
          >
            <Flex
              sx={{ mt: 3 }}
              onClick={e => {
                if (open) {
                  setOpen(false)
                  e.stopPropagation()
                }
              }}
            >
              <TextField
                label={'Move to'}
                disabled
                sx={{ opacity: '1 !important' }}
                value={moveTo?.name || ''}
                name="Move to"
                onChange={() => {}}
                placeholder="Pleas select the destination"
              />
            </Flex>
          </Popover>
          {loadingState ? (
            <Updating
              sx={{ mt: 3, borderRadius: 10, paddingX: 4, paddingY: 3 }}
              loading
              noPadding
              text="Processing"
            />
          ) : (
            <Button
              label="Confirm"
              sx={{ mt: 3, width: '100%' }}
              variant="primary"
              onPress={async () => {
                if (!moveTo) return
                try {
                  setLoadingState(true)
                  await props.onConfirm(moveTo, props.list)
                } catch (err) {
                  throw err
                } finally {
                  setLoadingState(false)
                }
              }}
            />
          )}
        </Box>
      </Box>
    </>
  )
}

export default MoveTaxonomyModal
