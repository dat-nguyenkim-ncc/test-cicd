import moment from 'moment'
import React from 'react'
import { Link } from 'theme-ui'
import { Icon, Tooltip } from '..'
import { Palette } from '../../theme'
import { Traction } from '../../types'
import { TRACTION_DATE_FORMAT } from '../../utils/consts'
import { Paragraph } from '../primitives'

type Props = {
  data: Traction[]
}

const useStyle = () => ({
  tableTH: { textAlign: 'center', padding: 12, left: 0 } as React.CSSProperties,
})

export enum TractionTopic {
  REVENUE_EARNINGS = 'Revenue & Earnings',
  TRANSACTION_VOLUME = 'Transaction Volume',
  CUSTOMER_TRACTIONS = 'Customer Traction',
  ASSETS_UNDER_MANAGEMENT = 'Assets Under Management',
  REVENUE = 'Revenue',
}

export default function TractionsList(props: Props) {
  const styles = useStyle()
  const handleColorTopicTraction = (topic: string) => {
    switch (topic) {
      case TractionTopic.ASSETS_UNDER_MANAGEMENT:
        return Palette.redDark
      case TractionTopic.CUSTOMER_TRACTIONS:
        return Palette.yellow
      case TractionTopic.REVENUE_EARNINGS:
        return Palette.greenDark
      case TractionTopic.TRANSACTION_VOLUME:
        return Palette.blueBright
      default:
        break
    }
  }

  const tractionsList = props.data.map((item: Traction) => {
    return item.topic === TractionTopic.REVENUE
      ? { ...item, topic: TractionTopic.REVENUE_EARNINGS }
      : item
  })

  return (
    <>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr
            style={{
              backgroundColor: Palette.primary,
              color: Palette.white,
            }}
          >
            <th style={{ ...styles.tableTH, width: '11%' }}>
              <Paragraph bold>Date</Paragraph>
            </th>
            <th style={{ ...styles.tableTH, width: '4%' }}>
              <Paragraph bold>Article</Paragraph>
            </th>
            <th style={{ ...styles.tableTH, width: '60%', maxWidth: '60%' }}>
              <Paragraph bold sx={{ marginRight: '20px' }}>
                Sentence
              </Paragraph>
            </th>
            <th style={{ ...styles.tableTH, width: '25%', maxWidth: '25%' }}>
              <Paragraph bold sx={{ marginRight: '10px' }}>
                Topic
              </Paragraph>
            </th>
          </tr>
        </thead>
        <tbody>
          {tractionsList.map((item, idx) => {
            return (
              <tr key={idx}>
                <th style={{ ...styles.tableTH, width: '11%' }}>
                  <Paragraph>{moment(item.date).format(TRACTION_DATE_FORMAT) || ''}</Paragraph>
                </th>
                <th style={{ ...styles.tableTH, width: '4%' }}>
                  <Link
                    sx={{
                      cursor: 'pointer',
                      ml: 2,
                      mt: 1,
                    }}
                    href={item.url || ''}
                    target="_blank"
                  >
                    <Icon
                      icon="link"
                      color="primary"
                      sx={{
                        transform: 'translateY(-7px)',
                      }}
                    />
                  </Link>
                </th>
                <th style={{ ...styles.tableTH, maxWidth: '65%', textAlign: 'left' }}>
                  <div style={{ width: '100%' }}>
                    <Tooltip
                      sx={{ ml: -3, maxWidth: 600 }}
                      content={item.sentence}
                      id={item.sentence}
                      numberOfTextLine={3}
                    >
                      <Paragraph
                        sx={{
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                        }}
                        css={{
                          display: '-webkit-box',
                          overflow: 'hidden',
                          WebkitLineClamp: 3,
                          WebkitBoxOrient: 'vertical',
                        }}
                      >
                        {item.sentence}
                      </Paragraph>
                    </Tooltip>
                  </div>
                </th>
                <th style={{ ...styles.tableTH, maxWidth: '25%' }}>
                  <Paragraph
                    sx={{
                      padding: '7px 10px',
                      backgroundColor: handleColorTopicTraction(item.topic),
                      textAlign: 'center',
                      borderRadius: '6px',
                      color: Palette.white,
                    }}
                  >
                    {item.topic}
                  </Paragraph>
                </th>
              </tr>
            )
          })}
        </tbody>
      </table>
    </>
  )
}
