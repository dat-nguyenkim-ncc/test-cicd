import React from 'react'
import { Box, Flex, Grid, SxStyleProp } from 'theme-ui'
import { IFormElement, useForm } from '../../hooks/useForm'
import { IUseForm } from '../../hooks/useForm/useForm'
import { VALIDATION_REQUIRED, VALIDATON_PATTERN } from '../../hooks/useForm/validation'
import { LogoState } from '../../pages/CompanyForm/CompanyForm'
import { CompanyPeopleData } from '../../pages/CompanyForm/graphql/companyPeople'
import {
  ColumnNames,
  invalidUpdateData,
  OverridesCompanyDataInput,
  TableNames,
  validateEmail,
  validateNumber2,
} from '../../pages/CompanyForm/helpers'
import { PendingUpdatePeopleState } from '../../pages/CompanyForm/People'
import strings from '../../strings'
import { ChangeFieldEvent, IField as IFieldBase, PopoverPositions } from '../../types'
import { EnumExpandStatusId } from '../../types/enums'
import { IS_URL_REGEX } from '../../utils/isURL'
import { TwoWayMap } from '../../utils/TwoWayMap'
import Button from '../Button'
import Dropdown from '../Dropdown'
import { ViewOverride } from '../FCTStatusAction/FCTStatusAction'
import { ButtonType } from '../Modal/Modal'
import PeopleAvatar from '../PeopleAvatar'
import ReasonPopover, { ViewOverrideButtons } from '../ReasonPopover'
import TextField from '../TextField'

type Props = {
  defaultValue?: Pick<CompanyPeopleData, PeopleFieldNames>
  isEdit?: boolean
  isOverride: boolean
  companyId: number
  pendingUpdateData?: PendingUpdatePeopleState
  setPendingUpdateData?(s: PendingUpdatePeopleState): void
  buttons?: Array<
    Omit<ButtonType, 'action'> & {
      action(form: IUseForm<PeopleFieldNames>, image?: LogoState): Promise<void> | void
    }
  >
  buttonSx?: SxStyleProp
  loading: boolean
} & ViewOverride

type IField = IFieldBase<PeopleFieldNames>

