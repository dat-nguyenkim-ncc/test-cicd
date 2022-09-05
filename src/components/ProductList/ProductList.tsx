import React from 'react'
import { Link } from 'theme-ui'
import { Icon, Tooltip } from '..'
import { Palette, rangeColor } from '../../theme'
import { Product } from '../../types'
import { convertURL, formatDate } from '../../utils'
import { Paragraph } from '../primitives'

const useStyle = () => ({
  tableTH: { textAlign: 'center', padding: 12, left: 0 } as React.CSSProperties,
})

type Props = {
  data: Product[]
  productClusters: string[]
}

export default function ProductList({ data, productClusters }: Props) {
  const styles = useStyle()

  const renderColor = (cluster: string) => {
    return [...productClusters]
      .sort((a, b) => a?.localeCompare(b))
      .map((item, index) => ({
        ml_cluster: item,
        color: rangeColor[index as number],
      }))
      .filter(element => element.ml_cluster === cluster)[0]?.color
  }

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
            <th style={{ ...styles.tableTH, width: '7%' }}>
              <Paragraph bold>Date</Paragraph>
            </th>
            <th style={{ ...styles.tableTH, width: '3%' }}>
              <Paragraph bold>Article</Paragraph>
            </th>
            <th style={{ ...styles.tableTH, width: '10%', maxWidth: '60%' }}>
              <Paragraph bold sx={{ marginRight: '20px' }}>
                Product names
              </Paragraph>
            </th>
            <th style={{ ...styles.tableTH, width: '20%' }}>
              <Paragraph bold sx={{ marginRight: '10px' }}>
                Title
              </Paragraph>
            </th>
            <th style={{ ...styles.tableTH, width: '35%' }}>
              <Paragraph bold sx={{ marginRight: '10px' }}>
                Summary
              </Paragraph>
            </th>
            <th style={{ ...styles.tableTH, width: '11%' }}>
              <Paragraph bold sx={{ marginRight: '10px' }}>
                Product cluster
              </Paragraph>
            </th>
          </tr>
        </thead>
        <tbody>
          {data.map((item, idx) => {
            return (
              <tr key={idx}>
                <th style={{ ...styles.tableTH, width: '7%' }}>
                  <Paragraph>{formatDate(item.date) || ''}</Paragraph>
                </th>
                <th style={{ ...styles.tableTH, width: '3%' }}>
                  <Link
                    sx={{
                      cursor: 'pointer',
                      ml: 2,
                      mt: 1,
                    }}
                    href={convertURL(item.url || '')}
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
                <th style={{ ...styles.tableTH, width: '10%' }}>
                  <Paragraph>{item.product_name || ''}</Paragraph>
                </th>
                <th style={{ ...styles.tableTH, maxWidth: '20%', textAlign: 'left' }}>
                  <TooltipContent item={item.title} />
                </th>
                <th style={{ ...styles.tableTH, maxWidth: '35%', textAlign: 'left' }}>
                  <TooltipContent item={item.summary} />
                </th>
                <th style={{ ...styles.tableTH, maxWidth: '11%' }}>
                  <Paragraph
                    sx={{
                      padding: '7px 10px',
                      textAlign: 'center',
                      borderRadius: '6px',
                      color: Palette.white,
                      backgroundColor: renderColor(item.ml_cluster),
                      textTransform: 'capitalize',
                    }}
                  >
                    {item.ml_cluster || ''}
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

type PropsTooltip = {
  item: string
  webkitLineClamp?: number
}

const TooltipContent = (props: PropsTooltip) => {
  return (
    <>
      <div style={{ width: '100%' }}>
        <Tooltip
          sx={{ ml: -3, maxWidth: 600 }}
          content={props.item}
          id={props.item}
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
              WebkitLineClamp: props.webkitLineClamp || 3,
              WebkitBoxOrient: 'vertical',
            }}
          >
            {props.item}
          </Paragraph>
        </Tooltip>
      </div>
    </>
  )
}
