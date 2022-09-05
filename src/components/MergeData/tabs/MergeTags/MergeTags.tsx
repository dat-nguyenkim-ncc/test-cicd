import React from 'react'
import { MappedTagData, TagData } from '../../../../types'
import { Paragraph } from '../../../primitives'
import { Box, Flex, Link } from 'theme-ui'
import { Button } from '../../..'

type MergeTagsProps = {
  label?: string
  data: MappedTagData[]
  tags: TagData[]
  onChange(data: TagData[]): void
}

const MergeTags = ({ label, data, tags = [], onChange }: MergeTagsProps) => {
  const groups = data.reduce((acc, cur) => {
    if (!acc.includes(cur.parent[0].label)) acc.push(cur.parent[0].label)
    return acc
  }, [] as string[])

  return (
    <Box sx={{ px: 60 }}>
      <Flex sx={{ alignItems: 'flex-end' }}>
        {label && (
          <Paragraph sx={{ fontSize: '20px' }} bold>
            {label}
          </Paragraph>
        )}
        {!!data.length && (
          <Link
            sx={{ cursor: 'pointer', ml: 2 }}
            onClick={() => onChange(tags.length === data.length ? [] : data)}
          >
            {tags.length === data.length ? 'Clear all' : 'Select all'}
          </Link>
        )}
      </Flex>
      {data.length ? (
        groups.map((group, index) => {
          return (
            <Box key={index} sx={{ py: 3 }}>
              <Paragraph sx={{}} bold>
                {group}
              </Paragraph>
              <Box>
                {data
                  .filter(t => t.parent.find(p => p.label === group))
                  .map(tag => {
                    const isCheck = tags.find(({ id }) => id === tag.id)
                    return (
                      <Button
                        key={tag.id}
                        sx={{
                          mt: 2,
                          mr: 2,
                          p: '8px 12px',
                          color: isCheck ? '' : 'black',
                          backgroundColor: isCheck ? '' : 'gray02',
                          fontWeight: 'normal',
                          display: 'inline-block',
                        }}
                        onPress={() => {
                          let cloneTags = [...tags]
                          if (!isCheck) {
                            cloneTags.push(tag)
                          } else cloneTags = cloneTags.filter(({ id }) => id !== tag.id)
                          onChange(cloneTags)
                        }}
                        label={tag.label}
                      ></Button>
                    )
                  })}
              </Box>
            </Box>
          )
        })
      ) : (
        <Paragraph sx={{ textAlign: 'center', p: 20 }}>NO DATA AVAILABLE</Paragraph>
      )}
    </Box>
  )
}

export default MergeTags
