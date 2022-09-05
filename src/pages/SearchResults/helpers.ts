import strings from '../../strings'
import { EPageKey, Routes } from '../../types/enums'

const {
  searchResults: { modal: copy },
} = strings

export const modals = {
  successAdd: {
    buttons: [
      {
        label: copy.successAdd.button,
        type: 'primary',
        action: 'successAdd',
      },
    ],
    heading: copy.successAdd.body.title,
    body: copy.successAdd.body.body,
  },
  confirmAggregate: {
    buttons: [
      {
        label: copy.confirmAggregate.buttonBack,
        type: 'outline',
        action: 'back',
      },
      {
        label: copy.confirmAggregate.buttonConfirm,
        type: 'primary',
        action: 'confirmAggregate',
      },
    ],
    heading: copy.confirmAggregate.body.title,
    body: copy.confirmAggregate.body.body,
  },
  errorAggregate: {
    buttons: [
      {
        label: copy.errorAggregate.buttonBack,
        type: 'outline',
        action: 'errorAggregate',
      },
    ],
    heading: copy.errorAggregate.body.title,
    body: copy.errorAggregate.body.body,
  },
  successAggregateSource: {
    buttons: [
      {
        label: copy.successAggregateSource.buttons.viewCompanyRecord,
        type: 'outline',
        action: 'viewCompanyRecord',
      },
      {
        label: copy.successAggregateSource.buttons.goBackToSearch,
        type: 'primary',
        action: 'goBackToSearch',
      },
    ],
    heading: copy.successAggregateSource.body.title,
    body: copy.successAggregateSource.body.body,
  },
  errorByChangeRequest: {
    buttons: [
      {
        label: copy.errorByChangeRequest.buttonBack,
        type: 'outline',
        action: 'back',
      },
    ],
    heading: copy.errorByChangeRequest.body.title,
    body: copy.errorByChangeRequest.body.body,
  },
}

export const EPage: {
  [x: string]: {
    title: string
    link: string
  }
} = {
  [EPageKey.MAPPING_ZONE]: {
    title: strings.header.mappingZone,
    link: Routes.MAPPING_ZONE,
  },
  [EPageKey.FIND_FINTECHS]: {
    title: strings.header.findFintechs,
    link: Routes.FIND_FINTECHS,
  },
  [EPageKey.INCORRECT_MAPPING]: {
    title: strings.header.incorrectMapping,
    link: Routes.INCORRECT_MAPPING,
  },
}

export const getPage = (url: string) => {
  const value = new URLSearchParams(url).get('page') || 'search'
  return (
    EPage[value] || {
      title: 'search',
      link: Routes.SEARCH,
    }
  )
}