export default function PeopleForm({
  defaultValue,
  isEdit = true,
  isOverride,
  companyId,
  pendingUpdateData = {} as PendingUpdatePeopleState,
  setPendingUpdateData = () => {},
  viewHistoryFn,
  viewPendingCQFn,
  getNumPending,
  buttons,
  buttonSx,
  loading,
}: Props) {
  const isAppendCq = defaultValue?.fctStatusId === +EnumExpandStatusId.CHANGE_REQUEST
  const fields = getFields(isEdit)
  /* STATE */
  const form: IUseForm<PeopleFieldNames> = useForm<PeopleFieldNames>({
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
    }, {} as { [c in PeopleFieldNames]: IFormElement }),
  })

  const [reason, setReason] = React.useState('')
  const [imageState, setImageState] = React.useState<LogoState | undefined>()

  /* FUNCTION */

  const handleUpdateField = (input: OverridesCompanyDataInput) => {
    if (input.columnName === 'job_title') {
      setPendingUpdateData({
        ...(pendingUpdateData || {}),
        [input.columnName]: {
          ...input,
          tableName: TableNames.JOB_TITLE,
          id: defaultValue?.jobTitleId || '',
        },
      })
    } else {
      setPendingUpdateData({
        ...(pendingUpdateData || {}),
        [input.columnName]: input,
      })
    }

    setReason('')
  }

  const handleChangeImage = (image: LogoState, reason: string) => {
    setImageState(image)
    if (defaultValue) {
      setPendingUpdateData({
        ...(pendingUpdateData || {}),
        hashed_image: {
          id: defaultValue.id,
          tableName: TableNames.PEOPLE,
          columnName: ColumnNames.HASHED_IMAGE,
          oldValue: defaultValue.hashedImage,
          newValue: image.hash,
          source: defaultValue.source,
          companyId,
          reason,
        },
      })
    }
  }

  const revertChange = (field: IField) => {
    if (!defaultValue) return
    const columnName = PeopleColumnName.get(field.name)
    const { [columnName]: reverting } = pendingUpdateData
    const previousValue = reverting?.newValue || defaultValue[field.name]

    form.dispatch({ id: field.name, type: 'change', value: (previousValue || '') as string })
    setPendingUpdateData({
      ...(pendingUpdateData || {}),
      [columnName]: {
        id: defaultValue.id,
        tableName: TableNames.PEOPLE,
        columnName,
        oldValue: defaultValue[field.name] || '',
        newValue: previousValue || '',
        source: defaultValue.source || '',
        reason: reverting?.reason || '',
        companyId,
      },
    })
  }

  const renderField = (field: IField) => {
    const { value, isValid } = form.state?.controls[field.name]
    const formattedValue = field.format ? field.format(value) : value
    if (field.name === 'imageUrl') {
      return (
        <Box>
          {defaultValue && (
            <ViewOverrideButtons
              sx={{ flexDirection: 'column', gap: 2, mb: 2 }}
              viewHistory={viewHistoryFn({
                tableName: TableNames.PEOPLE,
                columnName: ColumnNames.HASHED_IMAGE,
                rowId: defaultValue.id,
                source: defaultValue.source,
              })}
              viewPendingChangeRequest={viewPendingCQFn({
                tableName: TableNames.PEOPLE,
                columnName: ColumnNames.HASHED_IMAGE,
                rowId: defaultValue.id,
                source: defaultValue.source,
              })}
              totalItemPendingCR={getNumPending({
                tableName: TableNames.PEOPLE,
                columnName: ColumnNames.HASHED_IMAGE,
                rowId: defaultValue?.id,
                source: defaultValue?.source,
              })}
            />
          )}
          <PeopleAvatar
            state={imageState ? [imageState] : []}
            image={value}
            isEdit={isEdit}
            onChangeFile={handleChangeImage}
            square
            isOverride={isOverride}
            disabled={loading}
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

          const columnName = PeopleColumnName.get(field.name)
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
            tableName: columnName === 'job_title' ? TableNames.JOB_TITLE : TableNames.PEOPLE,
            rowId:
              columnName === 'job_title' ? defaultValue?.jobTitleId || '' : defaultValue?.id || '',
            source: defaultValue?.source || '',
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
                disabled={loading || field.disabled || !isEdit}
                buttons={[
                  {
                    label: isEdit ? strings.common.submit : strings.common.update,
                    isCancel: true,
                    type: 'primary',
                    action: () => {
                      if (!defaultValue) return
                      handleUpdateField({
                        id: defaultValue.id,
                        tableName: TableNames.PEOPLE,
                        columnName,
                        oldValue,
                        newValue,
                        source: defaultValue.source,
                        companyId,
                        reason,
                      })
                    },
                    disabled:
                      !isValid ||
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
                sx={{
                  ...(field.name === 'description' || field.name === 'imageUrl'
                    ? { gridColumnStart: 1, gridColumnEnd: 3 }
                    : {}),
                }}
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
                  await b.action(form, imageState)
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

export type PeopleDTOKeys =
  | 'id'
  | 'job_title_id'
  | 'uuid'
  | 'companyPeopleId'
  | 'source'
  | 'name'
  | 'gender'
  | 'image_url'
  | 'hashed_image'
  | 'facebook'
  | 'linkedin'
  | 'twitter'
  | 'job_title'
  | 'num_exits'
  | 'description'
  | 'num_founded_organizations'
  | 'source_updated'
  | 'api_append'
  | 'fct_status_id'
  | 'self_declared'
  | 'READ_ONLY'
  | 'email_address'

export type PeopleFieldNames = keyof Omit<CompanyPeopleData, 'selfDeclared'>

const PREFERED_POSITIONS: Record<PeopleFieldNames, PopoverPositions[]> = {
  name: ['right', 'left', 'bottom'],
  gender: ['right', 'left', 'bottom'],
  facebook: ['right', 'left', 'bottom'],
  linkedin: ['right', 'left', 'bottom'],
} as Record<PeopleFieldNames, PopoverPositions[]>

export const PeopleColumnName = new TwoWayMap<PeopleFieldNames, PeopleDTOKeys>({
  id: 'id',
  jobTitleId: 'READ_ONLY',
  uuid: 'READ_ONLY',
  companyPeopleId: 'READ_ONLY',
  source: 'source',
  name: 'name',
  gender: 'gender',
  imageUrl: 'image_url',
  hashedImage: 'hashed_image',
  facebook: 'facebook',
  linkedin: 'linkedin',
  twitter: 'twitter',
  jobTitle: 'job_title',
  numExits: 'num_exits',
  description: 'description',
  numFoundedOrganizations: 'num_founded_organizations',
  sourceUpdated: 'source_updated',
  apiAppend: 'api_append',
  fctStatusId: 'fct_status_id',
  titleNames: 'READ_ONLY',
  titleTypeNames: 'READ_ONLY',
  emailAddress: 'email_address'
})

const getFields = (isEdit: boolean): IField[] => [
  {
    type: 'file',
    name: 'imageUrl',
    label: 'Image url',
    placeholder: 'Enter image url',
    disabled: isEdit,
    validators: [VALIDATON_PATTERN(IS_URL_REGEX)],
  },
  {
    type: 'input',
    name: 'name',
    label: 'Name',
    placeholder: 'Enter name',
    required: true,
    validators: [VALIDATION_REQUIRED()],
  },
  {
    type: 'dropdown',
    name: 'gender',
    label: 'Gender',
    placeholder: 'Enter name',
    options: [
      { label: 'Select', value: '' },
      { label: 'Male', value: 'male' },
      { label: 'Female', value: 'female' },
    ],
  },
  {
    type: 'input',
    name: 'emailAddress',
    label: 'Email address',
    placeholder: 'Enter email address',
    format: validateEmail,
  },
  {
    type: 'input',
    name: 'facebook',
    label: 'Facebook',
    placeholder: 'Enter facebook',
    validators: [VALIDATON_PATTERN(IS_URL_REGEX)],
  },
  {
    type: 'input',
    name: 'linkedin',
    label: 'Linkedin',
    placeholder: 'Enter linkedin',
    validators: [VALIDATON_PATTERN(IS_URL_REGEX)],
  },
  {
    type: 'input',
    name: 'twitter',
    label: 'Twitter',
    placeholder: 'Enter twitter',
    validators: [VALIDATON_PATTERN(IS_URL_REGEX)],
  },
  {
    type: 'input',
    name: 'jobTitle',
    label: 'Job title',
    placeholder: 'Enter job title',
  },
  {
    type: 'input',
    name: 'numExits',
    label: 'Num exits',
    placeholder: 'Enter num exits',
    format: validateNumber2,
  },
  {
    type: 'input',
    name: 'numFoundedOrganizations',
    label: 'Num founded organizations',
    placeholder: 'Enter num founded organizations',
    format: validateNumber2,
  },
  {
    type: 'textarea',
    name: 'description',
    label: 'Description',
    placeholder: 'Enter description',
  },
  {
    type: 'input',
    name: 'titleNames',
    label: 'Title',
    placeholder: '',
    disabled: true,
  },
  {
    type: 'input',
    name: 'titleTypeNames',
    label: 'Title type',
    placeholder: '',
    disabled: true,
  },
]
