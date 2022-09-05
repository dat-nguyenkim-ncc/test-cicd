import React from 'react'
import { Box, Card, Flex } from 'theme-ui'
import { ButtonText } from '..'
import strings from '../../strings'
import { MappingSummary, MappingSummaryItem, ViewInterface } from '../../types'
import { EnumCompanySource, EnumTagGroupSource } from '../../types/enums'
import Icon from '../Icon'
import Pill from '../Pill'
import { mapIcon } from '../Pill/Pill'
import { Paragraph } from '../primitives'
import Updating from '../Updating'

export type SideSummaryProps = ViewInterface<{
  content: MappingSummary[]
  loading?: boolean
}>

export type ShowItemsProps = ViewInterface<{
  listItems: MappingSummaryItem[]
  index: number
  quantityShow?: number
}>

const ShowItems = ({ listItems, index, quantityShow = 10 }: ShowItemsProps) => {
  const [isCollapse, setCollapse] = React.useState<boolean>(true)
  const list = isCollapse ? listItems.slice(0, quantityShow) : listItems
  return (
    <>
      {list.map((i, cindex) => {
        const isPrimaryItem = i.isPrimary
        return (
          <Box
            key={cindex}
            sx={{
              mb: cindex < listItems.length - 1 ? 3 : 0,
              color: isPrimaryItem ? 'primary' : '',
            }}
          >
            {(i.parent || []).map((p, pindex) => (
              <React.Fragment key={pindex}>
                <Paragraph sx={{ pb: 1 }}>{p}</Paragraph>
                <Box sx={{ ml: '-4px' }}>
                  <Icon
                    icon="indicatorDown"
                    sx={{ justifyContent: 'start' }}
                    color={isPrimaryItem ? 'primary' : undefined}
                  />
                </Box>
              </React.Fragment>
            ))}
            <Paragraph>{i.label}</Paragraph>
            {index < list.length - 1 && (i.parent || []).length > 0 && (
              <Box sx={{ height: '6px' }} />
            )}
          </Box>
        )
      })}
      {listItems.length > quantityShow && (
        <Flex>
          <ButtonText
            sx={{ mt: isCollapse ? 0 : 3 }}
            onPress={() => {
              setCollapse(!isCollapse)
            }}
            label={isCollapse ? 'Show more' : 'Less'}
            icon={!isCollapse ? 'indicatorUp' : 'indicatorDown'}
            color="primary"
          />
        </Flex>
      )}
    </>
  )
}

const SideSummary = ({ content, loading, sx }: SideSummaryProps) => (
  <Box sx={sx}>
    {loading ? (
      <Card sx={{ mb: 4, minWidth: 210 }}>
        <Updating loading noPadding />
      </Card>
    ) : (
      content.map((c, index) => {
        const nextTypeIsSame = c.type && c.type === content[index + 1]?.type
        const prevTypeIsSame = c.type && c.type === content[index - 1]?.type
        const { tagsConstantTexts } = strings

        const internalTags =
          c.title === tagsConstantTexts.TAGS
            ? c.items.filter(item => item.source === EnumCompanySource.BCG)
            : []
        const externalTasg =
          c.title === tagsConstantTexts.TAGS
            ? c.items.filter(
                item =>
                  item.source !== EnumCompanySource.BCG &&
                  item.source !== EnumTagGroupSource.SWITCHPITCH
              )
            : []
        const websiteKeywords =
          c.title === tagsConstantTexts.TAGS
            ? c.items.filter(item => item.source === EnumTagGroupSource.SWITCHPITCH)
            : []

        if (!c?.items?.length)
          return <Pill key={index} sx={{ mb: 4, ml: 'auto', maxWidth: 40 }} icon={c.type} />

        return (
          <Card
            key={index}
            sx={{
              minWidth: 210,
              mb: nextTypeIsSame ? 0 : 4,
              pb: nextTypeIsSame ? 0 : 'auto',
              borderTopRightRadius: prevTypeIsSame ? 0 : 'auto',
              borderTopLeftRadius: prevTypeIsSame ? 0 : 'auto',
              borderBottomRightRadius: nextTypeIsSame ? 0 : 'auto',
              borderBottomLeftRadius: nextTypeIsSame ? 0 : 'auto',
            }}
          >
            <Flex sx={{ pb: 3, justifyContent: 'space-between', alignItems: 'center' }}>
              {c.title && (
                <Paragraph bold sx={{ textTransform: 'uppercase' }}>
                  {c.title}
                </Paragraph>
              )}
              {c.type && mapIcon[c.type] && !prevTypeIsSame && <Pill icon={c.type} />}
            </Flex>

            {/* edit on task 305 */}
            {c.title !== tagsConstantTexts.TAGS && <ShowItems listItems={c.items} index={index} />}

            {internalTags.length > 0 && (
              <Paragraph bold sx={{ my: 3 }}>
                {tagsConstantTexts.INTERNAL_TAGS}
              </Paragraph>
            )}
            {<ShowItems listItems={internalTags} index={index} />}

            {internalTags.length > 0 && externalTasg.length > 0 && <Box sx={{ height: '12px' }} />}

            {externalTasg.length > 0 && (
              <Paragraph bold sx={{ my: 3 }}>
                {tagsConstantTexts.EXTERNAL_TAGS}
              </Paragraph>
            )}
            {<ShowItems listItems={externalTasg} index={index} />}

            {(internalTags.length > 0 || externalTasg.length > 0) && websiteKeywords.length > 0 && (
              <Box sx={{ height: '12px' }} />
            )}

            {websiteKeywords.length > 0 && (
              <Paragraph bold sx={{ my: 3 }}>
                {tagsConstantTexts.WEBSITE_KEYWORDS}
              </Paragraph>
            )}
            {<ShowItems listItems={websiteKeywords} index={index} />}
          </Card>
        )
      })
    )}
  </Box>
)

export default SideSummary
