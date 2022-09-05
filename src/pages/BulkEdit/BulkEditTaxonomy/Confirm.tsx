import React from 'react'
import { Button, List, ReasonTextField, TagMapping, Triangle } from '../../../components'
import { Box, Divider, Flex, Text } from 'theme-ui'
import strings from '../../../strings'
import { getFlatSelectedTags, getTaxonomyMapInput } from '../../CompanyForm/helpers'
import {
  CompanyDimensions,
  CompanyTypeSector,
  OperationState,
  TagData,
  TaxonomyState,
} from '../../../types'
import { EnumCompanyTypeSector, EnumDimensionType, EnumDimensionValue } from '../../../types/enums'
import { Palette } from '../../../theme'
import { startCase } from '../../../utils'
import { uniq } from 'lodash'
import { EBulkEditOptions, getOperation, getOperationChainResult } from '../helpers'
import { EBulkEditTaxonomyType } from '../BulkEditTaxonomy'

type Data = CompanyDimensions & { isRemove?: boolean }

type Props = {
  priTaxonomyState: TaxonomyState
  auxTaxonomyState: Array<OperationState<TaxonomyState>>
  tagState: Array<OperationState<TagData[]>>
  fintechTypeState: OperationState<TagData[]>
  selectedPri: boolean
  selectedAux: boolean
  selectedTag: boolean
  selectedFType: boolean
  reason: string
  setReason: React.Dispatch<React.SetStateAction<string>>
}

