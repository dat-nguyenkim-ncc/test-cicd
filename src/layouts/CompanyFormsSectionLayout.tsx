import React from 'react'
import { PropsWithChildren } from 'react'
import { SxStyleProp } from 'theme-ui'
import { Message, Updating } from '../components'
import { Section } from '../components/primitives'

type Props = PropsWithChildren<{
  title: string

  error?: string
  sectionSx?: SxStyleProp
  isLoading?: boolean
}>

const CompanyFormsSectionLayout = (props: Props) => {
  return (
    <>
      {props.error ? (
        <Message variant="alert" body={props.error} />
      ) : (
        <Section sx={{ bg: 'white', p: 5, mt: 5, maxWidth: 'none', ...props.sectionSx }}>
          {props.isLoading ? <Updating loading sx={{ p: 5 }} /> : props.children}
        </Section>
      )}
    </>
  )
}

export default CompanyFormsSectionLayout
