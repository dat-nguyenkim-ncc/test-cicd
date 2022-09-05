import { useMutation } from '@apollo/client'
import React from 'react'
import { useState } from 'react'
import { Box, Grid, Flex, Text } from 'theme-ui'
import { Button, Icon, Modal, Switch, Updating } from '..'
import { UPDATE_SUGGESTED_MAPPING } from '../../pages/ChangeRequestManagement/graphql'
import { ETLRunTimeContext } from '../../context'
import { ResultType } from '../../pages/ChangeRequestManagement/SuggestedMappingsManagement'
import strings from '../../strings'
import { ViewInterface } from '../../types'
import { Heading, Paragraph } from '../primitives'
import Tooltip from '../Tooltip'
import Markdown from 'markdown-to-jsx'

const GRID = `1.2fr 1fr 1.2fr 0.4fr 0.4fr 0.5fr 0.6fr 0.5fr 0.4fr`

type Props = {
  data: ResultType[]
  refetchAPI(): void
}

const Item = ({
  sx,
  data,
  index,
  refetchAPI,
}: ViewInterface<{
  data: ResultType
  index: number
  refetchAPI(): void
}>) => {
  const [modalVisible, setModalVisible] = useState<boolean>(false)
  const [message, setMessage] = useState<string | undefined>()
  const [isHover, setIsHover] = useState<number | undefined>()

  const { checkTimeETL } = React.useContext(ETLRunTimeContext)

  // GRAPHQL
  const [update, { loading, error }] = useMutation(UPDATE_SUGGESTED_MAPPING)

  const handleToggleSwitch = async () => {
    if (!checkTimeETL()) return
    try {
      setModalVisible(true)
      await update({ variables: { id: data.id } })
      setMessage('Suggested mapping updated successfully!')
    } catch (error) {
      setMessage(error.message)
    }
  }

  const onHover = (index: number) => {
    if (isHover === undefined) {
      setIsHover(index)
    }
  }

  return (
    <Box
      sx={{
        borderRadius: 10,
        ...sx,
      }}
    >
      <Box
        sx={{
          position: 'relative',
        }}
        onMouseEnter={() => onHover(index)}
        onMouseLeave={() => isHover !== undefined && setIsHover(undefined)}
        onMouseOver={() => onHover(index)}
      >
        <Grid
          gap={2}
          columns={GRID}
          sx={{
            p: 3,
            borderRadius: 10,
            alignItems: 'center',
            bg: isHover === index ? 'bgPrimary' : 'transparent',
          }}
        >
          <Box>
            <Tooltip
              sx={{ ml: -3, maxWidth: 514 }}
              content={data.companyName}
              id={`${data.companyName}-${index}`}
              isWhite
            >
              <Paragraph
                sx={{
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                {data.companyName}
              </Paragraph>
            </Tooltip>
          </Box>

          <Box>
            <Tooltip
              sx={{ ml: -3, maxWidth: 514 }}
              content={data.currentMapping}
              id={`${data.currentMapping}-${index}`}
              isWhite
            >
              <Paragraph
                sx={{
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                {data.currentMapping}
              </Paragraph>
            </Tooltip>
          </Box>

          <Box>
            <Tooltip
              sx={{ ml: -3, maxWidth: 514 }}
              content={data.suggestedMapping}
              id={`${data.suggestedMapping}-${index}`}
              isWhite
            >
              <Paragraph
                sx={{
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                {data.suggestedMapping}
              </Paragraph>
            </Tooltip>
          </Box>

          <Box>
            <Tooltip
              sx={{ ml: -3, maxWidth: 514 }}
              content={data.isPrimary}
              id={`${data.isPrimary}-${index}`}
              isWhite
            >
              <Paragraph
                sx={{
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                {data.isPrimary}
              </Paragraph>
            </Tooltip>
          </Box>

          <Box>
            <Tooltip
              sx={{ ml: -3, maxWidth: 514 }}
              content={data.inputUser}
              id={`${data.inputUser}-${index}`}
              isWhite
            >
              <Paragraph
                sx={{
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                {data.inputUser}
              </Paragraph>
            </Tooltip>
          </Box>

          <Box>
            <Tooltip
              sx={{ ml: -3, maxWidth: 514 }}
              content={data.createdDate}
              id={`${data.createdDate}-${index}`}
              isWhite
            >
              <Paragraph
                sx={{
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                {data.createdDate}
              </Paragraph>
            </Tooltip>
          </Box>

          <Box>
            <Tooltip
              sx={{ ml: -3, maxWidth: 514 }}
              content={data.reviewer}
              id={`${data.reviewer}-${index}`}
              isWhite
            >
              <Paragraph
                sx={{
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                {data.reviewer}
              </Paragraph>
            </Tooltip>
          </Box>

          <Box>
            <Tooltip
              sx={{ ml: -3, maxWidth: 514 }}
              content={data.reviewedDate}
              id={`${data.reviewedDate}-${index}`}
              isWhite
            >
              <Paragraph
                sx={{
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                {data.reviewedDate}
              </Paragraph>
            </Tooltip>
          </Box>

          <Box>
            <Switch
              sx={{ width: 'fit-content' }}
              checked={!!data.reviewed}
              disabled={!!data.reviewed || loading}
              onToggle={() => {
                handleToggleSwitch()
              }}
            />
          </Box>
        </Grid>
      </Box>
      {modalVisible && (
        <Modal sx={{ p: 6, maxHeight: '80vh', minWidth: 500 }}>
          {loading ? (
            <Updating sx={{ py: 7 }} />
          ) : (
            <>
              <Flex sx={{ width: '100%', justifyContent: 'center' }}>
                <Icon
                  icon={error ? 'alert' : 'tick'}
                  background={error ? 'red' : 'green'}
                  size="small"
                  color="white"
                />
                <Heading center as="h4" sx={{ ml: 2, mb: 3 }}>
                  {error ? 'Error' : 'Success'}
                </Heading>
              </Flex>

              <Box sx={{ mt: 3, textAlign: 'center' }}>
                <Text sx={{ fontSize: 14, lineHeight: 1.5 }}>
                  <Markdown>{message || ''}</Markdown>
                </Text>
              </Box>
              <Box mt={4}>
                <Button
                  sx={{ m: '0 auto' }}
                  label="OK"
                  onPress={() => {
                    if (!error) refetchAPI()
                    setMessage(undefined)
                    setModalVisible(false)
                  }}
                />
              </Box>
            </>
          )}
        </Modal>
      )}
    </Box>
  )
}

const SuggestedMappingList = ({ data, refetchAPI }: Props) => {
  const { suggestedMapping: copy } = strings

  return (
    <>
      <Grid
        gap={2}
        columns={GRID}
        sx={{
          alignItems: 'center',
          borderRadius: 10,
          p: 3,
        }}
      >
        <Paragraph sx={{}} bold>
          {copy.grid.name}
        </Paragraph>
        <Paragraph sx={{}} bold>
          {copy.grid.current}
        </Paragraph>
        <Paragraph sx={{}} bold>
          {copy.grid.suggested}
        </Paragraph>
        <Paragraph sx={{}} bold>
          {copy.grid.isPrimary}
        </Paragraph>
        <Paragraph sx={{}} bold>
          {copy.grid.input_user}
        </Paragraph>
        <Paragraph sx={{}} bold>
          {copy.grid.created_date}
        </Paragraph>
        <Paragraph sx={{}} bold>
          {copy.grid.reviewer}
        </Paragraph>
        <Paragraph sx={{}} bold>
          {copy.grid.reviewed_date}
        </Paragraph>
        <Paragraph sx={{}} bold>
          {copy.grid.reviewed}
        </Paragraph>
      </Grid>
      {data.map((cr, index) => {
        return (
          <Item
            sx={{ bg: index % 2 === 0 ? 'gray03' : 'transparent' }}
            key={index}
            data={cr}
            index={index}
            refetchAPI={refetchAPI}
          />
        )
      })}
    </>
  )
}

export default SuggestedMappingList
