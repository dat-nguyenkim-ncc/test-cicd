import React from 'react'
import { useHistory } from 'react-router'
import { Button, FooterCTAs, Icon, TaxonomyMapping, Tooltip } from '../../components'
import { ErrorModal } from '../../components/ErrorModal'
import { Heading } from '../../components/primitives'
import { OperationState, TagData, TaxonomyState } from '../../types'
import { EnumCompanyTypeSector, Routes } from '../../types/enums'
import { convertToCompanyDimensions } from '../CompanyForm/helpers'
import DimensionBlock from './BulkEditTaxonomy/DimensionBlock'
import TagBlock from './BulkEditTaxonomy/TagBlock'
import { EBulkEditOptions } from './helpers'
import { v4 as uuidv4 } from 'uuid'
import { cloneDeep } from 'lodash'
import { Divider, Flex } from '@theme-ui/components'
import FintechType from './BulkEditTaxonomy/FintechType'
import OperationDropDown from './OperationDropDown'

export type OperationType = 'tag' | 'aux'
// type BulkEditTaxonomyActions = Record<OperationType, EBulkEditOptions>

export type Props = {
  selected: EBulkEditTaxonomyType[]
  priTaxonomyState: TaxonomyState
  auxTaxonomyState: Array<OperationState<TaxonomyState>>
  tagState: Array<OperationState<TagData[]>>
  fintechTypeState: OperationState<TagData[]>
  selectedPri: boolean
  selectedAux: boolean
  selectedTag: boolean
  selectedFType: boolean
  setPriTaxonomyState(v: TaxonomyState): void
  setFintechTypeState(v: OperationState<TagData[]>): void
  _setAuxTaxonomyState(s: Array<OperationState<TaxonomyState>>): void
  _setTagState(s: Array<OperationState<TagData[]>>): void
  setSelected(s: EBulkEditTaxonomyType[]): void
  onNext(): void
}

export const defaultAux: OperationState<TaxonomyState> = {
  uid: uuidv4(),
  operation: EBulkEditOptions.ADD_NEW,
  data: {
    tabActive: 'aux',
    tagGroupChildrenSelected: [],
    selectedMap: EnumCompanyTypeSector.FIN,
  },
}

export const defaultTag: OperationState<TagData[]> = {
  uid: uuidv4(),
  operation: EBulkEditOptions.ADD_NEW,
  data: [],
}

export enum EBulkEditTaxonomyType {
  PRI = 'PRI',
  AUX = 'AUX',
  TAG = 'TAG',
  FINTECH_TYPE = 'FINTECH_TYPE',
}

