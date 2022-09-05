import { useQuery } from '@apollo/client'
import React from 'react'
import { Flex, Box } from 'theme-ui'
import { Tooltip, Icon, Button } from '..'
import { Category, GET_CATEGORY, CATEGORY_ID } from '../../pages/TaxonomyManagement/graphql'
import { Palette } from '../../theme'
import { ButtonTagType, CompanyTypeSector } from '../../types'
import { TOOLTIP_SX } from '../../utils/consts'

type Props = {
  selectedMap: CompanyTypeSector | undefined
  buttonsMap: ButtonTagType[]
  onMapButtonsPress(v: CompanyTypeSector): void
}

export default function (props: Props) {
  const { selectedMap, buttonsMap, onMapButtonsPress } = props

  const { data: getCategoryData, loading } = useQuery<{
    getCategory: Category
  }>(GET_CATEGORY, {
    skip: !selectedMap,
    variables: { id: CATEGORY_ID[selectedMap!] },
  })
  const categoryDescription = getCategoryData?.getCategory.description

  return (
    <Flex sx={{ flex: 1 }}>
      {buttonsMap.map((b, index) => (
        <Button
          key={index}
          sx={{
            ml: index > 0 ? 5 : 0,
            minWidth: selectedMap === b.value ? 180 : 'auto',
            color: selectedMap === b.value ? Palette.white : Palette.black80,
          }}
          disabled={b.disabled}
          onPress={() => onMapButtonsPress(b.value)}
          variant={selectedMap === b.value ? 'primary' : 'muted'}
          label={b.label}
          icon={
            selectedMap === b.value && !loading ? (
              <Box ml={3}>
                <Tooltip sx={TOOLTIP_SX} id={b.value} content={categoryDescription || ''} isShow>
                  <Icon icon="info" color="white" />
                </Tooltip>
              </Box>
            ) : undefined
          }
        />
      ))}
    </Flex>
  )
}
