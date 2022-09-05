import { companyDetails, companySources, MockMonzoDetails } from '../../__mock__'

export const mock = {
  internal: [
    {
      companyDetails: MockMonzoDetails,
      source: companySources,
    },
    {
      companyDetails: companyDetails(),
      source: 'Source: XPTO',
    },
  ],
  external: [
    {
      companyDetails: companyDetails(),
      source: 'Source: XPTO',
    },
    {
      companyDetails: companyDetails(),
      source: 'Source: XPTO',
    },
    {
      companyDetails: companyDetails(),
      source: 'Source: XPTO',
    },
  ],
}
