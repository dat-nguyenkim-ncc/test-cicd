import React, { useState } from 'react'
import { Box, Image, Text, Flex, Link } from '@theme-ui/components'
import CalendarSVG from '../../theme/svg/CalendarSVG'
import UserSVG from '../../theme/svg/UserSVG'
import { Switch, Tooltip } from '../../components'
import SourceSVG from '../../theme/svg/SourceSVG'
import { EnumExpandStatusId } from '../../types/enums'
import moment from 'moment'
import { NewsModel } from '../../pages/CompanyForm/NewsForm'
import Chips from '../Chips'
import { Paragraph } from '../primitives'
import NegativeSVG from '../../theme/svg/NegativeSVG'
import NeutralSVG from '../../theme/svg/NeutralSVG'
import PositiveSVG from '../../theme/svg/PositiveSVG'
import { DEFAULT_VIEW_DATE_FORMAT, SENTIMENT_LABEL } from '../../utils/consts'

type NewsItemProps = {
  valueData: NewsModel
  switchAction?(newsId: string): void
  switchDisable?: boolean
  typeShow?: TypeShow
  isEdit?: boolean
  suffixComp?: React.ReactElement
  disabled?: boolean
}

export enum TypeShow {
  TypeA = '1',
  TypeB = '2',
}

const getSentimentIcon = (value: string) => {
  switch (value) {
    case SENTIMENT_LABEL.POSITIVE: {
      return <PositiveSVG />
    }
    case SENTIMENT_LABEL.NEUTRAL: {
      return <NeutralSVG />
    }
    case SENTIMENT_LABEL.NEGATIVE: {
      return <NegativeSVG />
    }
    default:
      return null
  }
}

const NewsItem = (props: NewsItemProps) => {
  const { isEdit, valueData, switchAction, switchDisable, typeShow, disabled, ...nextProps } = props
  const {
    id,
    title,
    datePublished,
    publisher,
    author,
    imageUrl,
    url,
    source,
    fctStatusId,
    businessEvent = [],
    sentimentLabel = '',
  } = valueData

  const [isChecked, setIsChecked] = useState(fctStatusId === EnumExpandStatusId.FOLLOWING)

  const [isImgErr, setIsImgErr] = useState(imageUrl ? false : true)

  const handleToggleSwitch = () => {
    if (disabled) return
    setIsChecked(!isChecked)
    switchAction && switchAction(id)
  }

  const linkSx = url
    ? {
        cursor: 'pointer',
        textDecoration: 'none',
        ':not(:hover)': {
          color: 'black',
        },
      }
    : {
        cursor: 'default',
        textDecoration: 'none',
        color: 'black',
      }

  const sentimentIcon = getSentimentIcon(sentimentLabel)

  return (
    <Box {...nextProps} variant={disabled ? 'disabled' : ''}>
      <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
        {typeShow === TypeShow.TypeA && (
          <Box sx={{ flex: 1 }}>
            {!isImgErr && (
              <Image
                src={imageUrl}
                sx={{ height: 50, width: 50, objectFit: 'cover' }}
                onError={() => setIsImgErr(true)}
              />
            )}
            {isImgErr && <Box sx={{ height: 50, width: 50, background: 'gray' }} />}
          </Box>
        )}
        <Box sx={{ flexDirection: 'column', flex: 10 }}>
          <Tooltip sx={{ ml: -3, maxWidth: 700 }} content={title || ''} id={id}>
            <Box sx={{ mb: 4, width: '100%', display: 'flex', alignItems: 'center' }}>
              {sentimentIcon && <Box sx={{ mr: 2 }}>{sentimentIcon}</Box>}
              <Link
                href={url || undefined}
                target="_blank"
                rel="noopener noreferrer"
                mb={2}
                sx={linkSx}
              >
                <Paragraph
                  sx={{
                    fontSize: 16,
                    maxWidth: 700,
                    overflow: 'hidden',
                    whiteSpace: 'nowrap',
                    textOverflow: 'ellipsis',
                    fontWeight: 'bold',
                  }}
                >
                  {title}
                </Paragraph>
              </Link>
            </Box>
          </Tooltip>

          <Box sx={{ width: '100%', display: 'flex', flexDirection: 'row', flex: 1 }}>
            <Box sx={{ display: 'flex', flexDirection: 'row', flex: 1 }}>
              {datePublished && <CalendarSVG style={{ marginRight: 5 }} />}
              <Text sx={{ fontSize: 12 }}>
                {moment(datePublished).format(DEFAULT_VIEW_DATE_FORMAT) || ''}
              </Text>
            </Box>
            <Box sx={{ display: 'flex', flexDirection: 'row', flex: 1 }}>
              {publisher && <CalendarSVG style={{ marginRight: 5 }} />}
              <Text sx={{ fontSize: 12 }}>{publisher || ''}</Text>
            </Box>
            <Box sx={{ display: 'flex', flexDirection: 'row', flex: 1 }}>
              {author && <UserSVG style={{ marginRight: 5 }} />}
              <Text sx={{ fontSize: 12 }}>{author || ''}</Text>
            </Box>
            <Box sx={{ display: 'flex', flexDirection: 'row', flex: 1 }}>
              {source && <SourceSVG style={{ marginRight: 5 }} />}
              <Text sx={{ fontSize: 12 }}>{source || ''}</Text>
            </Box>
            {typeShow === TypeShow.TypeB && (
              <Box sx={{ display: 'flex', flexDirection: 'row', flex: 1 }}>
                {imageUrl && <SourceSVG style={{ marginRight: 5 }} />}
                <Link
                  href={url || undefined}
                  target="_blank"
                  rel="noopener noreferrer"
                  mb={4}
                  sx={linkSx}
                >
                  <Paragraph
                    sx={{
                      fontSize: 12,
                      maxWidth: 200,
                      overflow: 'hidden',
                      whiteSpace: 'nowrap',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    {title}
                  </Paragraph>
                </Link>
              </Box>
            )}
          </Box>

          {businessEvent && (
            <Flex sx={{ mt: 3, mx: -1, alignItems: 'center' }}>
              {businessEvent.map((b, index) => (
                <Chips key={index + 'businessEvent'} label={b} around />
              ))}
            </Flex>
          )}
        </Box>
        {props.suffixComp}
        {switchAction && isEdit && (
          <Box sx={{ flexDirection: 'column', flex: 1, alignSelf: 'center' }}>
            <Switch
              sx={{ m: 3 }}
              checked={isChecked}
              disabled={switchDisable}
              onToggle={() => handleToggleSwitch()}
            />
          </Box>
        )}
      </Box>
    </Box>
  )
}
export default NewsItem
