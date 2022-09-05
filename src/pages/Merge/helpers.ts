import { SearchResultItem } from '../../types'

export const formatInternalSearchResult = (mappedData: SearchResultItem[]): SearchResultItem[] => {
  const responseData = Array.from(new Set(mappedData.map(item => item.company_id))).map(id => {
    const dataOfThisId = mappedData
      .filter(item => item.company_id === id)
      .sort((a, b) => {
        return (a.priority as number) - (b.priority as number)
      })
    if (dataOfThisId?.length === 1) {
      return dataOfThisId[0]
    }
    return {
      ...dataOfThisId[0],
      source: dataOfThisId.map(item => {
        return {
          company: { ...item.companyDetails },
          source:
            item.priority === dataOfThisId[0].priority
              ? { label: item.source, default: true }
              : item.source,
        }
      }),
    }
  })
  return responseData as SearchResultItem[]
}

export type LicensesResult = {
  license_jurisdiction: string
  license_type: string
  fctStatusId: number
  selfDeclared: number
  id: number
  company_id: number
}
