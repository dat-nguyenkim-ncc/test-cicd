import React, { PropsWithChildren } from 'react'
import { useIdleTimer } from 'react-idle-timer'
import { Flex } from 'theme-ui'
import { Button, Icon, Modal } from '../components'
import { Heading, Paragraph } from '../components/primitives'
import { ButtonProps } from '../types'
import { useOktaAuth } from '@okta/okta-react'
import { TokenManager } from '@okta/okta-auth-js'
import { onError } from '../sentry'
import { ETLRunTimeContext } from '../context'
import strings from '../strings'

const InactiveTimer = (props: PropsWithChildren<{}>) => {
  const { common } = strings

  const [actionModal, setActionModal] = React.useState(false)
  const { isRunning, ingestRunning, ETLTimer } = React.useContext(ETLRunTimeContext)

  const { authService } = useOktaAuth()
  const timer: { current: NodeJS.Timeout | null } = React.useRef(null)
  useIdleTimer({
    timeout: 1000 * 60 * 55, // 55 minutes
    onIdle: () => {
      setActionModal(true)
      timer.current = setTimeout(() => {
        authService.logout()
      }, 1000 * 60 * 5)
    },
    debounce: 500,
  })

  const buttons: ButtonProps[] = [
    {
      label: 'Stay signed in',
      type: 'primary',
      action: async () => {
        try {
          timer.current && clearTimeout(timer.current)

          const tokenManager: TokenManager = authService.getTokenManager()
          await Promise.all([
            await tokenManager.renew('accessToken'),
            await tokenManager.renew('idToken'),
          ])
          setActionModal(false)
        } catch (error) {
          onError(error)
          alert('An error occurred, you will be log out.')
          await authService.logout()
        }
      },
    },
    {
      label: 'Log out',
      type: 'outline',
      action: async () => {
        await authService.logout()
      },
    },
  ]

  return (
    <>
      {ingestRunning && <Paragraph sx={{ color: 'red', mb: 4 }}>{common.ingestWarning}</Paragraph>}
      {isRunning && (
        <Paragraph sx={{ color: 'red', mb: 4 }}>
          {common.etlWarning.replace('##time', ETLTimer.end)}
        </Paragraph>
      )}
      {props.children}
      {actionModal && (
        <Modal sx={{ width: 500 }}>
          <Flex sx={{ width: '100%', justifyContent: 'center' }}>
            <Icon icon="alert" size="small" background="red" color="white" />
            <Heading center as="h4" sx={{ ml: 2, mb: 3, fontWeight: 'bold' }}>
              {'You have been inactive'}
            </Heading>
          </Flex>
          <Paragraph>Do you want to stay?</Paragraph>
          <Flex mt={4} sx={{ gap: '12px' }}>
            {buttons.map((b, index) => (
              <Button key={index} label={b.label} variant={b.type} onPress={b.action} />
            ))}
          </Flex>
        </Modal>
      )}
    </>
  )
}

export default InactiveTimer
