import React from 'react'
import { Box, Divider, Flex } from '@theme-ui/components'
import { Button, Checkbox, Collapse, TextField } from '../../../components'
import { ECombination, KeywordFilterType, OperationValueFilterType } from './helpers'
import CollapseHeader from './CollapseHeader'
import CombinationForm from './CombinationForm'
import { FormOption } from '../../../types'
import { Text, Grid } from 'theme-ui'
import { Paragraph } from '../../../components/primitives'

type KeywordProps = {
  state: KeywordFilterType
  keywordOptions: FormOption[]
  onChange(state: KeywordFilterType): void
  isCollapseOpen?: boolean
  isShowOperations?: boolean
}

const SummaryOperation = ({
  list,
  keywords,
}: {
  list: OperationValueFilterType[]
  keywords: FormOption[]
}) => {
  const sum = React.useMemo(() => list.filter(item => !!item.value), [list])
  return !!sum.length && !!keywords.length ? (
    <Text sx={{ fontSize: 14 }}>
      <span style={{ fontWeight: 'bold' }}>{`Summary: `}</span>
      {`${sum.map((item, index) => (index + 1 < sum.length ? '(' : '')).join('')}${sum
        .map(
          (item, index) =>
            `${index > 0 ? ` ${item.combination.toUpperCase()} ` : ''}${item.isNot ? 'NOT ' : ''}${
              item.value
            }${index > 0 ? ')' : ''}`
        )
        .join('')} IN ${keywords.length > 1 ? '(' : ''}${keywords
        .map(({ label }) => label)
        .join(' OR ')}${keywords.length > 1 ? ')' : ''}`}
    </Text>
  ) : (
    <></>
  )
}

const KeywordContent = ({ state, keywordOptions, onChange, isShowOperations }: KeywordProps) => {
  return (
    <>
      <Box sx={{ my: 3, mx: 2 }}>
        <Grid gap={2} columns={[2, '1fr 1fr']}>
          {keywordOptions.map(item => {
            const checked = state.keywords.some(({ value }) => value === item.value)
            return (
              <Checkbox
                key={item.value}
                checked={checked}
                gap={2}
                onPress={() => {
                  const keywords = state.keywords.filter(({ value }) => value !== item.value)
                  if (!checked) {
                    keywords.push(item)
                  }
                  onChange({ ...state, keywords })
                }}
                size="tiny"
                label={item.label}
                square
              />
            )
          })}
        </Grid>
        {isShowOperations && (
          <>
            {state.operations.map(({ value, combination, isNot }, index) => {
              return (
                <React.Fragment key={index}>
                  <Collapse
                    sx={{ mt: 3 }}
                    header={collapseState => (
                      <Flex>
                        <CollapseHeader
                          {...collapseState}
                          label={`Operation ${index + 1}`}
                          shrink="indicatorDown"
                          expand="indicatorUp"
                          sx={{ flex: 1, bg: 'gray03', px: 3, py: 2, mr: 3, borderRadius: 10 }}
                        />
                        <Button
                          onPress={() => {
                            const operations = [...state.operations]
                            operations.splice(index, 1)
                            onChange({ ...state, operations })
                          }}
                          icon="remove"
                          size="tiny"
                          variant="invert"
                        />
                      </Flex>
                    )}
                    expanded={true}
                  >
                    <Flex sx={{ mx: 2 }}>
                      {index > 0 && (
                        <CombinationForm
                          state={combination}
                          onChange={combination => {
                            const operations = [...state.operations]
                            operations[index] = { ...operations[index], combination }
                            onChange({ ...state, operations })
                          }}
                        />
                      )}
                      <Checkbox
                        sx={{ flex: 1, mt: 3, px: 1, justifyContent: 'flex-end' }}
                        checked={!!isNot}
                        gap={2}
                        onPress={() => {
                          const operations = [...state.operations]
                          operations[index] = {
                            ...operations[index],
                            isNot: !operations[index].isNot,
                          }
                          onChange({ ...state, operations })
                        }}
                        size="tiny"
                        label="Not"
                      />
                    </Flex>
                    <Box sx={{ my: 3, mx: 2, maxHeight: 222, overflowY: 'auto' }}>
                      <TextField
                        name="test"
                        onChange={event => {
                          const operations = [...state.operations]
                          operations[index] = {
                            ...operations[index],
                            value: event.target?.value,
                          }
                          onChange({ ...state, operations })
                        }}
                        value={value}
                      />
                    </Box>
                  </Collapse>
                  <Divider opacity={0.3} my={3} />
                </React.Fragment>
              )
            })}
            <Button
              label="Add operation +"
              sx={{
                borderRadius: 10,
                color: 'primary',
                py: 2,
                px: 3,
                mx: 'auto',
                my: 3,
              }}
              variant="outline"
              onPress={() => {
                const operations = [...state.operations]
                operations.push({
                  value: '',
                  combination: !operations.length ? ECombination.AND : ECombination.OR,
                  isNot: false,
                })
                onChange({ ...state, operations })
              }}
              size="tiny"
            />
          </>
        )}

        <SummaryOperation list={state.operations} keywords={state.keywords} />
      </Box>
    </>
  )
}

const Keyword = ({
  isCollapseOpen = true,
  state,
  keywordOptions,
  onChange,
  isShowOperations = true,
}: KeywordProps) => {
  const keywordContent = (
    <KeywordContent
      state={state}
      keywordOptions={keywordOptions}
      onChange={onChange}
      isShowOperations={isShowOperations}
    />
  )
  return (
    <>
      {isCollapseOpen ? (
        <>
          <Collapse header={collapseState => <CollapseHeader {...collapseState} label="Keyword" />}>
            {keywordContent}
          </Collapse>
          <Divider opacity={0.3} my={4} />
        </>
      ) : (
        <>
          <Paragraph sx={{ pt: 4, pb: 3 }} bold>
            Keyword
          </Paragraph>
          {keywordContent}
        </>
      )}
    </>
  )
}

export default Keyword