const Confirm = ({
  selectedPri,
  selectedAux,
  selectedTag,
  selectedFType,
  priTaxonomyState,
  auxTaxonomyState,
  tagState,
  fintechTypeState,
  reason,
  setReason,
}: Props) => {
  const {
    pages: {
      addCompanyForm: { taxonomy: copy },
    },
  } = strings

  const [tabActive, setTabActive] = React.useState<EBulkEditTaxonomyType>()
  const [data, setData] = React.useState<Data[]>([])
  const [operation, setOperation] = React.useState<EBulkEditOptions | null>(null)
  const [mapAsOut, setMapAsOut] = React.useState(false)

  const getData = React.useCallback(
    (type: EBulkEditTaxonomyType): { data: Data[]; operation: EBulkEditOptions | null } => {
      if (type === EBulkEditTaxonomyType.PRI) {
        if (selectedPri) {
          const { categories: priCategories } = getTaxonomyMapInput(priTaxonomyState, '')
          const mapAsOut = priCategories.some(item => item.name === EnumCompanyTypeSector.OUT)
          setMapAsOut(mapAsOut)
          return { data: getFlatSelectedTags(priTaxonomyState), operation: null }
        }
      } else if (type === EBulkEditTaxonomyType.AUX) {
        if (selectedAux) {
          return {
            data: getOperationChainResult<TaxonomyState, Data>(
              auxTaxonomyState,
              'link_id',
              item => getFlatSelectedTags(item),
              (item, list) =>
                !list.some(
                  d =>
                    item.id === d.id &&
                    item.parent.find(p => p.dimensionType === EnumDimensionType.SECTOR)?.id ===
                      d.parent.find(p => p.dimensionType === EnumDimensionType.SECTOR)?.id
                )
            ),
            operation: getOperation(auxTaxonomyState),
          }
        }
      } else if (type === EBulkEditTaxonomyType.TAG) {
        if (selectedTag) {
          return {
            data: getOperationChainResult<TagData[], Data>(tagState, 'id', d => {
              return d.map(item => ({ ...item, isPrimary: true }))
            }),
            operation: getOperation(tagState),
          }
        }
      } else if (type === EBulkEditTaxonomyType.FINTECH_TYPE) {
        if (selectedFType) {
          return {
            data: getOperationChainResult<TagData[], Data>([fintechTypeState], 'id', d => {
              return d.map(item => ({ ...item, isPrimary: true }))
            }),
            operation: getOperation([fintechTypeState]),
          }
        }
      }

      return {
        data: [],
        operation: null,
      }
    },
    [
      selectedPri,
      selectedAux,
      selectedTag,
      selectedFType,
      priTaxonomyState,
      auxTaxonomyState,
      tagState,
      fintechTypeState,
    ]
  )

  const onTabClick = (tab: EBulkEditTaxonomyType) => {
    const t = getData(tab)

    setTabActive(tab)
    setData(t.data)
    setOperation(t.operation)
  }

  React.useEffect(() => {
    const initType = selectedPri
      ? EBulkEditTaxonomyType.PRI
      : selectedAux
      ? EBulkEditTaxonomyType.AUX
      : selectedFType
      ? EBulkEditTaxonomyType.FINTECH_TYPE
      : selectedTag
      ? EBulkEditTaxonomyType.TAG
      : undefined

    if (initType) {
      const t = getData(initType)
      setTabActive(initType)
      setData(t?.data)
      setOperation(t?.operation)
    }
  }, [selectedPri, selectedAux, selectedTag, selectedFType, getData, mapAsOut])

  const tabButtons = [
    {
      label: startCase(copy.tabs.primary),
      active: tabActive === EBulkEditTaxonomyType.PRI,
      hidden: !selectedPri,
      onClick: () => {
        onTabClick(EBulkEditTaxonomyType.PRI)
      },
    },
    {
      label: startCase(copy.tabs.aux),
      active: tabActive === EBulkEditTaxonomyType.AUX,
      hidden: !selectedAux || mapAsOut,
      onClick: () => {
        onTabClick(EBulkEditTaxonomyType.AUX)
      },
    },
    {
      label: startCase('TYPE'),
      active: tabActive === EBulkEditTaxonomyType.FINTECH_TYPE,
      hidden: !selectedFType,
      onClick: () => {
        onTabClick(EBulkEditTaxonomyType.FINTECH_TYPE)
      },
    },
    {
      label: startCase('TAG'),
      active: tabActive === EBulkEditTaxonomyType.TAG,
      hidden: !selectedTag,
      onClick: () => {
        onTabClick(EBulkEditTaxonomyType.TAG)
      },
    },
  ]
  const addNewData = data.filter(item => !item.isRemove)
  const removeData = data.filter(item => item.isRemove)

  const getEmptyMessage = () => {
    if (operation === EBulkEditOptions.CLEAR_ALL)
      return { empty: false, message: `ALL MAPPINGS WILL BE REMOVED` }
    if (mapAsOut && tabActive === EBulkEditTaxonomyType.PRI)
      return { empty: false, message: `MAP AS OUT` }
    return { empty: true, message: `NO ACTION WILL BE APPLIED. PLEASE GO BACK AND SELECT MAPPING.` }
  }

  return (
    <Box sx={{ width: '100%', maxWidth: 1200, minWidth: 500 }}>
      <Flex sx={{ flex: 1, mb: 4 }}>
        {tabButtons
          .filter(b => !b.hidden)
          .map((b, index) => (
            <Button
              key={index}
              sx={{
                ml: index > 0 ? 5 : 0,
                minWidth: b.active ? 180 : 'auto',
                color: b.active ? Palette.white : Palette.black80,
              }}
              onPress={() => b.onClick()}
              variant={b.active ? 'primary' : 'muted'}
              label={b.label}
            />
          ))}
      </Flex>
      <Box>
        {!data.length ? (
          <Text as="h4" sx={{ width: '100%', textAlign: 'center', p: 20 }}>
            {getEmptyMessage().message}
          </Text>
        ) : (
          <>
            {uniq(addNewData.map(item => item.categoryName)).map((typeTech, index) => {
              if (
                !typeTech &&
                tabActive !== EBulkEditTaxonomyType.TAG &&
                tabActive !== EBulkEditTaxonomyType.FINTECH_TYPE
              )
                return null
              return (
                <React.Fragment key={index}>
                  {tabActive && (
                    <BulkEditTaxonomySummary
                      data={addNewData}
                      tabActive={tabActive}
                      typeTech={typeTech as CompanyTypeSector}
                      isRemove={false}
                    />
                  )}
                </React.Fragment>
              )
            })}
            {!!addNewData.length && !!removeData.length && <Divider mt={4} />}
            {uniq(removeData.map(item => item.categoryName)).map((typeTech, index) => {
              if (
                !typeTech &&
                tabActive !== EBulkEditTaxonomyType.TAG &&
                tabActive !== EBulkEditTaxonomyType.FINTECH_TYPE
              )
                return null
              return (
                <React.Fragment key={index}>
                  {tabActive && (
                    <BulkEditTaxonomySummary
                      data={removeData}
                      tabActive={tabActive}
                      typeTech={typeTech as CompanyTypeSector}
                      isRemove={true}
                    />
                  )}
                </React.Fragment>
              )
            })}
          </>
        )}
      </Box>
      {(!!data.length || !getEmptyMessage().empty) && (
        <ReasonTextField reason={reason} setReason={setReason} />
      )}
    </Box>
  )
}

