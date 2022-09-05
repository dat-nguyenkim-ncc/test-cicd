import React from 'react'
import { Flex } from 'theme-ui'
import { ViewInterface } from '../../../../types'
import { Paragraph } from '../../../primitives'

export type CompanyDetailInlineProps = ViewInterface<{
  title: string
  detail: string
}>

const CompanyDetailInline = ({ title, detail, sx }: CompanyDetailInlineProps) => {
  return (
    <Flex key={title} sx={{ pr: 2, mb: 4 }}>
      <Paragraph bold sx={{ mr: 1 }}>
        {title}
      </Paragraph>
      <div className="tooltip">
        <Paragraph
          sx={{
            maxWidth: 200,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            ...sx,
          }}
        >
          {detail}
        </Paragraph>
        {detail.length > 25 && <span className="tooltiptext">{detail}</span>}
      </div>
      <style>
        {`
          .tooltiptext {
            visibility: hidden;
            background-color: black;
            color: #fff;
            border-radius: 6px;
            padding: 5px;
          
            /* Position the tooltip */
            position: absolute;
            z-index: 1;
            margin-top: 5px;
            max-width: 30%;
            word-break: break-all;
          }
          
          .tooltip:hover .tooltiptext {
            visibility: visible;
          }`}
      </style>
    </Flex>
  )
}

export default CompanyDetailInline
