import React from 'react'
import { Box, Flex, Grid, SxStyleProp } from 'theme-ui'
import { IFormElement, useForm } from '../../hooks/useForm'
import { IUseForm } from '../../hooks/useForm/useForm'
import { VALIDATON_PATTERN } from '../../hooks/useForm/validation'
import { LogoState } from '../../pages/CompanyForm/CompanyForm'
import { CompanyFundraisingData } from '../../pages/CompanyForm/graphql/companyFundraising'
import {
  ColumnNames,
  invalidUpdateData,
  OverridesCompanyDataInput,
  TableNames,
} from '../../pages/CompanyForm/helpers'
import {
  FundraisingDTOKeys,
  FundraisingFieldNames,
  PendingUpdateFundraisingState,
} from '../../pages/CompanyForm/Fundraising'
import strings from '../../strings'
import { ChangeFieldEvent, FileState, IField as IFieldBase, PopoverPositions } from '../../types'
import { EnumCompanySource, ENumDataType, EnumExpandStatusId } from '../../types/enums'
import { TwoWayMap } from '../../utils/TwoWayMap'
import Button from '../Button'
import Dropdown from '../Dropdown'
import { ViewOverride } from '../FCTStatusAction/FCTStatusAction'
import { ButtonType } from '../Modal/Modal'
import ReasonPopover, { ViewOverrideButtons } from '../ReasonPopover'
import TextField from '../TextField'
import { EMAIL_REGEX } from '../../utils/isEmail'
import { acceptedFormats } from '../../utils'
import FileModal from '../FileModal/FileModal'
import { checkLimitFileSize } from '../../utils/acceptedFileTypes'

type Props = {
  defaultValue?: Pick<CompanyFundraisingData, FundraisingFieldNames>
  isEdit?: boolean
  isOverride: boolean
  companyId: number
  fileState: FileState[]
  handleChangeFile(v: FileState[], b?: boolean): void
  pendingUpdateData?: PendingUpdateFundraisingState
  setPendingUpdateData?(s: PendingUpdateFundraisingState): void
  buttons?: Array<
    Omit<ButtonType, 'action'> & {
      action(form: IUseForm<FundraisingFieldNames>, image?: LogoState): Promise<void> | void
    }
  >
  buttonSx?: SxStyleProp
  loading: boolean
} & ViewOverride

type IField = IFieldBase<FundraisingFieldNames>

const {
  pages: { fundraising: copy },
} = strings

