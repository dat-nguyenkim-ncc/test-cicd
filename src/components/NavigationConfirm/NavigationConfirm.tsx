import { Box } from '@theme-ui/components'
import React from 'react'
import { Prompt, useHistory } from 'react-router'
import { Flex } from 'theme-ui'
import { Button, Icon, Modal } from '..'
import { ETLRunTimeContext } from '../../context'
import { Paragraph, Heading } from '../primitives'

type Props = {
  callback(): Promise<void> | void
  when?: boolean
  message?: string
  title?: string
}
const NavigationConfirm = ({
  title = 'Warning',
  message = `You have made a number of changes on this page. Would you like to save the changes
now or leave without saving?`,
  ...props
}: Props) => {
  const history = useHistory()
  const [block, setBlock] = React.useState<boolean>(true)
  const [location, setLocation] = React.useState<string>()
  const [modal, setModal] = React.useState(false)

  const { isRunning } = React.useContext(ETLRunTimeContext)

  const handleBlockedNavigation = (nextLocation: any) => {
    if (block && !isRunning) {
      setLocation(nextLocation.pathname)
      setModal(true)
      setBlock(false)
      return false
    }
    return true
  }

  const handleConfirmNavigationClick = async (callback: () => Promise<any> | void) => {
    setModal(false)
    await callback()

    if (location) {
      history.push(location)
    }
  }

  return (
    <>
      <Prompt when={props.when} message={handleBlockedNavigation} />

      {modal && (
        <Modal
          sx={{
            p: 6,
            width: 500,
            maxHeight: '80vh',
            alignItems: 'flex-start',
            position: 'relative',
          }}
        >
          <Box
            sx={{
              overflow: 'auto',
              flex: 1,
              width: '100%',
              textAlign: 'center',
            }}
          >
            <Flex sx={{ width: '100%', justifyContent: 'center' }}>
              <Icon icon="alert" size="small" background="red" color="white" />
              <Heading center as="h4" sx={{ ml: 2, mb: 3 }}>
                {title}
              </Heading>
            </Flex>
            <Paragraph sx={{ mt: 3, lineHeight: 1.5 }}>{message}</Paragraph>
            <Flex sx={{ mt: 5, width: '100%', justifyContent: 'center' }}>
              <Button
                label="Leave without saving"
                sx={{ color: 'red' }}
                onPress={() => {
                  handleConfirmNavigationClick(() => Promise.resolve({}))
                }}
                variant="outline"
              />
              <Button
                label="Save now"
                sx={{ ml: 2 }}
                onPress={() => {
                  handleConfirmNavigationClick(props.callback)
                }}
              />
            </Flex>
          </Box>
        </Modal>
      )}
    </>
  )
}

export default NavigationConfirm
