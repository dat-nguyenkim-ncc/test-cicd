import React from 'react'
import { Button, Dropdown, FilterTemplate, Popover, Updating } from '../../components'
import { Box, Flex, Label } from 'theme-ui'
import strings from '../../strings'

export type StateFilterBy = {
  isSelfDeclared: string
}

export type CompanyFilterProps = {
  loading: boolean
  filterVisible: boolean
  setFilterVisible: React.Dispatch<React.SetStateAction<boolean>>
  initFilterBy: StateFilterBy
  filterBy: StateFilterBy
  setFilterBy(filterBy: StateFilterBy): void
  resetFilter(): void
  applyFilter(filterBy: StateFilterBy | null): void
}

const ChangeRequestFilter = ({
  loading,
  filterVisible,
  setFilterVisible,
  initFilterBy,
  filterBy,
  setFilterBy,
  resetFilter,
  applyFilter,
}: CompanyFilterProps) => {
  const { companyManagement } = strings

  return (
    <>
      <Popover
        isToggle
        open={filterVisible}
        setOpen={setFilterVisible}
        padding={1}
        onClickOutSide={() => setFilterVisible(false)}
        content={
          <Box
            sx={{
              overflow: 'auto',
              minWidth: 300,
              maxWidth: 375,
              maxHeight: 500,
            }}
          >
            <FilterTemplate onClose={() => setFilterVisible(false)} resetFilter={resetFilter}>
              {loading ? (
                <Updating sx={{ py: 3 }} loading />
              ) : (
                <>
                  <Flex sx={{ alignItems: 'center', position: 'relative' }}>
                    <Label sx={{ width: 'auto', m: 0, mr: 4 }}>Self Declared</Label>
                    <Dropdown
                      clearable
                      name="isSelfDeclared"
                      options={[
                        { label: 'Yes', value: 'true' },
                        { label: 'No', value: 'false' },
                      ]}
                      value={filterBy.isSelfDeclared}
                      onChange={e => {
                        const newFilterBy = {
                          ...filterBy,
                          isSelfDeclared: e?.currentTarget.value,
                        }
                        setFilterBy(newFilterBy)
                        applyFilter(newFilterBy)
                      }}
                      onClear={e => {
                        setFilterBy(initFilterBy)
                        applyFilter(initFilterBy)
                        e.stopPropagation()
                      }}
                    />
                  </Flex>
                </>
              )}
            </FilterTemplate>
          </Box>
        }
      >
        <Button
          onPress={() => setFilterVisible((prev: boolean): boolean => !prev)}
          sx={{ color: 'primary', ml: 3, px: 18 }}
          icon="filter"
          variant="outline"
          label={companyManagement.buttons.filter}
          color="black50"
          iconLeft
        />
      </Popover>
    </>
  )
}

export default ChangeRequestFilter
