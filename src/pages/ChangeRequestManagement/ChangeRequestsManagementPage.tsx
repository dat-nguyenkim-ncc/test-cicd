import { Box, Flex } from '@theme-ui/components'
import React from 'react'
import ChangeRequestManagement from '.'
import { Button } from '../../components'
import { Heading } from '../../components/primitives'
import { ViewInterface } from '../../types'
import ChangeRequestManagementProvider from './provider/ChangeRequestManagementProvider'
import SuggestedMappingsManagement from './SuggestedMappingsManagement'
import TaxonomyChangeRequestsManagement from './TaxonomyChangeRequestsManagement'

enum EPageShow {
  TAXONOMY,
  OTHER,
  SUGGESTED_MAPPING,
}

const ChangeRequestManagementPage = () => {
  const [pageShow, setPageShow] = React.useState<EPageShow>(EPageShow.OTHER)

  const tabButtons = [
    {
      label: 'Change Request',
      active: pageShow === EPageShow.OTHER,
      onPress: () => {
        setPageShow(EPageShow.OTHER)
      },
    },
    {
      label: 'Taxonomy',
      active: pageShow === EPageShow.TAXONOMY,
      onPress: () => {
        setPageShow(EPageShow.TAXONOMY)
      },
    },
    {
      label: 'Suggested Mappings',
      active: pageShow === EPageShow.SUGGESTED_MAPPING,
      onPress: () => {
        setPageShow(EPageShow.SUGGESTED_MAPPING)
      },
    },
  ]

  return (
    <ChangeRequestManagementProvider>
      <Box
        sx={{
          maxWidth: '95vw',
          width: '95vw',
          mx: `calc((-95vw + 1024px)/2)`,
          '@media screen and (min-width: 2560px)': {
            maxWidth: '60vw',
            width: '60vw',
            mx: `calc((-60vw + 1024px)/2)`,
          },
          '@media screen and (min-width: 1920px) and (max-width: 2559px)': {
            maxWidth: '90vw',
            width: '90vw',
            mx: `calc((-90vw + 1024px)/2)`,
          },
        }}
      >
        <Flex sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
          <Heading as="h2">Change Request Management</Heading>
        </Flex>
        <TabMenu sx={{ my: 5 }} buttons={tabButtons} />
        {pageShow === EPageShow.TAXONOMY && <TaxonomyChangeRequestsManagement />}
        {pageShow === EPageShow.OTHER && <ChangeRequestManagement />}
        {pageShow === EPageShow.SUGGESTED_MAPPING && <SuggestedMappingsManagement />}
      </Box>
    </ChangeRequestManagementProvider>
  )
}

export default ChangeRequestManagementPage

export type TabMenuProps = ViewInterface<{
  buttons: { active?: boolean; label: string; onPress(): void; disabled?: boolean }[]
}>
const TabMenu = ({ buttons, sx }: TabMenuProps) => {
  return (
    <Flex sx={sx}>
      {buttons.map((b, index) => (
        <Box
          key={index}
          sx={{
            bg: 'white',
            width: `calc(${100 / buttons.length}% + 10px)`,
            ml: index > 0 ? '-10px' : 0,
            zIndex: b.active ? 10 : 0,
          }}
        >
          <Button
            sx={{
              width: `100%`,
              alignItems: 'center',
              display: 'flex',
              justifyContent: 'center',
              color: b.active ? 'primary' : 'gray04',
              bg: b.active ? 'gray02' : 'white',
              p: 5,
            }}
            label={b.label}
            onPress={b.onPress}
            bold
          >
            {b.label}
          </Button>
        </Box>
      ))}
    </Flex>
  )
}
