import { FormOption, IPagination } from '../../types'

export type SimilarCompaniesSearch = {
  companyId: string
  searchBy: string
  total: number
  pagination: IPagination
}

export type SimilarCompaniesData = {
  companyId: string
  logoUrl: string
  companyName: string
  description: string
  longDescription: string
  country: string
  cluster: string
  category: string
  distance: number
}

export const similarCompaniesFields: FormOption[] = [
  { label: 'Name', value: 'companyName' },
  { label: 'Description', value: 'description' },
  { label: 'Long Description', value: 'longDescription' },
  { label: 'Country', value: 'country' },
  { label: 'Cluster', value: 'cluster' },
  { label: 'Category', value: 'category' },
  { label: 'Distance', value: 'distance' },
]

export const searchByOptions: FormOption[] = [
  { label: 'All', value: 'all' },
  { label: 'Clusters and Tags', value: 'clusters_and_tags' },
  { label: 'Descriptions', value: 'descriptions' },
  { label: 'Website Keywords', value: 'website_keywords' },
]

export const totalOptions: FormOption[] = [
  { label: '10', value: 10 },
  { label: '20', value: 20 },
  { label: '30', value: 30 },
  { label: '50', value: 50 },
  { label: '100', value: 100 },
]
