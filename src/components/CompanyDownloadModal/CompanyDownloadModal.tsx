import { motion } from 'framer-motion'
import React from 'react'
import { Box, Flex, Heading, Text } from 'theme-ui'
import { Modal, TextField } from '../'
import { Paragraph } from '../primitives'

type CompaniesDownloadModalProps = {
  loading: boolean
  handleAgree: (fileName: string) => void
  modalVisible: boolean
  setModalVisible: React.Dispatch<React.SetStateAction<boolean>>
  filename: string
  setFilename: React.Dispatch<React.SetStateAction<string>>
  title: string
  warning?: string
  note?: string
  validateData?: () => void
}

const Motion = motion.custom(Box)

type CircleProps = {
  index: number
}

enum Step {
  DEFAULT = 1,
  CONFIRM = 2,
}

const Circle = ({ index }: CircleProps) => (
  <Motion
    sx={{
      mx: '2px',
      height: '4px',
      width: '4px',
      borderRadius: '100%',
      backgroundColor: 'primary',
      mt: '-4px',
    }}
    animate={{
      y: '100%',
    }}
    transition={{
      delay: index * 0.5,
      easings: 'easeInOut',
      duration: 0.75,
      repeatType: 'reverse',
      repeat: Infinity,
    }}
  />
)

const CompaniesDownloadModal = ({
  loading,
  handleAgree,
  modalVisible,
  setModalVisible,
  filename,
  setFilename,
  note,
  title,
  warning,
  validateData,
}: CompaniesDownloadModalProps) => {
  const [step, setStep] = React.useState(validateData ? Step.DEFAULT : Step.CONFIRM)

  return (
    <>
      {modalVisible && (
        <Modal
          sx={{ p: 4, maxWidth: '50vw', alignItems: 'center', minWidth: '500px' }}
          buttons={[
            {
              label: 'Cancel',
              type: 'outline',
              action: () => {
                setModalVisible(false)
              },
              sx: { p: '10px 60px' },
              visible: !loading,
            },
            step === Step.CONFIRM
              ? {
                  label: 'Download',
                  type: 'primary',
                  action: () => {
                    handleAgree(filename)
                  },
                  sx: { p: '10px 60px' },
                  visible: !loading,
                  disabled: filename.length === 0,
                }
              : {
                  label: 'Next',
                  type: 'primary',
                  action: () => {
                    validateData && validateData()
                    setStep(Step.CONFIRM)
                  },
                  sx: { p: '10px 60px' },
                  visible: !loading,
                  disabled: filename.length === 0,
                },
          ]}
          buttonsStyle={{ width: '100%', justifyContent: 'center' }}
        >
          {!loading ? (
            <>
              <Heading sx={{ fontWeight: 600, mb: 4 }} as={'h4'}>
                {title}
              </Heading>
              <TextField
                onChange={(e: any) => {
                  setFilename(e.currentTarget.value)
                }}
                value={filename}
                name="filename"
                size="small"
                placeholder="Enter filename"
              />
              {!!note && (
                <Text as="p" sx={{ fontWeight: 'bold', ml: 1, width: 280, marginTop: 10 }}>
                  {`Note: `}
                  <span style={{ fontWeight: 400 }}>{note}</span>
                </Text>
              )}
              {!!warning && (
                <Text as="p" sx={{ fontWeight: 'bold', ml: 1, width: 280, marginTop: 10 }}>
                  {`Information: `}
                  <span style={{ fontWeight: 400 }}>{warning}</span>
                </Text>
              )}
            </>
          ) : (
            <Flex
              sx={{ alignItems: 'center', justifyContent: 'center', width: '100%', py: 7, px: 125 }}
            >
              <Circle index={0} />
              <Circle index={1} />
              <Circle index={2} />
              <Paragraph bold sx={{ ml: 1, color: 'primary' }}>
                Loading
              </Paragraph>
            </Flex>
          )}
        </Modal>
      )}
    </>
  )
}

export default CompaniesDownloadModal
