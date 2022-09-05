import { gql } from '@apollo/client'

export default {
  companyLocation: gql`
    fragment CompanyLocation on SharedCompanyLocation {
      companyId
      id
      address
      postalCode
      location {
        city
        country
        region
      }
      selfDeclared
      isHeadQuarter
      expandStatus
      source
    }
  `,

  taxonomy: gql`
    fragment Taxonomy on TaxonomyWParent {
      companyDimensionId
      id
      isPrimary
      label
      value
      type
      dimensionType
      dimension
      link_id
    }
  `,

  investor: gql`
    fragment Investor on InvestorDetails {
      investor_id
      external_investor_id
      expand_status_id
      investor_name
      investor_type
      source
      children {
        investor_id
        external_investor_id
        source
        investor_name
      }
      investor_url
      funding_investor_id
      description
      linkedin_url
    }
  `,

  acquisition: gql`
    fragment Acquisition on CompanyAcquisitions {
      acquisition_id
      acquisition_date
      price
      sourcePrice
      priceCurrency
      status
      source
      comment
      selfDeclared
      expandStatus
      currency
      value_usd
      api_append
    }
  `,

  financials: gql`
    fragment Financials on SharedCompanyFinancials {
      valuation {
        value
        currency
      }
      fundingStage
      equityFundingTotal {
        value
        currency
      }
      fundingTotal {
        value
        currency
      }
      lastFundingAt
      lastFundingAmount {
        value
        currency
      }
      fundingRounds {
        id
        date
        roundTypes
        expandRound1
        expandRound2
        originExpandRound1
        originExpandRound2
        quarter
        source
        selfDeclared
        comment
        investment {
          value
          currency
          value_usd
        }
        valuation {
          value
          currency
          value_usd
        }
        investors {
          lead
          other
        }
        investorsDetails {
          id
          name
          isLead
          type
          url
          description
          linkedin_url
        }
        company {
          company_id
          name
          logo_bucket_url
        }
      }
    }
  `,

  ipos: gql`
    fragment Ipos on CompanyIpos {
      ipo_id
      went_public_on
      stock_symbol
      stock_exchange
      shares_sold
      shares_outstanding
      selfDeclared
      expandStatus
      share_price {
        value
        currency
        value_usd
      }
      source
      sourceAmount
      amountCurrency
      amount {
        value
        currency
        value_usd
      }
      valuation {
        value
        currency
        value_usd
      }
      api_append
    }
  `,

  overview: gql`
    fragment Overview on SharedCompanyOverView {
      foundedYear
      logoUrl
      companyType
      lastFundingType
      status
      expandStatus
      expandStatusId
      otherNames
      description
      longDescription
      closedDate
      ftes
      url
      logoUrl
      contactEmail
      source
      sources
      numberEmployee
      revenue
      facebook_url
      linkedin_url
      twitter_url
      ftes_exact
      ftes_range
      crunchbase_url
      dealroom_url
      uen
      logo_bucket_url
      hashed_image
      investorType
    }
  `,

  people: gql`
    fragment People on CompanyPeopleData {
      id
      jobTitleId
      uuid
      companyPeopleId
      source
      name
      gender
      imageUrl
      facebook
      linkedin
      twitter
      jobTitle
      numExits
      description
      numFoundedOrganizations
      sourceUpdated
      fctStatusId
    }
  `,

  acquirees: gql`
    fragment Acquiree on CompanyAcquiree {
      acquireeId
      source
      apiAppend
      companyId
      companyName
      url
      description
      longDescription
      status
      foundedYear
      closedDate
      valuation
      companyStage
      ftes
      contactEmail
      phoneNumber
      fctStatusId
      facebookUrl
      linkedinUrl
      twitterUrl
    }
  `,

  getExternalCompanyById: gql`
    fragment SharedCompanyResult on ExternalCompanyResult {
      id
      companyName
      financials {
        ...Financials
      }
      dimensions {
        tags {
          id
          rowId
          label
          source
          fctStatusId
          selfDeclared
        }
      }
      overview {
        ...Overview
        companyLocation {
          address
          postalCode
          location {
            city
            country
          }
          isHeadQuarter
          lon
          lat
        }
      }
      acquisitions {
        ...Acquisition
        investors {
          ...Investor
        }
      }
      ipos {
        ...Ipos
      }
      people {
        ...People
      }
      acquirees {
        ...Acquiree
      }
    }
  `,

  overrideVisibility: gql`
    fragment OverrideVisibility on OverridesMergeConflicts {
      field
      values {
        value
        companyId
        dataOverrideId
        createNewHistoryTree
        targetId
        isDefaultOverride
        originValue
        user
        dateTime
        headquarterLocation {
          country {
            value
            companyId
            dataOverrideId
            createNewHistoryTree
            targetId
            isDefaultOverride
            originValue
            user
            dateTime
          }
          city {
            value
            companyId
            dataOverrideId
            createNewHistoryTree
            targetId
            isDefaultOverride
            originValue
            user
            dateTime
          }
        }
      }
    }
  `,

  news: gql`
    fragment News on CompanyNewsData {
      id
      title
      url
      author
      datePublished
      publisher
      imageUrl
      source
      fctStatusId
      sentimentLabel
      businessEvent
    }
  `,

  companyFundraising: gql`
    fragment CompanyFundraising on CompanyFundraisingData {
      id
      pitchDeckBucketKey
      isFundraising
      proceedsUtilization
      investorRelationsContact
      fctStatusId
    }
  `,

  companyPeople: gql`
    fragment CompanyPeople on CompanyPeopleData {
      id
      jobTitleId
      uuid
      companyPeopleId
      source
      name
      gender
      imageUrl
      hashedImage
      facebook
      linkedin
      twitter
      jobTitle
      numExits
      description
      numFoundedOrganizations
      sourceUpdated
      apiAppend
      fctStatusId
      selfDeclared
      titleTypeNames
      titleNames
      emailAddress
    }
  `,

  companyTechnology: gql`
    fragment CompanyTechnology on GetCompanyTechnology {
      technology_id
      technology_type_id
      technology_value
      fct_status_id
      self_declared
      company_id
    }
  `,

  companyTechnologyProvider: gql`
    fragment CompanyTechnologyProvider on GetCompanyTechnologyProvider {
      technology_provider_id
      name
      description
      fct_status_id
      self_declared
      company_technology_provider_id
      company_id
    }
  `,

  technologyProviderSearch: gql`
    fragment TechnologyProviderSearch on TechnologyProviderSearchItem {
      technology_provider_id
      name
      description
    }
  `,

  companyTechnologyCertification: gql`
    fragment CompanyTechnologyCertification on GetCompanyTechnologyCertification {
      certification_id
      certification
      certification_upload_bucket_key
      fct_status_id
      self_declared
      company_id
    }
  `,

  partnership: gql`
    fragment Partnership on PartnershipDetails {
      id
      partnershipId
      externalId
      source
      date
      summary
      title
      partnerDetails {
        id
        companyId
        partnerName
        externalId
        fctStatusId
      }
      fctStatusId
    }
  `,

  product: gql`
    fragment Product on ProductDetail {
      title
      companyId
      productId
      url
      date
      summary
      ml_cluster
      product_name
    }
  `,

  financialServiceLicense: gql`
    fragment FinancialServiceLicense on FinancialServiceLicenseRecord {
      license_jurisdiction
      license_type
      fctStatusId
      selfDeclared
      id
    }
  `,
}
