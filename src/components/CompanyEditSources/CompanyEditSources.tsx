import React, { useState } from 'react'
import { Box, Flex } from 'theme-ui'
import { Checkbox, FooterCTAs } from '..'
import { CompanyDetail, SourceDetail } from '../../types'
import strings from '../../strings'
import CompanyItem from '../CompanyItem'
import { Section, Paragraph, Heading } from '../primitives'
import { Modal } from '../../components'
import { EnumRemoveSourceType } from '../../types/enums'
import { ETLRunTimeContext } from '../../context'

export type CompanyEditSourcesProps = {
  data: CompanyDetail
  onClickBack(): void
  onClickSave(defaultSource: string, toBeRemoved: string[]): void
  sources: SourceDetail[]
  onRemoveSource(removeId: string, type: number): void
}

type State = {
  checked?: string
  toBeRemoved: Record<string, boolean>
}

const removeSourceTypes = [
  { value: EnumRemoveSourceType.MAKE_TO_OUT, text: 'Map as out' },
  { value: EnumRemoveSourceType.CREATE_NEW_MAPPING, text: 'Create new mapping' },
  { value: EnumRemoveSourceType.KEEP_EXISTING_MAPPING, text: 'Keep existing mapping' },
  { value: EnumRemoveSourceType.SET_AS_DUPLICATE, text: 'Set as source duplicate' },
]

const CompanyEditSources = ({
  data,
  sources,
  onClickBack,
  onClickSave,
  onRemoveSource,
}: CompanyEditSourcesProps) => {
  const {
    pages: { company: copy },
  } = strings

  const { checkTimeETL } = React.useContext(ETLRunTimeContext)

  // TODO change this with the source list
  const defaultChecked = sources.find(s => s.source.default)
    ? sources.find(s => s.source.default)?.company.companyId
    : undefined

  const [state, setState] = useState<State>({ checked: defaultChecked, toBeRemoved: {} })
  const [modalVisible, setModalVisible] = useState<boolean>(false)
  const [showRemoveSourceModal, setShowRemoveSourceModal] = useState<boolean>(false)
  const [chosenRemoveType, setChosenRemoveType] = useState<{ value: number; text: string }>(
    removeSourceTypes[0]
  )

  const [chosenRemovedId, setChosenRemovedId] = useState<string>('')

  const onCheck = (checked: string) => {
    if (!state.toBeRemoved[checked]) {
      setState({ ...state, checked })
    }
  }

  const onRemove = (id: string) => {
    if (!checkTimeETL()) return
    if (sources?.length < 2) {
      return
    }
    setShowRemoveSourceModal(true)
    setChosenRemovedId(id)
  }

  const onSave = () => {
    if (sources.find(s => s.company.companyId === state.checked && s.company.source === 'MANUAL')) {
      setModalVisible(true)
    } else {
      const toBeRemoved = Object.keys(state.toBeRemoved)
        .map(a => (state.toBeRemoved[a] === true ? a : ''))
        .filter(a => a !== '')
      onClickSave(state.checked || '', toBeRemoved)
    }
  }

  const removeSource = () => {
    setShowRemoveSourceModal(false)
    onRemoveSource(chosenRemovedId as string, chosenRemoveType.value)
  }

  return (
    <>
      <Section>
        <Paragraph bold>
          {`${data.companyName} ${copy.editSources.settingsButton}`.toUpperCase()}
        </Paragraph>
        <Paragraph sx={{ mt: 4 }}>{copy.editSources.body}</Paragraph>
        <Box mt={5}>
          {sources.map((s, index) => (
            <CompanyItem
              sx={{ mt: 3 }}
              onCheck={onCheck}
              checked={state.checked === s.company.companyId}
              key={index}
              toBeRemoved={state.toBeRemoved[s.company.companyId]}
              onRemove={onRemove}
              companyDetails={{ ...s.company, expandStatusId: null, primaryCategories: null }}
              source={s.source.label}
              isInDefaultSelected={true}
              type={s.source.label === 'MANUAL' ? 'internal' : 'external'}
            />
          ))}
        </Box>
      </Section>
      <FooterCTAs
        buttons={[
          {
            label: copy.editSources.buttons.back,
            onClick: onClickBack,
            variant: 'outlineWhite',
          },
          {
            label: copy.editSources.buttons.save,
            onClick: onSave,
            disabled: !state.checked || sources?.length < 2,
          },
        ]}
      />
      {modalVisible && (
        <Modal
          buttons={[
            {
              label: 'No, Go Back',
              type: 'outline',
              action: () => {
                setModalVisible(false)
              },
            },
            {
              label: 'Yes, Set As Default',
              type: 'primary',
              action: () => {
                setModalVisible(false)
                const toBeRemoved = Object.keys(state.toBeRemoved)
                  .map(a => (state.toBeRemoved[a] === true ? a : ''))
                  .filter(a => a !== '')
                onClickSave(state.checked || '', toBeRemoved)
              },
            },
          ]}
        >
          <Paragraph center sx={{ mt: 3, fontSize: 16 }}>
            {'Are you sure you would like to continue with the Manual entry as your default?'}
          </Paragraph>
        </Modal>
      )}

      {showRemoveSourceModal && (
        <>
          <Modal
            buttons={[
              {
                label: 'Select',
                type: 'primary',
                action: () => {
                  removeSource()
                },
              },
              {
                label: 'Cancel',
                type: 'outline',
                action: () => {
                  setShowRemoveSourceModal(false)
                },
              },
            ]}
          >
            <Heading center as="h4">
              {'Choose one of the following options for the removed source:'}
            </Heading>

            {removeSourceTypes.map((item, index) => {
              return (
                <Flex key={index} sx={{ mt: index !== 0 ? 2 : '20px', width: '80%' }}>
                  <Checkbox
                    sx={{ gridColumn: 'checkbox' }}
                    onPress={() => {
                      setChosenRemoveType(item)
                    }}
                    checked={item.value === chosenRemoveType.value}
                  />
                  <Paragraph sx={{ mt: '2px', ml: '5px' }}>{item.text}</Paragraph>
                </Flex>
              )
            })}
          </Modal>
        </>
      )}
    </>
  )
}

export default CompanyEditSources