export default function FundraisingForm({
  defaultValue,
  isEdit = true,
  isOverride,
  companyId,
  fileState,
  handleChangeFile,
  pendingUpdateData = {} as PendingUpdateFundraisingState,
  setPendingUpdateData = () => {},
  viewHistoryFn,
  viewPendingCQFn,
  getNumPending,
  buttons,
  buttonSx,
  loading,
}: Props) {
  const acceptTypes = acceptedFormats.pdf
  const isAppendCq = defaultValue?.fctStatusId === +EnumExpandStatusId.CHANGE_REQUEST
  const fields = getFields()
  /* STATE */
  const form: IUseForm<FundraisingFieldNames> = useForm<FundraisingFieldNames>({
    controls: fields.reduce((acc, curr) => {
      const initValue = (defaultValue || {})[curr.name]
      acc[curr.name] = {
        value:
          initValue || initValue === 0 ? `${initValue}` : ((curr.defaultValue! || '') as string),
        isValid: true,
        validators: curr.validators,
        format: curr.format,
        disabled: curr.disabled,
      }
      return acc
    }, {} as { [c in FundraisingFieldNames]: IFormElement }),
  })

  const [reason, setReason] = React.useState('')

  /* FUNCTION */

  const handleUpdateField = (input: OverridesCompanyDataInput) => {
    setPendingUpdateData({
      ...(pendingUpdateData || {}),
      [input.columnName]: input,
    })

    setReason('')
  }

  const _handleChangeFile = (fileState: FileState[], forceUpdate?: boolean) => {
    handleChangeFile(fileState, forceUpdate)
    if (defaultValue && forceUpdate) {
      setPendingUpdateData({
        ...(pendingUpdateData || {}),
        pitch_deck_bucket_key: {
          id: defaultValue.id,
          tableName: TableNames.FUNDRAISING,
          columnName: ColumnNames.PITCH_DECK_BUCKET_KEY,
          oldValue: defaultValue.pitchDeckBucketKey,
          newValue: fileState?.[0]?.fileId || '',
          source: EnumCompanySource.BCG,
          companyId,
          reason,
        },
      })
    }
    setReason('')
  }

  const revertChange = (field: IField) => {
    if (!defaultValue) return
    const columnName = FundraisingColumnName.get(field.name)
    const { [columnName]: reverting } = pendingUpdateData
    const previousValue = reverting?.newValue || defaultValue[field.name]

    form.dispatch({ id: field.name, type: 'change', value: (previousValue || '') as string })
    setPendingUpdateData({
      ...(pendingUpdateData || {}),
      [columnName]: {
        id: defaultValue.id,
        tableName: TableNames.FUNDRAISING,
        columnName,
        oldValue: defaultValue[field.name] || '',
        newValue: previousValue || '',
        source: EnumCompanySource.BCG || '',
        reason: reverting?.reason || '',
        companyId,
      },
    })
    setReason('')
  }

  const invalidFn = (f: FileState) => {
    if (!f) return false
    return !acceptTypes.includes(f.file.type) || !checkLimitFileSize(f.file)
  }

  const renderField = (field: IField) => {
    const { value, isValid } = form.state?.controls[field.name]
    const formattedValue = field.format ? field.format(value) : value
    if (field.type === 'file' || field.name === 'pitchDeckBucketKey') {
      return (
        <Box>
          {defaultValue && (
            <ViewOverrideButtons
              sx={{ flexDirection: 'column', gap: 2, mb: 2 }}
              // viewHistory={viewHistoryFn({
              //   tableName: TableNames.FUNDRAISING,
              //   columnName: ColumnNames.PITCH_DECK_BUCKET_KEY,
              //   rowId: defaultValue.id,
              //   source: EnumCompanySource.BCG,
              // })}
              // viewPendingChangeRequest={viewPendingCQFn({
              //   tableName: TableNames.FUNDRAISING,
              //   columnName: ColumnNames.PITCH_DECK_BUCKET_KEY,
              //   rowId: defaultValue.id,
              //   source: EnumCompanySource.BCG,
              // })}
              // totalItemPendingCR={getNumPending({
              //   tableName: TableNames.FUNDRAISING,
              //   columnName: ColumnNames.PITCH_DECK_BUCKET_KEY,
              //   rowId: defaultValue?.id,
              //   source: defaultValue?.source,
              // })}
            />
          )}
          <FileModal
            reason={reason}
            setReason={setReason}
            handleChangeFile={_handleChangeFile}
            fileState={fileState || []}
            label={field.label}
            acceptTypes={acceptTypes || []}
            disabled={false}
            file={{
              id: defaultValue?.pitchDeckBucketKey || null,
              // extension: '.pdf',
              isChangeRequest: isAppendCq,
            }}
            invalidFn={invalidFn}
            multiple={false}
            invalidMessage={'Pitch Deck file must be a valid pdf file (Max 10 MB)'}
            data_type={ENumDataType.FUNDRAISING}
          />
        </Box>
      )
    } else if (field.type === 'input' || field.type === 'textarea') {
      return (
        <TextField
          type={field.type}
          name={field.name}
          value={value}
          formattedValue={formattedValue as string}
          placeholder={field.placeholder}
          required={field.required}
          disabled={field.disabled || loading}
          fieldState={isValid ? 'default' : 'error'}
          labelSx={{ mb: 3 }}
          onChange={(e: ChangeFieldEvent) => {
            form.dispatch({ type: 'change', id: field.name, value: e.target.value })
          }}
          onBlur={() => {
            form.dispatch({ type: 'touch', id: field.name, value })
          }}
        />
      )
    } else if (field.type === 'dropdown') {
      return (
        <Dropdown
          name={field.name}
          value={value}
          options={field.options || []}
          disabled={field.disabled || loading}
          labelSx={{ mb: 3 }}
          sx={{ width: '100%' }}
          onChange={(e: ChangeFieldEvent) => {
            form.dispatch({ type: 'change', id: field.name, value: e.target.value })
          }}
        />
      )
    } else return null
  }

  return (
    <>
      <Grid
        columns={['1fr 1fr']}
        sx={{ width: '100%', overflow: 'auto', maxHeight: '80vh', pr: 3 }}
        gap={30}
      >
        {fields.map(field => {
          const formattedValue = (v: string | number | string[]): string => {
            if (Array.isArray(v)) {
              return v.map(i => (field.format ? field.format(i) : `${i || ''}`)).join(', ')
            }
            return field.format ? field.format(v) : `${v || ''}`
          }

          const { value, isValid } = form.state?.controls[field.name]
          const oldValue = defaultValue ? formattedValue(defaultValue[field.name]) : ''
          const newValue = formattedValue(value)

          const columnName = FundraisingColumnName.get(field.name)
          const overrideProps = {
            oldValue,
            newValue,
            reason,
            setReason,
            reasonRequired: !isOverride && !isAppendCq,
            positions: PREFERED_POSITIONS[field.name],
            disabled: !isEdit || field.disabled,
          }

          const iden = {
            columnName,
            tableName: TableNames.FUNDRAISING,
            rowId: defaultValue?.id || '',
            source: EnumCompanySource.BCG,
          }

          return (
            <React.Fragment key={field.name}>
              <ReasonPopover
                {...overrideProps}
                label={field.label}
                name={field.name}
                required={field.required}
                onClickOutSide={() => revertChange(field)}
                onCancelCallBack={() => revertChange(field)}
                viewHistory={viewHistoryFn(iden)}
                viewPendingChangeRequest={viewPendingCQFn(iden)}
                totalItemPendingCR={getNumPending(iden)}
                disabled={loading || !isEdit}
                disablePopover={field.disabled}
                buttons={[
                  {
                    label: isEdit ? strings.common.submit : strings.common.update,
                    isCancel: true,
                    type: 'primary',
                    action: () => {
                      if (!defaultValue) return
                      handleUpdateField({
                        id: defaultValue.id,
                        tableName: TableNames.FUNDRAISING,
                        columnName,
                        oldValue,
                        newValue,
                        source: EnumCompanySource.BCG,
                        companyId,
                        reason,
                      })
                    },
                    disabled:
                      !isValid ||
                      invalidFn(fileState?.[0]) ||
                      invalidUpdateData(
                        oldValue,
                        newValue,
                        reason,
                        isOverride,
                        field.required,
                        isAppendCq
                      ),
                  },
                ]}
                // sx={{
                //   ...(field.name === 'description' || field.name === 'imageUrl'
                //     ? { gridColumnStart: 1, gridColumnEnd: 3 }
                //     : {}),
                // }}
              >
                {renderField(field)}
              </ReasonPopover>
            </React.Fragment>
          )
        })}
      </Grid>
      {!!buttons?.length && (
        <Flex sx={{ mt: 5, ...buttonSx }}>
          {buttons.map((b, index) => {
            return typeof b.visible === 'undefined' || b.visible === true ? (
              <Button
                key={index}
                sx={{ ...b.sx, ml: index === 0 ? 0 : 4 }}
                variant={b.type}
                label={b.label}
                onPress={async () => {
                  await b.action(form)
                }}
                disabled={b.disabled}
                icon={b.icon}
              />
            ) : null
          })}
        </Flex>
      )}
    </>
  )
}

