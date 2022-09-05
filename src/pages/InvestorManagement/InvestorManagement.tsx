import React from 'react'
import { useParams } from 'react-router'
import { InvestorManagement } from '../../components'
import { Heading, Section } from '../../components/primitives'
import strings from '../../strings'

export default () => {
  const { header } = strings
  const { cr: rowId } = useParams<any>()
  return (
    <>
      <Heading as="h2">{header.investorManagement}</Heading>
      <Section sx={{ mt: 5 }}>
        <InvestorManagement rowId={rowId} isPage onClose={() => {}} setIsEdited={() => {}} />
      </Section>
    </>
  )
}
