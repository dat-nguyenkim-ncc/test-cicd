import React from 'react'
import { Flex } from 'theme-ui'
import ButtonText from '../ButtonText'
import Chips from '../Chips'
import { Paragraph } from '../primitives'

type PartnersListProps = {
  data: string[]
  maximumNumberOfShownItems?: number
}

const defaultShow = 17

const PartnersList = ({
  data = [],
  maximumNumberOfShownItems = defaultShow,
}: PartnersListProps) => {
  const [showAll, setShowAll] = React.useState<boolean>(false)
  return (
    <>
      <Paragraph
        sx={{ color: 'primary', fontSize: 16 }}
        bold
      >{`Total number of partners: ${data.length}`}</Paragraph>
      <Flex sx={{ mt: 3, flexFlow: 'wrap' }}>
        {(showAll ? data : data.slice(0, maximumNumberOfShownItems)).map((partner, index) => (
          <Chips key={index} label={partner} sx={{ bg: 'gray03' }} />
        ))}
        {data.length > maximumNumberOfShownItems && (
          <ButtonText
            sx={{ mt: 3, ml: 3, alignSelf: 'end', pb: 1, border: 'none' }}
            onPress={() => {
              setShowAll(!showAll)
            }}
            label={!showAll ? 'Show all ...' : 'Show less ...'}
            color="primary"
          />
        )}
      </Flex>
    </>
  )
}

export default PartnersList
