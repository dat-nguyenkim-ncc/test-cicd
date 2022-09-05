import React from 'react'
import { Box, Flex, Grid, Label } from 'theme-ui'
import { Avatar, Paragraph } from '../primitives'
import { CompanyPeopleData } from '../../pages/CompanyForm/graphql/companyPeople'
import strings from '../../strings'

type Props = {
  person: CompanyPeopleData
}

export default function TwoColumnsItem(props: Props) {
  const { person } = props
  return (
    <Box sx={{ mb: 4 }}>
      <Flex sx={{ alignItems: 'center', gap: 3, mb: 3 }}>
        <Avatar src={person.imageUrl} size="48" />
        <Paragraph bold>{person.name || ''}</Paragraph>
      </Flex>

      <RoundInfo info={person} />
    </Box>
  )
}

const ROUND_INFO_GRID = ['1fr 1fr 1fr 1fr 1fr']
const {
  pages: { peopleForm: copy },
} = strings

const RoundInfo = ({ info }: { info: CompanyPeopleData }) => {
  return (
    <Grid
      sx={{
        bg: 'gray03',
        px: 4,
        py: 5,
        borderRadius: '10px',
        width: '100%',
        border: '1px solid',
        borderColor: 'gray01',
      }}
    >
      <Grid columns={ROUND_INFO_GRID}>
        {[
          { name: copy.fields.gender, value: info.gender },
          { name: copy.fields.jobTitle, value: info.jobTitle },
          { name: copy.fields.emailAddress, value: info.emailAddress },
          { name: copy.fields.facebook, value: info.facebook },
          { name: copy.fields.linkedin, value: info.linkedin },
          { name: copy.fields.twitter, value: info.twitter },
          { name: copy.fields.titleNames, value: info.titleNames?.join(',') },
          { name: copy.fields.titleTypeNames, value: info.titleTypeNames?.join(',') },
          { name: copy.fields.numExits, value: info.numExits },
          { name: copy.fields.numFoundedOrganizations, value: info.numFoundedOrganizations },
          { name: copy.fields.description, value: info.description },
        ].map((item, index) => (
          <Box
            key={index}
            mb={4}
            sx={{
              ...(item.name === copy.fields.description
                ? { gridColumnStart: 1, gridColumnEnd: 3 }
                : {}),
              wordBreak: 'break-word',
            }}
          >
            <Label mb={1}>{item.name}</Label>
            <Paragraph>{item.value?.toString() || ''}</Paragraph>
          </Box>
        ))}
      </Grid>
    </Grid>
  )
}
