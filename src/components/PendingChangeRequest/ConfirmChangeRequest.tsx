import React from 'react'
import { Box } from '@theme-ui/components'
import ItemApproved from './ItemApproved'
import ItemDeclined from './ItemDeclined'

type Props = {
  itemApproveds: any
  itemDeclineds: any
  setRejectReason(s: string): void
  rejectReason: string
}

const ConfirmChangeRequest = (props: Props) => {
  const { itemApproveds, itemDeclineds, setRejectReason, rejectReason } = props
  return (
    <Box>
      {itemApproveds && itemApproveds?.length > 0 && <ItemApproved itemApproveds={itemApproveds} />}
      {itemDeclineds && itemDeclineds?.length > 0 && (
        <ItemDeclined
          sx={{ mt: 4 }}
          itemDeclineds={itemDeclineds}
          setRejectReason={setRejectReason}
          rejectReason={rejectReason}
        />
      )}
    </Box>
  )
}
export default ConfirmChangeRequest
