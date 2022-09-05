import { Box, Flex, Grid, Heading } from '@theme-ui/components'
import moment from 'moment'
import React from 'react'
import { Button, Dropdown, Modal, TextField, Updating } from '../../components'
import { FieldTypes } from '../../components/TextField'
import { UploadFile } from '../../components/UploadFile'
import { useForm, IFormElement } from '../../hooks/useForm'
import { IValue, IValues } from '../../hooks/useForm/useForm'
import { IValidators, VALIDATION_REQUIRED } from '../../hooks/useForm/validation'
import {
  ChangeFieldEvent,
  ResearchReportCompanyIdsInput,
  FieldProps,
  FileState,
  FormOption,
  IFieldFormat,
  IReport,
} from '../../types'
import { acceptedFormats, CSVContent, getCsvFileContent, validFileType } from '../../utils'
import exportIdsCsv from '../../utils/exportIdsCsv'
import { validateDate } from '../CompanyForm/helpers'
import { RemoveResearchReportInput } from './graphql'
import { DEFAULT_VIEW_DATE_FORMAT } from '../../utils/consts'

export type UploadFieldNames = 'issueNumber' | 'name' | 'version' | 'description' | 'publishDate'

type IUploadFields = Omit<
  FieldProps<{
    type: FieldTypes
    name: UploadFieldNames
    label: string
    placeholder: string
    validators?: IValidators
    format?: IFieldFormat
    required?: boolean
    options?: FormOption[]
  }>,
  'onChange'
>

const csvData = [
  'company_id,direct_mention',
  '100020,0',
  '100070,0',
  '100106,1',
  '100118,0',
  '100128,0',
  '100167,1',
]

const UploadFields = (isEdit = false): IUploadFields[] => {
  return [
    {
      type: 'input',
      name: 'issueNumber',
      label: 'Issue No.',
      placeholder: 'Issue No.',
      required: true,
      validators: [VALIDATION_REQUIRED()],
      disabled: isEdit,
    },
    {
      type: 'input',
      name: 'name',
      label: 'Report Name',
      placeholder: 'Report Name',
      required: true,
      validators: [VALIDATION_REQUIRED()],
    },
    {
      type: 'input',
      name: 'version',
      label: 'Version',
      placeholder: 'Version',
      disabled: isEdit,
      required: true,
      validators: [VALIDATION_REQUIRED()],
    },
    {
      type: 'textarea',
      name: 'description',
      label: 'Description',
      placeholder: 'Description',
    },
    {
      type: 'input',
      name: 'publishDate',
      label: 'Publish Date',
      placeholder: DEFAULT_VIEW_DATE_FORMAT,
      format: validateDate,
      required: true,
      validators: [VALIDATION_REQUIRED()],
    },
  ]
}

export type UploadReportForm = {
  formValue: { [c in UploadFieldNames]: IValue }
  fileState: FileState[]
  companyIds: ResearchReportCompanyIdsInput[] | null
}

type Props = {
  onUpload(input: UploadReportForm): Promise<void>
  onDelete(input: RemoveResearchReportInput): Promise<void>
  editItem?: IReport
  setError(s: string): void
}

const normalized = (item: IReport | undefined): IValues<UploadFieldNames> | undefined =>
  !item
    ? undefined
    : {
        issueNumber: `${item.issueNumber}` || '',
        publishDate: moment(item.publishedDate).format(DEFAULT_VIEW_DATE_FORMAT) || '',
        name: item.name || '',
        version: item.version || '',
        description: item.description || '',
      }

