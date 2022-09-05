import React from 'react'
import { Box, Divider, Flex } from 'theme-ui'
import { ViewInterface } from '../../types'
import { MENU_TITLE, popoverZIndex } from '../../utils/consts'
import Icon from '../Icon'
import Link from '../Link'
import Popover from '../Popover'

export type MenuType = {
  title: string
  menu: JSX.Element[]
}

export type MenuProps = ViewInterface<{
  active?: string
  links: JSX.Element[]
  menus: MenuType[]
}>

const Menu = ({ active, links, menus, sx }: MenuProps) => {
  const [indexOpen, setIndexOpen] = React.useState<number>(-1)

  return (
    <Flex sx={sx} as="nav">
      {links.map((link, index) => (
        <Box
          key={link.key}
          as="span"
          sx={{
            position: 'relative',
            opacity: active === link.key ? 1 : 0.5,
            pointerEvents: active === link.key ? 'none' : 'visible',
            ml: index === 0 ? 0 : 4,
            transition: 'opacity .2s',
            '&:hover': {
              opacity: 1,
            },
          }}
        >
          {link}
          <Box
            sx={{
              position: 'absolute',
              left: 0,
              content: "''",
              width: '100%',
              height: '4px',
              backgroundColor: active === link.key ? 'black' : 'transparent',
              transition: 'backgroundColor .2s',
              borderRadius: 4,
              bottom: 0,
            }}
          />
        </Box>
      ))}
      {menus.map(({ title, menu }, idx) => {
        const menuKey = menu.map(item => item.key)
        if (!menu.length) return null
        const setOpen = (open: boolean) => {
          setIndexOpen(open ? idx : -1)
        }
        return (
          <Box
            key={idx}
            as="span"
            sx={{
              position: 'relative',
              opacity: menuKey.includes(active as React.Key) ? 1 : 0.5,
              ml: 4,
              transition: 'opacity .2s',
              cursor: 'pointer',
            }}
          >
            {title === MENU_TITLE.Analysis ? (
              <Box
                as="span"
                sx={{
                  position: 'relative',
                  opacity: 1,
                  pointerEvents: active === menu[0].key ? 'none' : 'visible',
                  ml: 0,
                  transition: 'opacity .2s',
                  '&:hover': {
                    opacity: 1,
                  },
                }}
              >
                <Link to={`/${menu[0].key}`} sx={{ '&:focus': { color: 'white' } }}>
                  {title}
                </Link>
              </Box>
            ) : (
              !!menu.length && (
                <Popover
                  open={indexOpen === idx}
                  setOpen={setOpen}
                  noArrow
                  content={
                    <Box sx={{ bg: 'primary', mt: 32, borderRadius: 10, py: 8, minWidth: 180 }}>
                      {menu.map((link, index) => (
                        <Box
                          key={link.key}
                          sx={{
                            position: 'relative',
                            opacity: active === link.key ? 1 : 0.5,
                            pointerEvents: active === link.key ? 'none' : 'visible',
                            px: 4,
                            transition: 'opacity .2s',
                            '&:hover': {
                              opacity: 1,
                            },
                          }}
                          onClick={() => setOpen(false)}
                        >
                          {link}
                          {index + 1 < menu.length && <Divider />}
                        </Box>
                      ))}
                    </Box>
                  }
                  positions={['bottom']}
                  align={'end'}
                  zIndex={popoverZIndex}
                >
                  <Flex
                    sx={{
                      color: 'white',
                      '&:hover': { opacity: 1 },
                    }}
                  >
                    <Box as="span" sx={{ fontSize: 14 }}>
                      {title}
                    </Box>
                    <Icon sx={{ ml: 1 }} color="white" icon="indicatorDown" />
                  </Flex>
                </Popover>
              )
            )}
            <Box
              sx={{
                position: 'absolute',
                left: 0,
                content: "''",
                width: '100%',
                height: '4px',
                backgroundColor: menuKey.includes(active as React.Key) ? 'black' : 'transparent',
                transition: 'backgroundColor .2s',
                borderRadius: 4,
                bottom: 0,
              }}
            />
          </Box>
        )
      })}
    </Flex>
  )
}

export default Menu