export default Confirm

type BulkEditTaxonomySummaryProps = {
  data: CompanyDimensions[]
  tabActive: EBulkEditTaxonomyType
  typeTech: EnumCompanyTypeSector
  isRemove: boolean
}

const BulkEditTaxonomySummary = ({
  data,
  tabActive,
  typeTech,
  isRemove,
}: BulkEditTaxonomySummaryProps) => {
  const {
    pages: {
      addCompanyForm: { taxonomy: copy },
    },
  } = strings

  if (tabActive === EBulkEditTaxonomyType.FINTECH_TYPE || tabActive === EBulkEditTaxonomyType.TAG) {
    const name = {
      [EBulkEditTaxonomyType.FINTECH_TYPE]: 'Fintech Type',
      [EBulkEditTaxonomyType.TAG]: 'TAG',
    }
    return (
      <List
        label={`${isRemove ? 'Remove ' : 'New ' + name[tabActive]} Mappings`.toUpperCase()}
        list={data.map(item => ({
          id: item.id,
          label: (
            <Flex sx={{ alignItems: 'center', gap: 2 }}>
              {(item.parent || []).map((p, index) => (
                <React.Fragment key={index}>
                  <Text>{p.label}</Text>
                  <Triangle />
                </React.Fragment>
              ))}
              <Text>{item.label}</Text>
            </Flex>
          ),
        }))}
      />
    )
  }

  return (
    <TagMapping
      sx={{ mt: 4 }}
      typeTech={typeTech || ('' as EnumCompanyTypeSector)}
      title={`${(isRemove ? 'Remove ' : 'New ') + copy.types[typeTech as keyof typeof copy.types]}
         Mappings`?.toUpperCase()}
      mappings={{
        primary: {
          data:
            tabActive !== EBulkEditTaxonomyType.PRI
              ? []
              : data.filter(
                  t =>
                    t.isPrimary &&
                    t.categoryName === typeTech &&
                    t.dimension === EnumDimensionValue.PRIMARY
                ),
        },
        aux: {
          data:
            tabActive !== EBulkEditTaxonomyType.AUX
              ? []
              : data.filter(
                  t =>
                    !t.isPrimary &&
                    t.categoryName === typeTech &&
                    t.dimension === EnumDimensionValue.PRIMARY
                ),
        },
      }}
      extras={{
        primary: {
          data:
            tabActive !== EBulkEditTaxonomyType.PRI
              ? []
              : data?.filter(
                  t =>
                    t.dimension === EnumDimensionValue.SECONDARY &&
                    t.categoryName === typeTech &&
                    t.isPrimary
                ),
        },
        aux: {
          data:
            tabActive !== EBulkEditTaxonomyType.AUX
              ? []
              : data?.filter(
                  t =>
                    t.categoryName === typeTech &&
                    t.dimension === EnumDimensionValue.SECONDARY &&
                    !t.isPrimary
                ),
        },
      }}
    />
  )
}
