import React from 'react'
import { Flex, Box, Text } from 'theme-ui'
import { Icon, Button, List } from '..'
import { Dimension, GetDimensionsItem } from '../../pages/TaxonomyManagement'
import { CheckClustersMovableResult } from '../../pages/TaxonomyManagement/graphql'
import { ListType } from '../List'
import { Heading } from '../primitives'

type Props = {
  moveToState: GetDimensionsItem
  checkMovableState: CheckClustersMovableResult
  onGoBack(): void
  onContinue(selectedSector: Dimension): void
}

export default function HandleClusterMoving(props: Props) {
  const { moveToState, checkMovableState, onGoBack, onContinue } = props

  const [sector, setSector] = React.useState<Dimension | undefined>(
    checkMovableState.targetSectorsInterrelated?.length
      ? checkMovableState.targetSectorsInterrelated[0]
      : undefined
  )

  const { targetSectorsInterrelated, movingSectorsInterrelated } = checkMovableState
  const showContinue = !!targetSectorsInterrelated?.length
  return (
    <>
      <Flex sx={{ width: '100%', justifyContent: 'center' }}>
        <Icon icon="alert" size="small" background="red" color="white" />
        <Heading center as="h4" sx={{ ml: 2, mb: 3 }}>
          Warning
        </Heading>
      </Flex>
      {showContinue && (
        <Box sx={{ mt: 3 }}>
          <Text sx={{ fontSize: 14, lineHeight: 1.5 }}>
            {`Moving clusters to `}
            <Text as="span" sx={{ color: 'primary', fontWeight: 'bold' }}>
              {moveToState?.name}
            </Text>
            {` will result in the sector of mapped companies `}
            <Text as="span" sx={{ fontWeight: 'bold' }}>{`being updated`}</Text>
            {` to sector:`}
          </Text>
          <Box sx={{ my: 3, minWidth: '100%' }}>
            <List
              list={(targetSectorsInterrelated || []).map(i => ({
                id: `${i.id}`,
                label: i.name,
              }))}
              selection={{
                selectedList: sector ? [sector].map(i => ({ id: `${i.id}`, label: i.name })) : [],
                onClick: (item: ListType) => {
                  setSector(targetSectorsInterrelated?.find(i => i.id === +item.id!))
                },
              }}
            />
          </Box>
        </Box>
      )}

      <Box sx={{ mt: 3 }}>
        <Text sx={{ fontSize: 14, lineHeight: 1.5 }}>
          {showContinue
            ? `If you would like to keep the sector of these companies as the same as before, please `
            : `Please `}
          <Text as="span" sx={{ fontWeight: 'bold' }}>{`create a relationship`}</Text>
          {` between `}
          <Text as="span" sx={{ color: 'primary', fontWeight: 'bold' }}>
            {moveToState?.name}
          </Text>
          {` and sector(s) `}
          <Text as="span" sx={{ color: 'primary', fontWeight: 'bold' }}>
            {movingSectorsInterrelated?.map(i => i.name).join(', ')}
          </Text>
          {` before continuing.`}
        </Text>
      </Box>
      <Flex mt={4} sx={{ gap: 3 }}>
        <Button
          variant={showContinue ? 'outline' : 'primary'}
          label="Create relationship and go back"
          onPress={() => {
            onGoBack()
          }}
        />
        {showContinue && (
          <Button
            label="Continue"
            disabled={!sector}
            onPress={() => {
              if (!sector) return
              onContinue(sector)
            }}
          />
        )}
      </Flex>
    </>
  )
}