const BulkEditTaxonomy = ({
  selected,
  selectedPri,
  selectedAux,
  selectedTag,
  selectedFType,
  priTaxonomyState,
  auxTaxonomyState,
  tagState,
  fintechTypeState,
  setPriTaxonomyState,
  setFintechTypeState,
  _setAuxTaxonomyState,
  _setTagState,
  setSelected,
  onNext,
}: Props) => {
  const history = useHistory()

  const setAuxTaxonomyState = (s: Array<OperationState<TaxonomyState>>) => {
    if (selectedAux) _setAuxTaxonomyState(s)
  }

  const setTagState = (s: Array<OperationState<TagData[]>>) => {
    if (selectedTag) _setTagState(s)
  }

  const [error, setError] = React.useState('')

  const getAuxUnableSelected = (): TagData[] => {
    return convertToCompanyDimensions(priTaxonomyState.selectedTags?.primary)
  }

  const handleAuxDataChange = (uid: string, d: TaxonomyState) => {
    if (!selectedAux) return
    setAuxTaxonomyState(
      auxTaxonomyState.map(i => {
        if (i.uid === uid) {
          return { ...i, data: d }
        }
        return i
      })
    )
  }

  const handleFintechTypeChange = (d: TagData[]) => {
    if (!selectedFType) return
    setFintechTypeState({ ...fintechTypeState, data: d })
  }

  const getUseState = (type: OperationType) => {
    const mapper: Record<
      OperationType,
      {
        state: OperationState<any>[]
        setState: (s: OperationState<any>[]) => void
      }
    > = {
      aux: { state: auxTaxonomyState, setState: setAuxTaxonomyState },
      tag: { state: tagState, setState: setTagState },
    }
    return mapper[type]
  }

  const handleRemoveOperation = (type: OperationType, uid: string) => {
    const { state, setState } = getUseState(type)
    setState(state.filter(i => i.uid !== uid))
  }

  const handleOperationChange = (type: OperationType, uid: string, d: EBulkEditOptions) => {
    const { state, setState } = getUseState(type)

    setState(
      state.map(i => {
        if (i.uid === uid) {
          return { ...i, operation: d }
        }
        return i
      })
    )
  }

  const handleTagDataChange = (uid: string, d: TagData[]) => {
    setTagState(
      tagState.map(item => {
        if (item.uid === uid) {
          return { ...item, data: d }
        }
        return item
      })
    )
  }

  return (
    <>
      <Heading sx={{ mt: 6 }} as="h2">
        Company Taxonomy
      </Heading>
      <DimensionBlock
        label="PRIMARY"
        checked={selectedPri}
        disabled={!selectedPri}
        onCheck={checked =>
          setSelected(
            checked
              ? selected.filter(str => str !== EBulkEditTaxonomyType.PRI)
              : [...selected, EBulkEditTaxonomyType.PRI]
          )
        }
      >
        <TaxonomyMapping
          taxonomyState={priTaxonomyState}
          setTaxonomyState={s => {
            if (selectedPri) setPriTaxonomyState(s)
          }}
          sx={{
            ...(selectedPri ? {} : { opacity: 0.5 }),
          }}
          shouldBlockCategory={{
            [EnumCompanyTypeSector.FIN]: true,
            [EnumCompanyTypeSector.INS]: true,
            [EnumCompanyTypeSector.REG]: true,
          }}
        />
      </DimensionBlock>
      <DimensionBlock
        label="AUXILIARY"
        checked={selectedAux}
        disabled={!selectedAux}
        onCheck={checked =>
          setSelected(
            checked
              ? selected.filter(str => str !== EBulkEditTaxonomyType.AUX)
              : [...selected, EBulkEditTaxonomyType.AUX]
          )
        }
      >
        <>
          {auxTaxonomyState.map((item, index) => {
            const hideAux =
              item.operation === EBulkEditOptions.CLEAR_ALL ||
              (selectedPri && priTaxonomyState.selectedMap === EnumCompanyTypeSector.OUT)

            return (
              <Flex
                key={item.uid}
                sx={{
                  flexDirection: 'column',
                  ...(selectedAux ? {} : { opacity: 0.5 }),
                }}
              >
                <OperationDropDown
                  operation={item.operation}
                  disabled={!selectedAux}
                  onChange={event => {
                    handleOperationChange('aux', item.uid, event.target.value as EBulkEditOptions)
                  }}
                  onRemove={() => {
                    handleRemoveOperation('aux', item.uid)
                  }}
                  index={index}
                />
                <TaxonomyMapping
                  sx={{ ...(hideAux ? { display: 'none' } : {}) }}
                  taxonomyState={item.data}
                  setTaxonomyState={s => {
                    if (selectedAux) {
                      handleAuxDataChange(item.uid, s)
                    }
                  }}
                  unSelectableTags={selectedPri ? getAuxUnableSelected() : []}
                />
                <Divider sx={{ mt: 4 }} />
              </Flex>
            )
          })}
          <AddOperationButton
            onPress={() => {
              setAuxTaxonomyState([
                ...auxTaxonomyState,
                cloneDeep({ ...defaultAux, uid: uuidv4() }),
              ])
            }}
            disabled={!selectedAux}
          />
        </>
      </DimensionBlock>

      <DimensionBlock
        label="TYPE"
        checked={selectedFType}
        disabled={!selectedFType}
        onCheck={checked =>
          setSelected(
            checked
              ? selected.filter(str => str !== EBulkEditTaxonomyType.FINTECH_TYPE)
              : [...selected, EBulkEditTaxonomyType.FINTECH_TYPE]
          )
        }
      >
        <OperationDropDown
          operation={fintechTypeState.operation}
          disabled={!selectedFType}
          onChange={event => {
            setFintechTypeState({
              ...fintechTypeState,
              operation: event.target.value as EBulkEditOptions,
            })
          }}
        />
        <FintechType
          sx={{
            ...(!selectedFType ? { opacity: 0.5 } : {}),
            ...(fintechTypeState.operation === EBulkEditOptions.CLEAR_ALL
              ? {
                  display: 'none',
                }
              : {}),
          }}
          state={fintechTypeState.data}
          setState={s => handleFintechTypeChange(s)}
        />
      </DimensionBlock>

      <DimensionBlock
        label="TAGS"
        checked={selectedTag}
        disabled={!selectedTag}
        onCheck={checked =>
          setSelected(
            checked
              ? selected.filter(str => str !== EBulkEditTaxonomyType.TAG)
              : [...selected, EBulkEditTaxonomyType.TAG]
          )
        }
      >
        <>
          {tagState.map((item, index) => {
            const hideTag = item.operation === EBulkEditOptions.CLEAR_ALL

            return (
              <Flex
                key={item.uid}
                sx={{
                  flexDirection: 'column',
                  ...(selectedTag ? {} : { opacity: 0.5 }),
                }}
              >
                <OperationDropDown
                  operation={item.operation}
                  onChange={e => {
                    handleOperationChange('tag', item.uid, e.target.value as EBulkEditOptions)
                  }}
                  onRemove={() => {
                    handleRemoveOperation('tag', item.uid)
                  }}
                  disabled={!selectedTag}
                  index={index}
                />
                <TagBlock
                  sx={hideTag ? { display: 'none' } : {}}
                  tags={item.data}
                  setTags={s => {
                    handleTagDataChange(item.uid, s)
                  }}
                />
                <Divider sx={{ mt: 4 }} />
              </Flex>
            )
          })}
          <AddOperationButton
            onPress={() => {
              setTagState([...tagState, cloneDeep({ ...defaultTag, uid: uuidv4() })])
            }}
            disabled={!selectedTag}
          />
        </>
      </DimensionBlock>
      {error && <ErrorModal message={error} onOK={() => setError('')}></ErrorModal>}

      <FooterCTAs
        buttons={[
          {
            label: 'Cancel',
            variant: 'outlineWhite',
            onClick: () => history.push(Routes.COMPANY_MANAGEMENT),
          },
          {
            label: 'Next',
            onClick: onNext,
          },
        ]}
      />
    </>
  )
}

export default BulkEditTaxonomy

export const AddOperationButton = ({
  onPress,
  disabled,
}: {
  onPress(): void
  disabled: boolean
}) => {
  return (
    <Flex
      sx={{
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%',
        mt: 4,
      }}
    >
      <Button
        label="Add operation +"
        sx={{
          borderRadius: 10,
          color: 'primary',
        }}
        variant="outline"
        onPress={onPress}
        disabled={disabled}
      />
      <Tooltip
        sx={{ ml: -3, maxWidth: 514 }}
        content={`Operations will be carried out in order`}
        isShow={!disabled}
      >
        <Icon
          sx={{ ml: 3, opacity: disabled ? 0.5 : 1 }}
          icon="alert"
          size="small"
          background="primary"
          color="white"
        />
      </Tooltip>
    </Flex>
  )
}
