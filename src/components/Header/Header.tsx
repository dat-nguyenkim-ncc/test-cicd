import React from 'react'
import { Box, Flex } from 'theme-ui'
import { Menu, UserIcon } from '../'
import { Grid } from '../primitives'
// import logo from '../../theme/logo.png'
import { MenuType } from '../Menu/Menu'
import FctLogo from '../../theme/svg/FctLogo'

export type HeaderProps = {
  links: JSX.Element[]
  menus: MenuType[]
  onClickLogout(): void
  active: string
  onClickHeader(): void
}

const Header = ({ onClickHeader, active, links, menus, onClickLogout }: HeaderProps) => {
  return (
    <Grid wrapper={false} sx={{ minHeight: 76, backgroundColor: 'primary' }}>
      <Flex sx={{ justifyContent: 'space-between', alignItems: 'center', gridColumn: '3 / -3' }}>
        <Box my={'auto'} sx={{ cursor: 'pointer' }} onClick={onClickHeader}>
          {/* <img style={{ maxWidth: 300 }} src={logo} alt="fct-logo" /> */}
          <FctLogo style={{ transform: 'scale(1.2)' }} />
        </Box>
        <Flex sx={{ alignItems: 'center' }}>
          {(links || menus) && (
            <Menu active={active} sx={{ pt: 5, mr: 6 }} links={links} menus={menus} />
          )}
          <UserIcon onClickLogout={onClickLogout} />
        </Flex>
      </Flex>
    </Grid>
  )
}

export default Header
