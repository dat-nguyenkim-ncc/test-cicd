import React, { PropsWithChildren } from 'react'
import { SxStyleProp } from 'theme-ui'
import { FooterCTAs } from '..'
import { ButtonProps, ViewInterface } from '../../types'
import { Heading, Paragraph, Section } from '../primitives'
import TabButtonMenu from '../TabButtonMenu'
import Updating from '../Updating'

type Props = ViewInterface<
  PropsWithChildren<{
    title: string
    footerButtons?: ButtonProps[]
    loading?: boolean
    message?: string
    tabButtons?: {
      label: string
      active: boolean
      onPress(): void
      disabled?: boolean
      sx?: SxStyleProp
    }[]
  }>
>

export default (props: Props) => {
  return (
    <>
      <Heading as="h2">{props.title}</Heading>
      {props.message && <Paragraph sx={{ color: 'red', mt: 2 }}>{props.message}</Paragraph>}
      {props.tabButtons && <TabButtonMenu sx={{ mt: 5, mb: -30 }} buttons={props.tabButtons} bold />}
      <Section sx={{ mt: 6 }}>
        {props.loading ? <Updating sx={{ py: 7 }} loading /> : props.children}
      </Section>
      {!!props.footerButtons?.length && <FooterCTAs buttons={props.footerButtons} />}
    </>
  )
}
