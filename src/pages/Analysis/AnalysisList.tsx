import React from 'react'
import { Palette } from '../../theme'
import { Paragraph } from '../../components/primitives'
import { AnalysisProps } from './helpers'
import { Tooltip } from '../../components'

type Props = {
  data: AnalysisProps[]
}

const useStyle = () => ({
  tableTH: { textAlign: 'center', padding: 12, left: 0 } as React.CSSProperties,
})

const styles = useStyle()

const AnalysisList = (props: Props) => {
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
            <th style={{ ...styles.tableTH, width: '35%', textAlign: 'left' }}>
              <Paragraph bold sx={{ ml: 10 }}>
                Keyword
              </Paragraph>
            </th>
            <th style={{ ...styles.tableTH, width: '30%' }}>
              <Paragraph bold>Number of occurrences*</Paragraph>
            </th>
            <th style={{ ...styles.tableTH, width: '30%' }}>
              <Paragraph bold>Uniqueness*</Paragraph>
            </th>
          </tr>
        </thead>
        <tbody>
          {props.data.map((item, idx) => {
            return (
              <tr
                key={idx}
                style={{
                  backgroundColor: idx % 2 === 0 ? Palette.gray03 : Palette.white,
                }}
              >
                <th style={{ ...styles.tableTH, maxWidth: '35%', textAlign: 'left' }}>
                  <div style={{ width: '100%' }}>
                    <Tooltip
                      sx={{ ml: -3, maxWidth: 600 }}
                      content={item.keyword}
                      id={item.keyword}
                      numberOfTextLine={3}
                    >
                      <Paragraph
                        sx={{
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          ml: 10,
                          textTransform: 'capitalize',
                        }}
                        css={{
                          display: '-webkit-box',
                          overflow: 'hidden',
                          WebkitLineClamp: 3,
                          WebkitBoxOrient: 'vertical',
                        }}
                      >
                        {item.keyword || ''}
                      </Paragraph>
                    </Tooltip>
                  </div>
                </th>
                <th style={{ ...styles.tableTH, width: '%' }}>
                  <Paragraph>{item.number_of_occurrences || ''}</Paragraph>
                </th>
                <th style={{ ...styles.tableTH, maxWidth: '30%' }}>
                  <Paragraph
                    sx={{
                      padding: '7px 10px',
                      textAlign: 'center',
                      borderRadius: '6px',
                    }}
                  >
                    {`${item.uniqueness}%` || ''}
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

export default AnalysisList
