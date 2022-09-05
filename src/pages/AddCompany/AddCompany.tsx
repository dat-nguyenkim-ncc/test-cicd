import React from 'react'
import { useHistory } from 'react-router-dom'
import AddCompanyBlock from '../../components/AddCompanyBlock'
import { Heading } from '../../components/primitives'
import { ETLRunTimeContext } from '../../context'
import strings from '../../strings'
import { Routes } from '../../types/enums'
import clearLocalState from '../../utils'

const AddCompanyPage = () => {
  const {
    pages: { addCompany: copy },
  } = strings

  const history = useHistory()

  const { checkTimeETL } = React.useContext(ETLRunTimeContext)

  const onPressForm = () => {
    if (!checkTimeETL()) return
    clearLocalState()
    history.push(Routes.ADD_COMPANY_OVERVIEW)
  }

  return (
    <>
      <Heading as="h2">{copy.title}</Heading>
      <AddCompanyBlock sx={{ mt: 5 }} onPressForm={onPressForm} />
    </>
  )
}

export default AddCompanyPage
