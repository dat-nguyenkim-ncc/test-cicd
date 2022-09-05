import { Flex } from '@theme-ui/components'
import React, { useMemo } from 'react'
import { Button, Dropdown } from '..'
import { FormOption, ViewInterface } from '../../types'
import { Paragraph } from '../primitives'

export type PaginationProps = ViewInterface<{
  changePage(page: number): void
  changePageSize?(size: number): void
  pageSize?: number
  maxVisibleButtons?: number
  currentPage: number
  totalPages: number
  hidePageButtons?: boolean
  color?: string
  bg?: string
}>
const pageSizeOption: FormOption[] = [
  { label: '10', value: 10 },
  { label: '20', value: 20 },
  { label: '50', value: 50 },
  { label: '100', value: 100 },
]
const range = (from: number, to: number, step = 1) => {
  let i = from
  const range = []

  while (i <= to) {
    range.push(i)
    i += step
  }

  return range
}
const getStartPage = (currentPage: number, maxVisibleButtons: number, totalPages: number) => {
  // When on the first page
  if (currentPage === 1) {
    return 1
  }
  // When on the last page
  if (currentPage >= totalPages) {
    return totalPages > maxVisibleButtons ? totalPages - maxVisibleButtons + 2 : 1
  }
  // When in between
  return currentPage - Math.floor((maxVisibleButtons - 2) / 2) - 1 < 1
    ? 1
    : currentPage === totalPages - Math.floor((maxVisibleButtons - 2) / 2)
    ? currentPage - Math.floor((maxVisibleButtons - 2) / 2) - 1
    : currentPage - Math.floor((maxVisibleButtons - 2) / 2)
}

const Pagination = ({
  sx,
  maxVisibleButtons = 5,
  changePage,
  changePageSize,
  currentPage,
  pageSize,
  totalPages,
  hidePageButtons = false,
  color = 'darkGray',
  bg = 'gray06',
}: PaginationProps) => {
  const getListPage = useMemo(() => {
    const startPage = getStartPage(currentPage, maxVisibleButtons, totalPages)
    const endPage = Math.min(
      startPage === 1 ? startPage + maxVisibleButtons - 2 : startPage + maxVisibleButtons - 3,
      totalPages
    )

    return range(startPage, endPage)
  }, [currentPage, maxVisibleButtons, totalPages])

  return totalPages > 0 ? (
    <Flex sx={{ mt: 6, justifyContent: `${totalPages <= 1 ? 'flex-end' : ''}` }}>
      {pageSize && changePageSize && <Flex sx={{ flex: 0.2 }} />}
      {totalPages > 1 && (
        <Flex sx={{ justifyContent: 'center', flex: pageSize && changePageSize ? 0.6 : 1 }}>
          <Button
            disabled={currentPage === 1}
            sx={{ mr: 1, bg: bg, color: color }}
            onPress={() => {
              changePage(currentPage - 1)
            }}
            label="Prev"
          />
          {!hidePageButtons ? (
            <>
              <Button
                sx={{
                  mr: 1,
                  bg: currentPage !== 1 ? bg : '',
                  color: currentPage !== 1 ? color : '',
                  cursor: 1 === currentPage ? 'not-allowed' : 'pointer',
                }}
                onPress={() => {
                  if (currentPage === 1) {
                    return
                  }
                  changePage(1)
                }}
                label="1"
              />
              {totalPages > maxVisibleButtons && getListPage[0] > 2 && (
                <Paragraph sx={{ fontSize: 20, px: 1, mr: 1, alignSelf: ' center' }}>...</Paragraph>
              )}

              {getListPage.map(page =>
                [1, totalPages].includes(page) ? undefined : (
                  <Button
                    key={page}
                    sx={{
                      mr: 1,
                      bg: currentPage !== page ? bg : '',
                      color: currentPage !== page ? color : '',
                      cursor: page === currentPage ? 'not-allowed' : 'pointer',
                    }}
                    onPress={() => {
                      if (page === currentPage) {
                        return
                      }
                      changePage(page)
                    }}
                    label={`${page}`}
                  />
                )
              )}

              {totalPages > maxVisibleButtons &&
                getListPage[getListPage.length - 1] < totalPages - 1 && (
                  <Paragraph sx={{ fontSize: 20, px: 1, mr: 1, alignSelf: ' center' }}>
                    ...
                  </Paragraph>
                )}
              {totalPages > 1 && (
                <Button
                  sx={{
                    mr: 1,
                    bg: currentPage !== totalPages ? bg : '',
                    color: currentPage !== totalPages ? color : '',
                    cursor: totalPages === currentPage ? 'not-allowed' : 'pointer',
                  }}
                  onPress={() => {
                    if (currentPage === totalPages) {
                      return
                    }
                    changePage(totalPages)
                  }}
                  label={`${totalPages}`}
                />
              )}
            </>
          ) : (
            <Button
              sx={{
                mr: 1,
                cursor: 'pointer',
              }}
              onPress={() => {}}
              label={`${currentPage}`}
            />
          )}
          <Button
            disabled={currentPage === totalPages}
            sx={{ mr: 1, bg: bg, color: color }}
            onPress={() => {
              changePage(currentPage + 1)
            }}
            label="Next"
          />
        </Flex>
      )}
      {pageSize && changePageSize && (
        <Flex sx={{ alignItems: 'center', justifyContent: 'flex-end', flex: 0.2 }}>
          <Paragraph sx={{ mr: 2 }}>Page size:</Paragraph>
          <Dropdown
            bg={bg}
            name="pageSize"
            options={pageSizeOption}
            value={pageSize}
            onChange={e => {
              changePageSize(+e.target.value)
            }}
            minWidth={100}
          />
        </Flex>
      )}
    </Flex>
  ) : (
    <> </>
  )
}

export default Pagination
