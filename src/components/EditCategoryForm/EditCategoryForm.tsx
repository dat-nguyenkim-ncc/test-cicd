import { isEqual } from 'lodash'
import React from 'react'
import { Flex } from 'theme-ui'
import { Button, TextField } from '..'
import { Category } from '../../pages/TaxonomyManagement/graphql'
import { Palette } from '../../theme'
import { Paragraph } from '../primitives'

type EditCategoryFormProps = {
  categoryDescription: Category | undefined
  handleEditCategory?(category: Category): void
}

const EditCategoryForm = ({ categoryDescription, handleEditCategory }: EditCategoryFormProps) => {
  const [isEditting, setIsEditting] = React.useState(false)
  const [edittingCategory, setEdittingCategory] = React.useState<Category>()
  const [isLoading, setIsLoading] = React.useState(false)

  const enableEdit = !!handleEditCategory

  React.useEffect(() => {
    if (isEditting) setEdittingCategory(categoryDescription)
  }, [categoryDescription, isEditting])

  if (!categoryDescription) return null

  return (
    <>
      {!isEditting ? (
        <Paragraph
          title="Click to edit"
          onClick={() => {
            if (enableEdit) {
              setIsEditting(true)
              setEdittingCategory(categoryDescription)
            }
          }}
          sx={{
            p: 3,
            borderRadius: '10px',
            lineHeight: 1.5,
            cursor: enableEdit ? 'pointer' : 'default',
            ':hover': {
              bg: enableEdit ? Palette.gray06 : 'transparent',
              overflow: 'visible',
              display: 'block',
            },
          }}
          css={{
            display: '-webkit-box',
            overflow: 'hidden',
            WebkitLineClamp: 3,
            WebkitBoxOrient: 'vertical',
          }}
        >
          {categoryDescription?.description || ''}
        </Paragraph>
      ) : (
        <Flex
          sx={{
            gap: 2,
            alignItems: 'flex-end',
            ...(isLoading ? { opacity: 0.5, pointerEvents: 'none' } : {}),
          }}
        >
          <TextField
            type="textarea"
            name="category-desc"
            value={edittingCategory?.description}
            onChange={e => {
              if (edittingCategory)
                setEdittingCategory({ ...edittingCategory, description: e.target.value })
            }}
          />
          <Flex sx={{ flexDirection: 'column', gap: 2 }}>
            <Button
              size="small"
              color="white"
              icon="tick"
              onPress={async () => {
                if (handleEditCategory && edittingCategory) {
                  if (isEqual(categoryDescription, edittingCategory)) return

                  setIsLoading(true)
                  await handleEditCategory(edittingCategory)
                  setEdittingCategory(undefined)
                  setIsEditting(false)
                  setIsLoading(false)
                }
              }}
            />
            <Button
              size="small"
              color="white"
              sx={{ bg: 'red' }}
              icon="close"
              onPress={() => {
                if (!isLoading) {
                  setEdittingCategory(undefined)
                  setIsEditting(false)
                }
              }}
            />
          </Flex>
        </Flex>
      )}
    </>
  )
}

export default EditCategoryForm
