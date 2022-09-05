import { Flex, Input } from '@theme-ui/components'
import React, { MouseEvent, useEffect, useState } from 'react'
import { Button, Checkbox, Triangle } from '..'
import { ViewInterface } from '../../types'
import { Paragraph } from '../primitives'
import { PaletteKeys } from '../../theme'
import { Paths } from '../Icon'

export interface IconButtons extends ViewInterface<any> {
  icon: Paths
  action(e: MouseEvent): void
  label?: string
  color?: PaletteKeys
}

export type Props = ViewInterface<{
  checked?: boolean
  selected?: boolean
  onCheck?(e: MouseEvent): void
  onSelect(e: MouseEvent): void
  onEdit(e: MouseEvent): void
  onMove?(e: MouseEvent): void
  onCancel(): void
  onSave(value: string): void
  onDelete(e: MouseEvent): void
  onClick?(e: MouseEvent): void
  value: string
  background?: PaletteKeys
  isTriangle?: boolean
  isBold?: boolean
  isEditing?: boolean
  buttons?: IconButtons[]
  hideDefaultButtons?: boolean
  prefix?: React.ReactElement
  suffix?: React.ReactElement
}>
const EditInline = ({
  checked,
  selected = false,
  onCheck,
  onSelect,
  onEdit,
  onCancel,
  onSave,
  onMove,
  onDelete,
  onClick,
  value,
  background,
  isTriangle,
  isBold,
  isEditing,
  buttons,
  hideDefaultButtons = false,
  sx,
  prefix,
  suffix,
}: Props) => {
  const [isHover, setIsHover] = useState<boolean>(false)
  const [newValue, setNewValue] = useState<string>(value)

  useEffect(() => {
    setNewValue(value)
  }, [isEditing, setNewValue, value])

  return (
    <Flex
      onClick={e => {
        onClick && onClick(e)
      }}
      onMouseEnter={() => setIsHover(true)}
      onMouseLeave={() => setIsHover(false)}
      onMouseOver={() => setIsHover(true)}
      sx={{
        height: `50px`,
        cursor: 'pointer',
        alignItems: 'center',
        bg: isHover ? 'bgGray' : '',
        ...sx,
      }}
    >
      {onCheck && <Checkbox checked={checked} onPress={onCheck} square size="small" />}
      {isEditing ? (
        <Flex sx={{ width: '100%', border: 'solid 1px', borderColor: 'gray06', borderRadius: 5 }}>
          {prefix}
          <Input
            sx={{ px: 3 }}
            name="tag"
            placeholder="Tag name"
            backgroundColor="transparent"
            value={newValue}
            onChange={e => {
              setNewValue(e.target.value)
            }}
          />
          <Button
            sx={{ p: 0, mr: 3, color: 'primary', fontWeight: 'normal' }}
            label="Save"
            variant="invert"
            disabled={
              !newValue?.length || newValue.trim().toUpperCase() === value.trim().toUpperCase()
            }
            onPress={() => {
              onSave(newValue)
            }}
          ></Button>
          <Button
            sx={{ p: 0, mr: 2, color: 'primary', fontWeight: 'normal' }}
            icon="remove"
            size="tiny"
            color="gray04"
            variant="invert"
            onPress={() => {
              setNewValue(value)
              onCancel()
            }}
          ></Button>
        </Flex>
      ) : (
        <Flex
          sx={{
            height: '100%',
            width: '100%',
            px: 3,
            borderRadius: 5,
            alignItems: 'center',
            bg: background,
          }}
        >
          {prefix}
          <Flex onClick={(e: MouseEvent) => onSelect(e)} sx={{ flex: 1, gap: 8 }}>
            <Paragraph
              sx={{
                color: selected ? 'primary' : 'text',
              }}
              bold={isBold}
            >
              {value}
            </Paragraph>
            {suffix}
          </Flex>
          {isHover && (
            <Flex sx={{ height: '40px' }}>
              <>
                {buttons?.map((b, index) => (
                  <Button
                    key={index}
                    sx={{ ml: 2, color: b.color || 'primary', ...b.sx }}
                    onPress={(e: MouseEvent) => b.action(e)}
                    icon={b.icon}
                    size="tiny"
                    color={b.color || 'primary'}
                    variant={b.variant || 'invert'}
                  ></Button>
                ))}
              </>
              {!hideDefaultButtons && (
                <>
                  {onMove && (
                    <Button
                      sx={{ ml: 2 }}
                      onPress={(e: MouseEvent) => onMove(e)}
                      icon="expandArrow"
                      size="tiny"
                      color="primary"
                      variant="invert"
                    ></Button>
                  )}
                  <Button
                    sx={{ ml: 2 }}
                    onPress={(e: MouseEvent) => onEdit(e)}
                    icon="pencil"
                    size="tiny"
                    color="primary"
                    variant="invert"
                  ></Button>
                  <Button
                    sx={{ ml: 2, color: 'red' }}
                    onPress={(e: MouseEvent) => onDelete(e)}
                    icon="trash"
                    size="tiny"
                    color="red"
                    variant="invert"
                  ></Button>
                </>
              )}
            </Flex>
          )}
          {isTriangle && (
            <Flex
              onClick={(e: MouseEvent) => onSelect(e)}
              sx={{ justifyContent: 'flex-end', pl: 3 }}
            >
              <Triangle color={selected ? 'primary' : 'text'} />
            </Flex>
          )}
        </Flex>
      )}
    </Flex>
  )
}

export default EditInline
