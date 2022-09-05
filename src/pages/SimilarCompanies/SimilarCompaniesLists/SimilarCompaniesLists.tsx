import React from 'react'
import { Box, Flex, Text } from 'theme-ui'
import { Checkbox, CompanyLogo, Tooltip } from '../../../components'
import { Paragraph } from '../../../components/primitives'
import { Info } from '../../../components/Tag/helpers'
import strings from '../../../strings'
import { Palette } from '../../../theme'
import { TOOLTIP_SX } from '../../../utils/consts'
import { ColumnNames } from '../../CompanyForm/helpers'
import { SimilarCompaniesData, similarCompaniesFields } from '../helpers'

const MAX_WIDTH = 222
const SAME_DISTANCE = '0'

type SimilarCompaniesListsProps = {
  searchCompany: string
  data: SimilarCompaniesData[]
  companiesSelected: SimilarCompaniesData[]
  setCompaniesSelected: React.Dispatch<React.SetStateAction<SimilarCompaniesData[]>>
}

const SimilarCompaniesList = ({
  searchCompany,
  data,
  companiesSelected,
  setCompaniesSelected,
}: SimilarCompaniesListsProps) => {
  const isSelectedAllOnPage =
    data.filter(company => companiesSelected.some(c => company.companyId === c.companyId))
      .length === data.length

  const handleColumns = (column: string | number, value: string | number): string => {
    switch (column) {
      case ColumnNames.DISTANCE:
        return value ? Number(value).toFixed(3).toString() : SAME_DISTANCE

      default:
        return (value || '').toString()
    }
  }

  return (
    <Box sx={{ overflowX: 'auto', overflowY: 'scroll', position: 'relative', maxHeight: 550 }}>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th
              style={{
                textAlign: 'left',
                padding: 12,
                minWidth: 175,
                maxWidth: MAX_WIDTH,
                position: 'sticky',
                top: 0,
                left: 0,
                backgroundColor: Palette.white,
              }}
            >
              <Flex>
                <Checkbox
                  sx={{ mr: 3 }}
                  square
                  checked={isSelectedAllOnPage}
                  onPress={() => {
                    const companiesSelectedFilter = companiesSelected.filter(
                      c => !data.some(company => company.companyId === c.companyId)
                    )
                    if (isSelectedAllOnPage) {
                      setCompaniesSelected(companiesSelectedFilter)
                    } else {
                      setCompaniesSelected([...companiesSelectedFilter, ...data])
                    }
                  }}
                />
                <Paragraph bold>{similarCompaniesFields[0].label}</Paragraph>
              </Flex>
            </th>
            {similarCompaniesFields
              .filter(field => field.value !== ColumnNames.COMPANY_NAME)
              .map(({ label, value }, index) => (
                <th
                  key={index}
                  style={{
                    textAlign: 'left',
                    padding: 12,
                    minWidth: 175,
                    maxWidth: MAX_WIDTH,
                    position: 'sticky',
                    top: 0,
                    left: 0,
                    backgroundColor: Palette.white,
                  }}
                >
                  <Flex sx={{ alignItems: 'center' }}>
                    <Paragraph bold>{label}</Paragraph>
                    {value === ColumnNames.DISTANCE && (
                      <Tooltip
                        content={strings.distanceTooltip}
                        isShow
                        sx={TOOLTIP_SX}
                        containerSx={{ left: '-20px', top: '12px' }}
                      >
                        <Flex sx={{ ml: 1 }}>
                          <Info />
                        </Flex>
                      </Tooltip>
                    )}
                  </Flex>
                </th>
              ))}
          </tr>
        </thead>
        <tbody>
          {data.map((c, i) => {
            const isChecked = companiesSelected.some(company => company.companyId === c.companyId)
            const bgColor =
              +c.companyId === +searchCompany
                ? Palette.bgPrimary
                : i % 2 === 0
                ? Palette.gray03
                : 'white'
            return (
              <tr
                key={i}
                style={{
                  backgroundColor: 'white',
                  position: +c.companyId === +searchCompany ? 'sticky' : 'static',
                  top: 44,
                  left: 0,
                }}
              >
                <td
                  style={{
                    textAlign: 'left',
                    padding: 12,
                    minWidth: 222,
                    maxWidth: MAX_WIDTH,
                    backgroundColor: bgColor,
                  }}
                >
                  <Flex sx={{ alignItems: 'center' }}>
                    <Checkbox
                      sx={{ mr: 3 }}
                      square
                      checked={isChecked}
                      onPress={() => {
                        if (!isChecked) {
                          setCompaniesSelected([...companiesSelected, c])
                        } else
                          setCompaniesSelected(
                            companiesSelected.filter(d => d.companyId !== c.companyId)
                          )
                      }}
                    />
                    <Text>
                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 2,
                          '& img': { width: '25px', height: '25px', borderRadius: '4px' },
                        }}
                      >
                        <CompanyLogo src={c.logoUrl}></CompanyLogo>
                        <Text>{c.companyName}</Text>
                      </Box>
                    </Text>
                  </Flex>
                </td>
                {similarCompaniesFields
                  .filter(field => field.value !== ColumnNames.COMPANY_NAME)
                  .map(({ value }, index) => (
                    <td
                      key={index}
                      style={{
                        textAlign: 'left',
                        padding: 12,
                        maxWidth: MAX_WIDTH,
                        overflowWrap: 'break-word',
                        backgroundColor: bgColor,
                      }}
                    >
                      <Tooltip
                        sx={{ ml: -3, maxWidth: 514 }}
                        content={handleColumns(value, c[value as keyof SimilarCompaniesData])}
                        id={`${value}-${i}`}
                      >
                        <Paragraph
                          sx={{
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                          }}
                        >
                          {handleColumns(value, c[value as keyof SimilarCompaniesData])}
                        </Paragraph>
                      </Tooltip>
                    </td>
                  ))}
              </tr>
            )
          })}
        </tbody>
      </table>
    </Box>
  )
}

export default SimilarCompaniesList