export default (props: Props) => {
  const isEdit = !!props.editItem
  const normalizedItem = normalized(props?.editItem)
  const fields = UploadFields(isEdit)
  const form = useForm<UploadFieldNames>({
    controls: fields.reduce((acc, curr) => {
      acc[curr.name] = {
        value: ((normalizedItem || {})[curr.name] || curr.defaultValue! || '') as string,
        isValid: true,
        validators: curr.validators,
        format: curr.format,
        disabled: curr.disabled,
      }
      return acc
    }, {} as { [c in UploadFieldNames]: IFormElement }),
  })

  const [fileState, setFileState] = React.useState<FileState[]>([])
  const [companyIdsState, setCompanyIdsState] = React.useState<FileState[]>([])
  const [isLoading, setIsLoading] = React.useState(false)

  const invalid = () => {
    let invalid = false

    if (isEdit && normalizedItem) {
      const formValue = form.getValue()
      invalid =
        invalid ||
        (Object.keys(normalizedItem).every(
          key => normalizedItem[key as UploadFieldNames] === formValue[key as UploadFieldNames]
        ) &&
          !companyIdsState.length)
    }

    invalid =
      invalid ||
      (!isEdit &&
        (!fileState.length ||
          fileState.some(f => !validFileType(f, acceptedFormats.pdf)) ||
          companyIdsState.some(f => f.file.name.split('.').pop() !== 'csv')))

    return invalid || form.invalid()
  }

  const getCompanyIds = async (): Promise<ResearchReportCompanyIdsInput[] | null> => {
    let companyIds = null

    if (companyIdsState && companyIdsState[0]?.file) {
      const content: CSVContent = await getCsvFileContent(companyIdsState[0].file, {
        firstLineHeader: true,
      })
      companyIds = content.lines.reduce((acc, line) => {
        const lineArr = line.split(',').map(l => l?.trim() || l)
        const err = `Invalid file format. (File: ${companyIdsState[0].file.name})`

        if (!lineArr) throw Error(err)

        const id = +lineArr[0],
          directMention = +lineArr[1]

        if (!id || ![0, 1].includes(directMention)) {
          throw Error(err)
        }

        return [...acc, { id, directMention }]
      }, [] as ResearchReportCompanyIdsInput[])
    }
    return companyIds
  }

  const handleUpload = async () => {
    await props.onUpload({
      formValue: form.getValue(),
      fileState,
      companyIds: (await getCompanyIds()) || [],
    })
  }

  const handleEdit = async () => {
    await props.onUpload({
      formValue: form.getValue(),
      fileState: [],
      companyIds: await getCompanyIds(),
    })
  }

  return (
    <>
      <Box sx={{ minWidth: '100%' }}>
        <Heading as="h3" sx={{ fontWeight: 'bold' }}>
          Upload Report
        </Heading>
        <Box sx={{ maxHeight: '70vh', overflow: 'auto', my: 4, pr: 15 }}>
          {!isEdit && (
            <UploadFile
              sx={{ mb: 4 }}
              setFileState={setFileState}
              fileState={fileState}
              label="File Name*"
              accept={acceptedFormats.pdf}
              invalidFn={f => !validFileType(f, acceptedFormats.pdf)}
            />
          )}

          <Grid>
            {fields.map(field => {
              const { value, isValid } = form.state?.controls[field.name]
              const formattedValue = field.format ? field.format(value) : value
              if (field.type === 'input' || field.type === 'textarea') {
                return (
                  <TextField
                    type={field.type}
                    name={field.name}
                    key={field.name}
                    value={value}
                    formattedValue={formattedValue as string}
                    label={field.label}
                    placeholder={field.placeholder}
                    required={field.required}
                    disabled={field.disabled}
                    fieldState={isValid ? 'default' : 'error'}
                    labelSx={{ mb: 3 }}
                    onChange={(e: ChangeFieldEvent) => {
                      form.dispatch({ type: 'change', id: field.name, value: e.target.value })
                    }}
                    onBlur={() => {
                      form.dispatch({
                        type: 'touch',
                        id: field.name,
                        value,
                      })
                    }}
                  />
                )
              } else if (field.type === 'dropdown') {
                return (
                  <Dropdown
                    name={field.name}
                    value={value}
                    key={field.name}
                    options={field.options || []}
                    label={field.label}
                    disabled={field.disabled}
                    labelSx={{ mb: 3 }}
                    onChange={(e: ChangeFieldEvent) => {
                      form.dispatch({ type: 'change', id: field.name, value: e.target.value })
                    }}
                  />
                )
              } else return null
            })}
          </Grid>

          <UploadFile
            sx={{ mt: 4 }}
            setFileState={setCompanyIdsState}
            fileState={companyIdsState}
            label="Company IDs"
            accept={['.csv']}
            invalidFn={f => {
              return f.file.name.split('.').pop() !== 'csv'
            }}
          />
          <Button
            sx={{ mt: 3, color: 'primary' }}
            icon="download2"
            iconLeft
            label=".csv template"
            variant="outline"
            color="primary"
            onPress={() => {
              exportIdsCsv({
                data: csvData,
                fileName: 'company_ids',
              })
            }}
          />
        </Box>
        <Flex sx={{ justifyContent: 'flex-end' }}>
          <Button
            label={isEdit ? 'Save' : 'Upload Report'}
            onPress={async () => {
              if (invalid()) return
              try {
                setIsLoading(true)

                if (!isEdit) {
                  await handleUpload()
                } else {
                  await handleEdit()
                }
              } catch (error) {
                props.setError(error.message)
              } finally {
                setIsLoading(false)
              }
            }}
            disabled={invalid() || isLoading}
          />
        </Flex>
      </Box>
      {isLoading && (
        <Modal sx={{ m: 20, minWidth: 500 }}>
          <Updating text="Saving" noPadding />
        </Modal>
      )}
    </>
  )
}
