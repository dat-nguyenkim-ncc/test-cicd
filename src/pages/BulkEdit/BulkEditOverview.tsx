import { useQuery } from '@apollo/client'
import { Box, Flex, Grid } from '@theme-ui/components'
import React, { useCallback, useState } from 'react'
import { useHistory } from 'react-router'
import {
  Checkbox,
  Dropdown,
  FooterCTAs,
  Icon,
  Modal,
  Popover,
  TextField,
  UploadDocumentation,
} from '../../components'
import LocationForm from '../../components/LocationForm'
import { Heading, Paragraph, Section } from '../../components/primitives'
import strings from '../../strings'
import { ChangeFieldEvent, FileState, FormOption, Variants, ViewInterface } from '../../types'
import { checkLength } from '../../utils'
import { formFields, Fields } from '../CompanyForm/Form'
import {
  FieldNames,
  TableNames,
  FieldNameKeys,
  LocationFields,
  defaultLocations,
  scrollToElement,
  FormFieldsState,
} from '../CompanyForm/helpers'
import { bulkEditOptions, EBulkEditOptions } from './helpers'
import { getCountry } from '../CompanyForm/graphql'
import OperationDropDown from './OperationDropDown'
import { AddOperationButton } from './BulkEditTaxonomy'
import { EnumExpandStatusId, EnumExpandStatus, Routes } from '../../types/enums'
import { attachmentTypeOptions } from '../CompanyManagement/CompanyFilter/helpers'
import { EStatusValue } from '../CompanyForm/mock'

export const fields: Fields[] = [
  {
    name: FieldNames.fct_status_id,
    key: 'expandStatus',
    type: 'dropdown',
    option: [
      { value: EnumExpandStatusId.FOLLOWING, label: EnumExpandStatus.FOLLOWING },
      { value: EnumExpandStatusId.DUPLICATED, label: EnumExpandStatus.DUPLICATED },
    ],
    table: TableNames.COMPANIES,
  },
  ...formFields.filter(
    ({ key }) => key !== 'companyName' && key !== 'companyWebsite' && key !== 'companyOtherNames'
  ),
]

export type LocationState = {
  option: EBulkEditOptions
  location: LocationFields
}

type MapFormOption = Map<string, FormOption>

type BulkEditOverviewProps = {
  selected: FieldNameKeys[]
  formState: FormFieldsState
  isSelectedHeadquarter: boolean
  headquarterState: LocationFields
  isSelectedLocation: boolean
  locationState: LocationState[]
  isSelectedAttachment: boolean
  attachmentOption: EBulkEditOptions
  attachmentType?: string
  fileState: FileState[]
  reasonState: FormFieldsState
  reasonHQ: LocationFields
  setFormState(v: FormFieldsState): void
  setReasonState(v: FormFieldsState): void
  setReasonHQ(v: LocationFields): void
  setSelected(v: FieldNameKeys[]): void
  setSelectedHeadquarter(v: boolean): void
  setSelectedLocation(v: boolean): void
  setSelectedAttachment(v: boolean): void
  setHeadquarterState(v: LocationFields): void
  setLocationState(v: LocationState[]): void
  setFileState(v: FileState[]): void
  setAttachmentType(v: string): void
  setAttachmentOption(v: EBulkEditOptions): void
  onNext(): void
}

