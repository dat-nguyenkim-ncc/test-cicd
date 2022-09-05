export default {
  InvestorDetail: {
    keyFields: ['id', 'name', 'isLead'],
  },
  TaxonomyWParent: {
    keyFields: ['id', 'isPrimary', 'dimensionType', 'link_id'],
  },
  PartnershipDetails: {
    keyFields: ['id', 'externalId'],
  },
  CategoryData: {
    keyFields: (data: any) => {
      return data.companyId ? ['id', 'isPrimary', 'companyId', 'name'] : []
    },
  },
  AliasDetails: {
    merge: false,
  },
  Query: {
    fields: {
      getPendingCRByCompanyId: {
        merge: false,
      },
    },
  },
}
