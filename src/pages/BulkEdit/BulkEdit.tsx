import React, { useState } from 'react'
import { useHistory } from 'react-router'
import { TabMenu } from '../../components'
import strings from '../../strings'
import { FileState, OperationState, TagData, TaxonomyState } from '../../types'
import { EnumCompanyTypeSector, EnumExpandStatus, Routes } from '../../types/enums'
import { localstorage, LocalstorageFields } from '../../utils'
import BulkEditOverview, { LocationState, defaultLocation, fields } from './BulkEditOverview'
import BulkEditTaxonomy, { defaultAux, defaultTag, EBulkEditTaxonomyType } from './BulkEditTaxonomy'
import Confirmation from './Confirmation'
import {
  EBulkEditOptions,
  getBulkEditTaxonomyInput_Dimensions,
  getBulkEditTaxonomyInput_Tag,
  getOperation,
} from './helpers'
import ConfirmTaxonomy from './BulkEditTaxonomy/Confirm'
import { v4 as uuidv4 } from 'uuid'
import {
  checkValidTaxonomy,
  defaultLocations,
  FieldNameKeys,
  FormFieldsState,
  getTaxonomyMapInput,
  LocationFields,
  TableNames,
  transformPostDate,
} from '../CompanyForm/helpers'
import { onError } from '../../sentry'
import { ErrorModal } from '../../components/ErrorModal'
import ConfirmOverview from './BulkEditOverview/ConfirmOverview'
import { useMutation, useApolloClient } from '@apollo/client'
import {
  BULK_EDIT_OVERVIEW,
  BULK_EDIT_TAXONOMY,
  GET_BULK_EDIT_DATA,
  MULTIPLE_COPY_BUCKET,
} from './graphql'
import { addAttachmentsMutation, getSignUrl } from '../CompanyForm/graphql'
import { ETLRunTimeContext } from '../../context'
import { formatFields } from '../ChangeRequestManagement/helpers'
import { BulkEditTaxonomyInput, MutationBulkEditTaxonomyArgs } from './graphql/bulkEdit'
import { DIMENSION_VALUE } from '../../utils/consts'

enum EBulkEditTab {
  TAXONOMY = 'taxonomy',
  OVERVIEW = 'overview',
  CONFIRMATION = 'confirmation',
}
const limitCompanies = 4000