export const defaultLocation = {
  option: EBulkEditOptions.ADD_NEW,
  location: { ...defaultLocations, is_headquarters: 0 },
}
const BulkEditOverview = ({
  selected,
  formState,
  isSelectedHeadquarter,
  headquarterState,
  isSelectedLocation,
  locationState,
  isSelectedAttachment,
  attachmentOption,
  attachmentType,
  fileState,
  reasonState,
  reasonHQ,
  setFormState,
  setReasonState,
  setReasonHQ,
  setSelected,
  setSelectedHeadquarter,
  setSelectedLocation,
  setSelectedAttachment,
  setHeadquarterState,
  setLocationState,
  setFileState,
  setAttachmentType,
  setAttachmentOption,
  onNext,
}: BulkEditOverviewProps) => {
  const {
    pages: { addCompanyForm: copy },
  } = strings

  const history = useHistory()

  const [countriesMap, setCountriesMap] = useState<MapFormOption>(new Map())
  const [countries, setCountries] = useState<FormOption[]>([])

  const [errorFields, setErrorFields] = useState<FieldNameKeys[]>([])
  const [errorAttachment, setErrorAttachment] = useState<FieldNameKeys[]>([])
  const [message, setMessage] = useState<{ title: string; content: string }>({
    title: '',
    content: '',
  })

  // GRAPHQL
  const { data: countriesData, loading: getCountriesLoading } = useQuery(getCountry, {
    variables: { region: 'all' },
    onCompleted() {
      setCountries(countriesData.getCountry)
      const map = new Map()
      countriesData.getCountry?.forEach((item: FormOption) => {
        map.set(item.value, item)
      })
      setCountriesMap(map)
    },
  })

  const getFieldState = useCallback(({ value, format, formatError, maxlength, maxWord }: any) => {
    if (!value) return 'default'
    if (!format || !formatError)
      return !checkLength(value, maxlength, maxWord) ? 'validated' : 'error'
    if (format === '') return 'default'

    const fieldState =
      format === formatError || checkLength(value, maxlength, maxWord) ? 'error' : 'validated'
    return fieldState
  }, [])

  const onChangeField = (event: ChangeFieldEvent) => {
    const { name, value } = event.target
    if (name === FieldNames.status && value !== EStatusValue.CLOSED) {
      setSelected(selected.filter(field => field !== FieldNames.closed_date))
    }
    setFormState({ ...formState, [name]: value })
  }

  const onBlurField = (name: FieldNameKeys, value: string | number) => {
    const field = fields.find(f => f.name === name)
    const cloneError = [...errorFields].filter(field => field !== name)
    if (!field) return
    const { format, formatError, maxlength } = field
    const fieldState = getFieldState({
      value,
      format: format ? format(value) : undefined,
      formatError,
      maxlength,
    })
    if (fieldState === 'error') {
      setErrorFields([...cloneError, name])
    } else setErrorFields([...cloneError])
  }

  const _onNext = () => {
    if (!selected.length && !isSelectedHeadquarter && !isSelectedLocation && !isSelectedAttachment)
      onNext()

    for (const field of selected) {
      if (errorFields.includes(field) || !reasonState[field]) {
        scrollToElement(document.getElementById(field))
        return
      }
    }

    if (
      isSelectedLocation &&
      !!locationState.some(({ location: { region, country } }) => !!region && !country)
    ) {
      scrollToElement(document.getElementById('location'))
      return
    }
    if (!!errorAttachment.length) {
      scrollToElement(document.getElementById('attachment'))
      return
    }
    onNext()
  }

  const disabledLocation =
    isSelectedLocation &&
    locationState.some(
      ({ option, location }) =>
        [
          EBulkEditOptions.ADD_NEW,
          EBulkEditOptions.FIND_AND_REMOVE_THESE,
          EBulkEditOptions.REPLACE_ALL_WITH,
        ].includes(option) &&
        (!location.region.length || !location.country.length)
    )
  const checkDisabled = () => {
    if (disabledLocation) {
      return true
    }
    if (
      isSelectedHeadquarter &&
      !!headquarterState.country &&
      (!reasonHQ.country || !reasonHQ.city)
    ) {
      return true
    }
    if (
      isSelectedAttachment &&
      attachmentOption === EBulkEditOptions.ADD_NEW &&
      (!fileState.length ||
        fileState.reduce((acc, cur) => {
          if (!acc.some(file => file.type === cur.type)) {
            return [...acc, cur]
          }
          return acc
        }, [] as FileState[]).length !== fileState.length)
    ) {
      return true
    }
    return false
  }

  return (
    <>
      <Heading sx={{ mt: 6 }} as="h2">
        {copy.titles.overview}
      </Heading>
      <Section sx={{ mt: 5 }}>
        {fields.map((item, index) => {
          const formattedValue = item.format ? item.format(formState[item.name] || '') : undefined
          const fieldState = getFieldState({
            value: formState[item.name],
            format: formattedValue,
            formatError: item.formatError,
            maxlength: item.maxlength,
            maxWord: item.maxWord,
          })
          const isChecked = selected.includes(item.name)

          return (
            <Box key={index} sx={{ mb: 1 }}>
              <Flex>
                <Checkbox
                  label={copy.fields[item.key]}
                  square
                  checked={isChecked}
                  onPress={() => {
                    if (isChecked) {
                      setSelected(selected.filter(field => field !== item.name))
                    } else setSelected([...selected, item.name])
                  }}
                  disabled={
                    item.name === FieldNames.closed_date && formState.status !== EStatusValue.CLOSED
                  }
                />
                {isChecked && !reasonState[item.name] && (
                  <Paragraph sx={{ ml: 3, color: 'red' }}>Please input reason</Paragraph>
                )}
              </Flex>
              {item.name === FieldNames.company_alias ? undefined : item.type === 'dropdown' ? (
                <ReasonForm
                  disabled={!isChecked}
                  reason={reasonState[item.name]}
                  setReason={v => {
                    setReasonState({ ...reasonState, [item.name]: v })
                  }}
                >
                  <Dropdown
                    sx={{ py: 4 }}
                    name={item.name}
                    value={formState[item.name]}
                    options={item.option || []}
                    fieldState={fieldState}
                    placeholder={item.placeholder}
                    onChange={onChangeField}
                    disabled={!isChecked}
                  />
                </ReasonForm>
              ) : (
                <ReasonForm
                  disabled={!isChecked}
                  reason={reasonState[item.name]}
                  setReason={v => {
                    setReasonState({ ...reasonState, [item.name]: v })
                  }}
                >
                  <TextField
                    sx={{ py: 4 }}
                    id={item.name}
                    name={item.name}
                    value={formState[item.name]}
                    formattedValue={formattedValue}
                    type={item.type}
                    fieldState={fieldState}
                    placeholder={item.placeholder}
                    variant={
                      (fieldState === 'error'
                        ? 'error'
                        : fieldState === 'validated'
                        ? 'primary'
                        : 'black') as Variants
                    }
                    onChange={onChangeField}
                    onBlur={(name: FieldNameKeys) => {
                      onBlurField(name, formState[name])
                    }}
                    disabled={!isChecked}
                  />
                </ReasonForm>
              )}
            </Box>
          )
        })}
        <Box id="headquarter" sx={{ mb: 1 }}>
          <Checkbox
            label="Headquarter"
            square
            checked={isSelectedHeadquarter}
            onPress={() => {
              setSelectedHeadquarter(!isSelectedHeadquarter)
            }}
          />
          <Box
            sx={{
              px: 3,
              py: 4,
              my: 4,
              border: '1px solid black',
              borderRadius: 12,
              position: 'relative',
            }}
          >
            <Grid gap={2} columns={['1fr 1fr']} sx={{ mt: 4 }}>
              <ReasonForm
                disabled={!isSelectedHeadquarter}
                reason={reasonHQ.country}
                setReason={v => {
                  setReasonHQ({ ...reasonHQ, country: `${v}` })
                }}
              >
                <Flex sx={{ mb: 4, opacity: isSelectedHeadquarter ? 1 : 0.5 }}>
                  <Paragraph bold>Country</Paragraph>
                  {isSelectedHeadquarter && !!headquarterState.country && !reasonHQ.country && (
                    <Paragraph sx={{ color: 'red', px: 3 }}>Please input data</Paragraph>
                  )}
                </Flex>
                <Dropdown
                  name="country"
                  value={headquarterState.country || ''}
                  options={countries}
                  disabled={!isSelectedHeadquarter || getCountriesLoading}
                  onChange={e => {
                    setHeadquarterState({
                      ...headquarterState,
                      country: e.target.value,
                      region: countriesMap.get(e.target.value)?.regionValue || '',
                      city: '',
                    })
                  }}
                />
              </ReasonForm>
              <ReasonForm
                disabled={!headquarterState.country || !isSelectedHeadquarter}
                reason={reasonHQ.city}
                setReason={v => {
                  setReasonHQ({ ...reasonHQ, city: `${v}` })
                }}
              >
                <Flex sx={{ mb: 4, opacity: isSelectedHeadquarter ? 1 : 0.5 }}>
                  <Paragraph bold>City</Paragraph>
                  {isSelectedHeadquarter && !!headquarterState.country && !reasonHQ.city && (
                    <Paragraph sx={{ color: 'red', px: 3 }}>Please input data</Paragraph>
                  )}
                </Flex>
                <TextField
                  name="city"
                  type="input"
                  value={headquarterState.city || ''}
                  disabled={!headquarterState.country || !isSelectedHeadquarter}
                  onChange={e => {
                    setHeadquarterState({ ...headquarterState, city: e.target.value })
                  }}
                />
              </ReasonForm>
            </Grid>
          </Box>
        </Box>
        <Box id="location">
          <Checkbox
            label="Others location"
            square
            checked={isSelectedLocation}
            onPress={() => {
              setSelectedLocation(!isSelectedLocation)
            }}
          />
          <>
            {locationState.map((location, index) => (
              <Box
                key={index}
                sx={{
                  mt: 4,
                  border: '1px solid black',
                  borderRadius: 12,
                  position: 'relative',
                }}
              >
                <OperationDropDown
                  sx={{ px: 2, mb: 3 }}
                  operation={location.option}
                  disabled={!isSelectedLocation}
                  onChange={event => {
                    let cloneState = [...locationState]
                    cloneState[index].option = event.target.value as EBulkEditOptions
                    setLocationState(cloneState)
                  }}
                  onRemove={() => {
                    let cloneState = [...locationState]
                    cloneState.splice(index, 1)
                    setLocationState(cloneState)
                  }}
                  index={index}
                />
                {isSelectedLocation &&
                  location.option !== EBulkEditOptions.CLEAR_ALL &&
                  (!location.location.region.length || !location.location.country.length) && (
                    <Paragraph sx={{ color: 'red', px: 3 }}>Please input data</Paragraph>
                  )}
                {location.option !== EBulkEditOptions.CLEAR_ALL && (
                  <LocationForm
                    key={index}
                    sx={{ my: 0, pt: 3, border: 'none' }}
                    isAddPage={true}
                    location={location.location}
                    onChangeLocation={l => {
                      let cloneState = [...locationState]
                      cloneState[index].location = l
                      setLocationState(cloneState)
                    }}
                    reason={''}
                    setReason={() => {}}
                    setHistoryModal={() => {}}
                    getHistory={() => {}}
                    showViewHistory={() => false}
                    showPendingChangeRequest={() => false}
                    handleUpdateField={async () => {}}
                    oldData={{} as LocationFields}
                    newData={{} as LocationFields}
                    setOldData={() => {}}
                    disabled={!isSelectedLocation}
                  />
                )}
              </Box>
            ))}

            <AddOperationButton
              onPress={() => {
                setLocationState([...locationState, { ...defaultLocation }])
              }}
              disabled={!isSelectedLocation}
            />
          </>
        </Box>

        <Box id="attachment" sx={{ mt: 4 }}>
          <Checkbox
            label="Attachment"
            square
            checked={isSelectedAttachment}
            onPress={() => {
              setSelectedAttachment(!isSelectedAttachment)
            }}
          />
          <Dropdown
            sx={{ ml: 4, mt: 4, width: '50%' }}
            name="attachment_option"
            value={attachmentOption}
            onChange={event => {
              setAttachmentOption(event.target.value)
            }}
            options={bulkEditOptions.filter(
              ({ value }) =>
                value === EBulkEditOptions.ADD_NEW || value === EBulkEditOptions.CLEAR_ALL
            )}
            disabled={!isSelectedAttachment}
          />
          {attachmentOption === EBulkEditOptions.CLEAR_ALL ? (
            <Dropdown
              name="type"
              sx={{ ml: 4, mt: 4, width: '50%' }}
              placeholder="Select type"
              value={attachmentType}
              options={attachmentTypeOptions}
              onChange={e => {
                const value = e.target.value
                setAttachmentType(value)
              }}
              disabled={!isSelectedAttachment}
            />
          ) : (
            <UploadDocumentation
              sx={{ mt: 4 }}
              onChangeFile={setFileState}
              files={fileState}
              setErrorAttachment={setErrorAttachment}
              hideLabel={true}
              disabled={!isSelectedAttachment}
            />
          )}
        </Box>
      </Section>
      {message.title && message.content && (
        <Modal
          sx={{ minWidth: 500 }}
          buttons={[
            {
              label: copy.buttons.ok,
              type: 'primary',
              action: () => {
                setMessage({ title: '', content: '' })
              },
            },
          ]}
        >
          <Flex>
            <Icon icon="alert" size="small" background="red" color="white" />
            <Heading center as="h4" sx={{ ml: 2, mb: 3 }}>
              {message.title}
            </Heading>
          </Flex>
          <Paragraph center sx={{ mt: 3, fontSize: 16, lineHeight: 2 }}>
            {message.content}
          </Paragraph>
        </Modal>
      )}
      <FooterCTAs
        buttons={[
          {
            label: copy.buttons.cancel,
            variant: 'outlineWhite',
            onClick: () => history.push(Routes.COMPANY_MANAGEMENT),
          },
          {
            label: copy.buttons.next,
            onClick: _onNext,
            disabled: checkDisabled(),
          },
        ]}
      />
    </>
  )
}

const ReasonForm = ({
  children,
  disabled,
  reason,
  setReason,
}: ViewInterface<{
  disabled: boolean
  reason: string | number
  setReason(v: string | number): void
}>) => {
  const [open, setOpen] = useState<boolean>(false)
  return (
    <Box>
      <Popover
        open={open}
        setOpen={setOpen}
        onClickOutSide={() => {
          setOpen(false)
        }}
        disabled={disabled}
        content={
          <Box
            sx={{
              overflow: 'auto',
              minWidth: 320,
              maxWidth: 320,
              maxHeight: 500,
            }}
          >
            <TextField
              label="Reason"
              name="reason"
              value={reason}
              onChange={e => {
                setReason(e.target.value)
              }}
            />
          </Box>
        }
      >
        <Box
          onClick={() => {
            setOpen(true)
          }}
        >
          {children}
        </Box>
      </Popover>
    </Box>
  )
}

export default BulkEditOverview
