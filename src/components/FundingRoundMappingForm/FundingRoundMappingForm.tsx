import React, { useEffect, useMemo, useState } from 'react'
import { Box } from 'theme-ui'
import { invalidUpdateData } from '../../pages/CompanyForm/helpers'
import {
  FundingRoundMappingColumns,
  FUNDING_ROUND_EDITING_FIELDS,
  getMappingAfterUpdatingRound1OrRound2,
} from '../../pages/SourceMappingManagement/helpers'
import { FundingRoundMappingDTO } from '../../pages/SourceMappingManagement/types'
import strings from '../../strings'
import { ChangeFieldEvent, FormOption, OverridesData, RoundTypesOption } from '../../types'
import Dropdown from '../Dropdown'
import Modal from '../Modal'
import { OverridesHistory } from '../OverridesHistory'
import { Heading } from '../primitives'
import ReasonPopover from '../ReasonPopover'
import TextField from '../TextField'

type Props = {
  loading: boolean
  pendingFundingRoundMapping: FundingRoundMappingDTO
  setPendingFundingRoundMapping(mapping: FundingRoundMappingDTO): void
  reason: string
  setReason(reason: string): void
  fundingRoundMapping: FundingRoundMappingDTO
  dataOverrides: OverridesData[]
  roundTypeOptions: RoundTypesOption
  updating: boolean
}

const FundingRoundMappingForm = ({
  loading,
  pendingFundingRoundMapping,
  reason,
  setReason,
  fundingRoundMapping,
  roundTypeOptions,
  setPendingFundingRoundMapping,
  dataOverrides,
  updating,
}: Props) => {
  const {
    sourceMappingManagement: { roundMapping },
  } = strings

  const [editedFundingRoundMapping, setEditedFundingRoundMapping] = useState<
    FundingRoundMappingDTO
  >(fundingRoundMapping)

  useEffect(() => {
    setEditedFundingRoundMapping(fundingRoundMapping || ({} as FundingRoundMappingDTO))
  }, [fundingRoundMapping])

  const [viewHistory, setViewHistory] = useState<boolean>(false)

  const onChange = (key: keyof FundingRoundMappingDTO, value: string | number) => {
    const updatedRoundMapping = getMappingAfterUpdatingRound1OrRound2(
      key,
      value,
      editedFundingRoundMapping,
      roundTypeOptions
    )

    setEditedFundingRoundMapping(updatedRoundMapping)
    if (key === FundingRoundMappingColumns.ROUND1ID) {
      setPendingFundingRoundMapping(updatedRoundMapping)
    }
  }

  const revertChange = (key: keyof FundingRoundMappingDTO, oldValue: string | number) => {
    const originMapping = getMappingAfterUpdatingRound1OrRound2(
      key,
      oldValue,
      pendingFundingRoundMapping,
      roundTypeOptions
    )

    setEditedFundingRoundMapping(originMapping)
    setPendingFundingRoundMapping(originMapping)
  }

  const flatRound2Options = useMemo(
    () =>
      Object.values(roundTypeOptions.roundType2).reduce(
        (response, round2s) => [...response, ...round2s],
        []
      ),
    [roundTypeOptions]
  )

  const getRound2Label = (field: string, round2Id: number) => {
    if (field === FundingRoundMappingColumns.ROUND2ID) {
      return flatRound2Options.find(({ value: round2 }) => round2 === +round2Id)?.label || ''
    }
    return round2Id?.toString()
  }

  const mapLabelForDataOverride = (dataOverrides: OverridesData[]) =>
    dataOverrides.map(item => ({
      ...item,
      oldValue: getRound2Label(FundingRoundMappingColumns.ROUND2ID, +item.oldValue),
      newValue: getRound2Label(FundingRoundMappingColumns.ROUND2ID, +item.newValue),
    }))

  return (
    <>
      <Box sx={{ width: '100%' }}>
        <Heading as="h4" sx={{ fontWeight: 'bold', mb: 5 }}>
          {roundMapping.modalLabel}
        </Heading>
        {FUNDING_ROUND_EDITING_FIELDS.map(item => {
          const disabledEdit = !item.canEdit
          const value = editedFundingRoundMapping[item.key]
          const oldValue = pendingFundingRoundMapping[item.key]
          const originValue = fundingRoundMapping[item.key]
          const invalid = item?.validate && item.validate(value)
          const options: FormOption[] =
            item.key === FundingRoundMappingColumns.ROUND1ID
              ? roundTypeOptions.roundType1
              : roundTypeOptions.roundType2[editedFundingRoundMapping.round1Id]

          const disablePopover = !!item.disablePopover || disabledEdit || updating
          const disableField = disabledEdit || loading || updating
          return (
            <ReasonPopover
              key={item.key}
              reasonRequired={false}
              disabled={disablePopover}
              sx={{ mt: 4 }}
              labelSx={{ opacity: disabledEdit ? 0.5 : 1, mb: 3 }}
              variant={invalid ? 'error' : 'black'}
              buttons={[
                {
                  label: 'Save',
                  action: () => {
                    setPendingFundingRoundMapping({
                      ...pendingFundingRoundMapping,
                      [item.key]: value,
                    })
                  },
                  type: 'primary',
                  disabled:
                    invalid ||
                    loading ||
                    invalidUpdateData(
                      oldValue as number,
                      value as number,
                      reason,
                      true,
                      true,
                      false
                    ),
                  isCancel: true,
                },
              ]}
              oldValue={getRound2Label(item.key, originValue as number)}
              newValue={getRound2Label(item.key, value as number)}
              reason={reason}
              setReason={setReason}
              label={item.formLabel}
              viewHistory={
                dataOverrides.length && item.key === FundingRoundMappingColumns.ROUND2ID
                  ? () => {
                      setViewHistory(true)
                    }
                  : undefined
              }
              onClickOutSide={() => revertChange(item.key, oldValue)}
              onCancelCallBack={() => revertChange(item.key, oldValue)}
            >
              {item.fieldType === 'input' && (
                <TextField
                  name={'input' + item.key}
                  onChange={e => {
                    onChange(item.key, e.target.value)
                  }}
                  value={editedFundingRoundMapping[item.key]}
                  disabled={disableField}
                  fieldState={invalid ? 'error' : 'default'}
                ></TextField>
              )}
              {item.fieldType === 'dropdown' && (
                <Dropdown
                  name={'dropdown' + item.key}
                  onChange={(event: ChangeFieldEvent) => onChange(item.key, event.target.value)}
                  value={editedFundingRoundMapping[item.key]}
                  disabled={disableField}
                  fieldState={invalid ? 'error' : 'default'}
                  options={options}
                />
              )}
            </ReasonPopover>
          )
        })}
      </Box>

      {!!viewHistory && (
        <Modal
          sx={{ p: 4, maxWidth: '70vw', alignItems: 'flex-start', minWidth: '730px' }}
          buttons={[
            {
              label: 'OK',
              action: () => {
                setViewHistory(false)
              },
              type: 'primary',
              sx: {
                p: '10px 60px',
              },
            },
          ]}
          buttonsStyle={{ width: '100%', justifyContent: 'flex-end' }}
        >
          <Heading sx={{ fontWeight: 600, mb: 4 }} as={'h4'}>
            {strings.pages.addCompanyForm.modals.overrides.title}
          </Heading>
          <Box sx={{ maxHeight: '60vh', overflow: 'auto', flex: 1, width: '100%' }}>
            <OverridesHistory data={mapLabelForDataOverride(dataOverrides)} />
          </Box>
        </Modal>
      )}
    </>
  )
}

export default FundingRoundMappingForm
