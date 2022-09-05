import React from 'react'
import { Box, Flex, Grid } from 'theme-ui'
import { Button, List } from '..'
import { GetDimensionsItem } from '../../pages/TaxonomyManagement'
import { ButtonProps } from '../../types'
import { ListType } from '../List'
import { Heading } from '../primitives'

type Props = {
  list: GetDimensionsItem[]
  buttons: ButtonProps[]
  defaultItem: GetDimensionsItem | null
  setDefaultItem(item: GetDimensionsItem): void
}

const convert2ListType = (item: GetDimensionsItem): ListType => {
  return {
    id: item.id,
    label: item.name,
  }
}
export default function MergeClusters({ defaultItem, setDefaultItem, ...props }: Props) {
  return (
    <>
      <Box sx={{ overflow: 'auto', flex: 1, width: '100%', px: 4 }}>
        <Flex sx={{ width: '100%', justifyContent: 'center' }}>
          <Heading center as="h4" sx={{ fontWeight: 600, mb: 3 }}>
            Merge Clusters
          </Heading>
        </Flex>
        <List
          sx={{ mb: 4 }}
          label={`Clusters (${props.list.length})`}
          selection={{
            selectedList: defaultItem ? [convert2ListType(defaultItem)] : [],
            onClick: item => {
              const def = props.list.find(i => i.id === item.id)
              def && setDefaultItem(def)
            },
          }}
          list={props.list.map(convert2ListType)}
        />
        <Grid gap={3}>
          {props.buttons.map((b, index) => (
            <Button
              key={index}
              label={b.label}
              variant={b.type}
              onPress={b.action}
              disabled={b.disabled}
            />
          ))}
        </Grid>
      </Box>
    </>
  )
}
