import strings from '../../strings'

const {
  pages: {
    company: { modal: copy },
  },
  searchResults: { modal },
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
  successEdit: {
    buttons: [
      {
        label: copy.successEditSource.button,
        type: 'primary',
        action: 'successAdd',
      },
    ],
    heading: copy.successEditSource.body.title,
    body: copy.successEditSource.body.body,
  },
  successRemoveSource: {
    buttons: [
      {
        label: copy.successRemoveSource.buttons.viewCompanyRecord,
        type: 'outline',
        action: 'viewCompanyRecord',
      },
      {
        label: copy.successRemoveSource.buttons.goBackToSearch,
        type: 'primary',
        action: 'goBackToSearch',
      },
    ],
    heading: copy.successRemoveSource.body.title,
    body: copy.successRemoveSource.body.body,
  },
  errorByChangeRequest: {
    buttons: [
      {
        label: modal.errorByChangeRequest.buttonBack,
        type: 'outline',
        action: 'back',
      },
    ],
    heading: modal.errorByChangeRequest.body.title,
    body: modal.errorByChangeRequest.body.body,
  },
}
