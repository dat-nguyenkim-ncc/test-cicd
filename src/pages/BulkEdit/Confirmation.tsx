import React from 'react'
import { FooterCTAs, Updating } from '../../components'
import { Heading, Section } from '../../components/primitives'

const Confirmation = ({
  taxonomy,
  overview,
  loading,
  onCancel,
  onConfirm,
}: {
  taxonomy: React.ReactElement
  overview: React.ReactElement
  loading: boolean
  onCancel(): void
  onConfirm(): void
}) => {
  return (
    <>
      <Heading sx={{ mt: 6 }} as="h2">
        Confirmation
      </Heading>
      <Section sx={{ mt: 5 }}>
        {loading ? (
          <Updating sx={{ py: 7, justifyContent: 'center' }} />
        ) : (
          <>
            <Heading sx={{ mb: 5, fontWeight: 'bold' }} as="h4">
              Taxonomy
            </Heading>
            {taxonomy}
            <Heading sx={{ mt: 7, mb: 5, fontWeight: 'bold' }} as="h4">
              Overview
            </Heading>
            {overview}
          </>
        )}
      </Section>

      {!loading && (
        <FooterCTAs
          buttons={[
            {
              label: 'Cancel',
              variant: 'outlineWhite',
              onClick: onCancel,
            },
            {
              label: 'Save',
              onClick: onConfirm,
            },
          ]}
        />
      )}
    </>
  )
}

export default Confirmation