const PREFERED_POSITIONS: Record<FundraisingFieldNames, PopoverPositions[]> = {
  pitchDeckBucketKey: ['right', 'left', 'bottom'],
  isFundraising: ['right', 'left', 'bottom'],
  proceedsUtilization: ['right', 'left', 'bottom'],
  investorRelationsContact: ['right', 'left', 'bottom'],
} as Record<FundraisingFieldNames, PopoverPositions[]>

export const FundraisingColumnName = new TwoWayMap<FundraisingFieldNames, FundraisingDTOKeys>({
  id: 'fundraising_id',
  pitchDeckBucketKey: 'pitch_deck_bucket_key',
  isFundraising: 'fundraising',
  proceedsUtilization: 'proceeds_utilization',
  investorRelationsContact: 'investor_relations_contact',
  fctStatusId: 'fct_status_id',
  source: 'READ_ONLY',
})

const getFields = (): IField[] => [
  {
    type: 'file',
    name: 'pitchDeckBucketKey',
    label: copy.fields.pitchDeckBucketKey,
    placeholder: 'Enter file',
    disabled: true,
  },
  {
    type: 'dropdown',
    name: 'isFundraising',
    label: copy.fields.isFundraising,
    placeholder: '',
    options: [
      { label: 'Yes', value: 1 },
      { label: 'No', value: 0 },
    ],
  },
  {
    type: 'input',
    name: 'proceedsUtilization',
    label: copy.fields.proceedsUtilization,
    placeholder: 'Enter value',
    // validators: [VALIDATION_REQUIRED()],
  },
  {
    type: 'input',
    name: 'investorRelationsContact',
    label: copy.fields.investorRelationsContact,
    placeholder: 'Enter value',
    validators: [VALIDATON_PATTERN(EMAIL_REGEX)],
  },
]