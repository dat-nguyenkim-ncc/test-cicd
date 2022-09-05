import React from 'react'
import { Paragraph } from '../../../primitives'
import { Grid } from 'theme-ui'
import { Checkbox, Triangle } from '../../..'
import { MappedTagData, TagData } from '../../../../types'

type TaxonomyItemProps = {
  data: MappedTagData
  checked: boolean
  disabled: boolean
  isPrimary?: boolean
  onCheck(b: boolean): void
}

const GRID = '125px 46px repeat(5, 115px 30px)'

const TaxonomyItem = ({ data, checked, disabled, isPrimary, onCheck }: TaxonomyItemProps) => {
  return (
    <Grid
      gap={0}
      columns={GRID}
      sx={{
        mt: 3,
        p: 3,
        alignItems: 'center',
        borderRadius: 10,
        border: '1px solid black',
        position: 'relative',
      }}
    >
      {((data.parent || []) as TagData[])
        .filter(({ dimensionType }) => dimensionType === data.dimensionType)
        .map(
          (p, index) =>
            data.dimensionType === p.dimensionType && (
              <React.Fragment key={index}>
                <Paragraph sx={{ color: 'gray04' }}>{p.label}</Paragraph>
                <Triangle />
              </React.Fragment>
            )
        )}
      {data.label && <Paragraph sx={{ color: 'gray04' }}>{data.label}</Paragraph>}
      <Checkbox
        checked={checked}
        onPress={() => {
          if (!disabled) onCheck(!checked)
        }}
        sx={{ p: 3, position: 'absolute', right: 0 }}
      ></Checkbox>
    </Grid>
  )
}

export default TaxonomyItem