const BulkEdit = () => {
  const history = useHistory()

  if (!localstorage.get(LocalstorageFields.BULK_EDIT)) {
    history.push(Routes.COMPANY_MANAGEMENT)
  }

  const {
    pages: { addCompanyForm: copy },
  } = strings

  const { checkTimeETL } = React.useContext(ETLRunTimeContext)

  const [tab, setTab] = useState<EBulkEditTab>(EBulkEditTab.TAXONOMY)
  const [error, setError] = React.useState('')
  const [updating, setUpdating] = useState<boolean>(false)

  // Taxonomy State
  const [selected, setSelected] = React.useState<EBulkEditTaxonomyType[]>([])
  const selectedPri = selected.includes(EBulkEditTaxonomyType.PRI)
  const selectedAux = selected.includes(EBulkEditTaxonomyType.AUX)
  const selectedTag = selected.includes(EBulkEditTaxonomyType.TAG)
  const selectedFType = selected.includes(EBulkEditTaxonomyType.FINTECH_TYPE)

  const [priTaxonomyState, setPriTaxonomyState] = React.useState<TaxonomyState>({
    tabActive: 'primary',
    tagGroupChildrenSelected: [],
    selectedMap: EnumCompanyTypeSector.FIN,
  })

  const [auxTaxonomyState, _setAuxTaxonomyState] = React.useState<
    Array<OperationState<TaxonomyState>>
  >([defaultAux])

  const [tagState, _setTagState] = React.useState<Array<OperationState<TagData[]>>>([defaultTag])

  const [fintechTypeState, setFintechTypeState] = React.useState<OperationState<TagData[]>>({
    uid: uuidv4(),
    operation: EBulkEditOptions.ADD_NEW,
    data: [],
  })

  const [reasonTaxonomy, setReasonTaxonomy] = React.useState('')

  // Overview state
  const [formState, setFormState] = useState<FormFieldsState>({} as FormFieldsState)
  const [reasonState, setReasonState] = useState<FormFieldsState>({} as FormFieldsState)
  const [reasonHQ, setReasonHQ] = useState<LocationFields>(defaultLocations)
  const [overviewSelected, setOverviewSelected] = useState<FieldNameKeys[]>([])
  const [isSelectedHeadquarter, setSelectedHeadquarter] = useState<boolean>(false)
  const [isSelectedLocation, setSelectedLocation] = useState<boolean>(false)
  const [isSelectedAttachment, setSelectedAttachment] = useState<boolean>(false)

  const [headquarterState, setHeadquarterState] = useState<LocationFields>(defaultLocations)
  const [locationState, setLocationState] = useState<LocationState[]>([{ ...defaultLocation }])
  const [fileState, setFileState] = useState<FileState[]>([])
  const [attachmentType, setAttachmentType] = useState<string>()

  const [attachmentOption, setAttachmentOption] = useState<EBulkEditOptions>(
    EBulkEditOptions.ADD_NEW
  )

  // check tab
  const isTaxonomy = tab === EBulkEditTab.TAXONOMY
  const isOverview = tab === EBulkEditTab.OVERVIEW
  const isConfirmation = tab === EBulkEditTab.CONFIRMATION

  const buttons = [
    {
      label: copy.tabMenu.taxonomy,
      to: Routes.BULK_EDIT,
      active: isTaxonomy,
      disabled: true,
    },
    {
      label: copy.tabMenu.overview,
      to: Routes.BULK_EDIT,
      active: isOverview,
      disabled: true,
    },
  ]

  // Mutation
  const client = useApolloClient()
  const [bulkEditTaxonomy] = useMutation<boolean, MutationBulkEditTaxonomyArgs>(BULK_EDIT_TAXONOMY)
  const [bulkEditOverview] = useMutation(BULK_EDIT_OVERVIEW)
  const [multipleCopyBucket] = useMutation(MULTIPLE_COPY_BUCKET)
  const [addAttachments] = useMutation(addAttachmentsMutation)

  const uploadFile = async (
    data: any[],
    companyIds: number[],
    s3UploadOnly = false
  ): Promise<any> => {
    let attachments: any[] = []
    let buckets: { companyId: number; fileId: string }[] = []
    await Promise.all(
      (fileState || []).map(async file => {
        const matchingFile = data.find((e: any) => e.fileId === file.fileId)
        if (matchingFile?.signedUrl) {
          const companyId = companyIds.find(id => matchingFile.signedUrl.includes(`${id}`))
          if (companyId && !!companyIds.filter(id => id !== companyId).length) {
            buckets.push({ companyId, fileId: file.fileId })
          }
          const extension = file.file.name.slice(file.file.name?.lastIndexOf('.')) || ''
          for (let i = 0; i < companyIds.length; i += limitCompanies) {
            const idsList = companyIds.slice(i, i + limitCompanies)
            attachments.push({
              company_id: idsList,
              name: !!file.name.length
                ? file.name + extension
                : file.file.name.slice(0, file.file.name.lastIndexOf('.')),
              description: file.description,
              type: file.type,
              url_attachment: file.fileId,
              magicBytes: file.magicBytes,
              contentType: file.file.type,
            })
          }
          return fetch(matchingFile.signedUrl, {
            method: 'PUT',
            headers: {
              'Content-Type': file.file.type,
            },
            body: file.file,
          })
        }
      })
    )
    if (!!buckets.length) {
      for (const bucket of buckets) {
        const listToCopy = companyIds.filter(id => id !== bucket.companyId)
        for (let i = 0; i < listToCopy.length; i += limitCompanies) {
          const idsList = listToCopy.slice(i, i + limitCompanies)
          await multipleCopyBucket({
            variables: {
              input: {
                sourceId: bucket.companyId,
                companyIds: idsList,
                fileId: bucket.fileId,
              },
            },
          })
        }
      }
    }
    if (s3UploadOnly) {
      Promise.resolve()
    } else {
      for (const attachment of attachments) {
        await addAttachments({
          variables: {
            input: [attachment].map(a => ({ ...a, expandStatus: EnumExpandStatus.FOLLOWING })),
          },
        })
      }
    }
  }

  const saveFile = async (companyIds: number[], s3UploadOnly = false): Promise<any> => {
    if (!fileState?.length) return Promise.resolve()

    const fileDetails = fileState.map(({ fileId, magicBytes, type, file }) => ({
      fileId,
      magicBytes,
      type,
      contentType: file.type,
    }))

    const res = await client.query({
      query: getSignUrl,
      variables: {
        input: {
          companyIds: [companyIds[0]],
          fileDetails,
          operation: 'putObject',
        },
      },
    })

    if (res.data?.getSignUrl?.length) {
      await uploadFile(res.data.getSignUrl, companyIds, s3UploadOnly)
    }
    return Promise.resolve()
  }

  const onSubmit = async () => {
    if (!checkTimeETL()) return
    // If no mapping exist, api won't be called (category won't be created without mapping)
    try {
      setUpdating(true)

      const localState = JSON.parse(localstorage.get(LocalstorageFields.BULK_EDIT) || '[]')
      let companies = !localState.filter ? localState.companyIds : []

      if (!companies.length) {
        companies = await client
          .query({
            query: GET_BULK_EDIT_DATA,
            variables: { input: localState },
          })
          .then(({ data }) => data.getBulkEditData.data)
      }

      let errorList = []

      if (!!selected.length) {
        const { dimensions: priDimensions, categories: priCategories } = selectedPri
          ? getTaxonomyMapInput(priTaxonomyState, '')
          : { dimensions: [], categories: [] }

        const auxDimensions = !selectedAux
          ? []
          : getBulkEditTaxonomyInput_Dimensions(auxTaxonomyState).map(i => ({
              dimensionId: i.id,
              isPrimary: i.isPrimary,
              parentId: i.parent?.find(o => +o.dimension === DIMENSION_VALUE.SECTOR)?.id,
              isRemove: i.isRemove,
            }))
        const auxAction = !selectedAux ? null : getOperation(auxTaxonomyState)

        const tagInput = !selectedTag ? [] : getBulkEditTaxonomyInput_Tag(tagState)
        const tagAction = !selectedTag ? null : getOperation(tagState)

        const fintechType = !selectedFType ? [] : getBulkEditTaxonomyInput_Tag([fintechTypeState])
        const fintechTypeAction = !selectedFType ? null : getOperation([fintechTypeState])

        const mapAsOut = priCategories.some(item => item.name === EnumCompanyTypeSector.OUT)

        const input: BulkEditTaxonomyInput = {
          companyIds: companies,
          dimensions: mapAsOut ? [] : [...priDimensions, ...auxDimensions],
          tags: tagInput,
          fintechType,
          actions: {
            aux: auxAction,
            tag: tagAction,
            fintechType: fintechTypeAction,
          },
          mapAsOut,
          reason: reasonTaxonomy,
        }
        try {
          await bulkEditTaxonomy({
            variables: { input },
          })
        } catch (error) {
          errorList.push((error as any)?.message || 'Failed to bulk edit taxonomy')
        }
      }
      const overview = []

      for (const field of fields) {
        if (overviewSelected.includes(field.name)) {
          const isDate = ['closed_date'].includes(field.name)
          const newValue =
            field.name === 'fct_status_id'
              ? formState[field.name] || '1'
              : isDate && formState[field.name]
              ? transformPostDate(formState[field.name])
              : `${formState[field.name] || ''}`
          overview.push({
            tableName: field.table,
            columnName: field.name,
            newValue,
            reason: reasonState[field.name],
          })
        }
      }
      if (!!overview.length) {
        const maxRecords = 50000
        const size =
          maxRecords / companies.length > 1 ? Math.floor(maxRecords / companies.length) : 1
        for (let i = 0; i < overview.length; i += size) {
          const data = overview.slice(i, i + size)
          const inputOverview = {
            overview: data,
            company_ids: companies,
          }
          try {
            await bulkEditOverview({ variables: { input: inputOverview } })
          } catch (error) {
            errorList.push(
              'Failed to bulk edit ' +
                data.map(({ columnName }) => formatFields(columnName)).join(', ')
            )
          }
        }
      }

      if (isSelectedHeadquarter) {
        const location_headquarters = []
        for (const item of ['country', 'city']) {
          if (!!headquarterState[item as keyof LocationFields]) {
            location_headquarters.push({
              tableName: TableNames.LOCATIONS,
              columnName: item,
              newValue: `${headquarterState[item as keyof LocationFields] || ''}`,
              reason: reasonHQ[item as keyof LocationFields],
            })
          }
        }
        try {
          await bulkEditOverview({
            variables: {
              input: {
                company_ids: companies,
                location_headquarters: isSelectedHeadquarter
                  ? {
                      ...headquarterState,
                      countryReason: reasonHQ.country,
                      cityReason: reasonHQ.city,
                    }
                  : null,
              },
            },
          })
        } catch (error) {
          errorList.push('Failed to bulk edit headquarter')
        }
      }

      if (isSelectedLocation) {
        try {
          await bulkEditOverview({
            variables: {
              input: {
                company_ids: companies,
                other_locations: isSelectedLocation ? locationState : null,
              },
            },
          })
        } catch (error) {
          errorList.push('Failed to edit others location')
        }
      }

      if (isSelectedAttachment && attachmentOption === EBulkEditOptions.CLEAR_ALL) {
        try {
          await bulkEditOverview({
            variables: {
              input: {
                company_ids: companies,
                attachment_option: isSelectedAttachment ? attachmentOption : null,
                attachment_type: attachmentType,
              },
            },
          })
        } catch (error) {
          errorList.push('Failed to bulk edit attachments')
        }
      }

      if (isSelectedAttachment && attachmentOption !== EBulkEditOptions.CLEAR_ALL) {
        try {
          await saveFile(companies)
        } catch (error) {
          errorList.push('Failed to upload files')
        }
      }
      if (errorList.length) {
        throw new Error(`Error: ${errorList.join('<br />')}.`)
      }
      setUpdating(false)
      history.push(Routes.COMPANY_MANAGEMENT)
    } catch (error) {
      onError(error)
      setError((error as any)?.message || '')
      setUpdating(false)
    }
  }

  const onClickingNextOnTaxonomy = () => {
    //validate primary taxonomy mapping
    try {
      if ((selectedPri && checkValidTaxonomy(priTaxonomyState)) || !selectedPri) {
        setTab(EBulkEditTab.OVERVIEW)
      }
    } catch (error) {
      setError((error as any)?.message || '')
    }
  }

  return (
    <>
      {isConfirmation ? (
        <Confirmation
          loading={updating}
          taxonomy={
            <ConfirmTaxonomy
              selectedPri={selectedPri}
              selectedAux={selectedAux}
              selectedTag={selectedTag}
              selectedFType={selectedFType}
              priTaxonomyState={priTaxonomyState}
              auxTaxonomyState={auxTaxonomyState}
              tagState={tagState}
              fintechTypeState={fintechTypeState}
              reason={reasonTaxonomy}
              setReason={setReasonTaxonomy}
            />
          }
          overview={
            <ConfirmOverview
              selected={overviewSelected}
              formState={formState}
              reasonState={reasonState}
              reasonHQ={reasonHQ}
              isSelectedHeadquarter={isSelectedHeadquarter}
              headquarterState={headquarterState}
              isSelectedLocation={isSelectedLocation}
              locationState={locationState}
              isSelectedAttachment={isSelectedAttachment}
              attachmentOption={attachmentOption}
              attachmentType={attachmentType}
              fileState={fileState}
            />
          }
          onCancel={() => {
            setTab(EBulkEditTab.TAXONOMY)
          }}
          onConfirm={onSubmit}
        />
      ) : (
        <>
          <TabMenu buttons={buttons} />
          {isOverview && (
            <BulkEditOverview
              selected={overviewSelected}
              formState={formState}
              isSelectedHeadquarter={isSelectedHeadquarter}
              headquarterState={headquarterState}
              isSelectedLocation={isSelectedLocation}
              locationState={locationState}
              isSelectedAttachment={isSelectedAttachment}
              attachmentOption={attachmentOption}
              attachmentType={attachmentType}
              fileState={fileState}
              reasonState={reasonState}
              reasonHQ={reasonHQ}
              setFormState={setFormState}
              setReasonState={setReasonState}
              setReasonHQ={setReasonHQ}
              setSelected={setOverviewSelected}
              setSelectedHeadquarter={setSelectedHeadquarter}
              setSelectedLocation={setSelectedLocation}
              setSelectedAttachment={setSelectedAttachment}
              setHeadquarterState={setHeadquarterState}
              setLocationState={setLocationState}
              setFileState={setFileState}
              setAttachmentType={setAttachmentType}
              setAttachmentOption={setAttachmentOption}
              onNext={() => setTab(EBulkEditTab.CONFIRMATION)}
            />
          )}
          {isTaxonomy && (
            <BulkEditTaxonomy
              selected={selected}
              selectedPri={selectedPri}
              selectedAux={selectedAux}
              selectedTag={selectedTag}
              selectedFType={selectedFType}
              priTaxonomyState={priTaxonomyState}
              auxTaxonomyState={auxTaxonomyState}
              tagState={tagState}
              fintechTypeState={fintechTypeState}
              setPriTaxonomyState={setPriTaxonomyState}
              _setAuxTaxonomyState={_setAuxTaxonomyState}
              _setTagState={_setTagState}
              setFintechTypeState={setFintechTypeState}
              setSelected={setSelected}
              onNext={onClickingNextOnTaxonomy}
            />
          )}
        </>
      )}

      {error && (
        <ErrorModal
          message={error}
          onOK={() => setError('')}
          sx={{ maxHeight: 300, overflowY: 'auto', textAlign: 'left' }}
        />
      )}
    </>
  )
}
export default BulkEdit
