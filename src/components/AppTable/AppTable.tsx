import React from 'react'
import { Grid, GridProps } from '@theme-ui/components'

type Props<T> = {
  grid: any
  columns: { render(item: T, idx?: number): React.ReactElement }[]
  data: T[]
  headers: { render(item?: T): React.ReactElement }[]
  gap?: string | number
  rowProps?(item: T, idx: number): Partial<Omit<GridProps, 'ref'>>
}

export type { Props as AppTableProps }

export function AppTable<T>({
  grid,
  columns,
  data,
  headers,
  gap = '1px',
  rowProps = () => ({}),
}: Props<T>) {
  return (
    <>
      {!!headers.length && (
        <Grid gap={gap} columns={grid} sx={{ alignItems: 'center', py: 2 }}>
          {headers.map((h, idx) => (
            <React.Fragment key={idx}>{h.render()}</React.Fragment>
          ))}
        </Grid>
      )}
      {data.map((d, idx) => (
        <Grid
          key={idx}
          gap={gap}
          columns={grid}
          {...rowProps(d, idx)}
          sx={{ alignItems: 'center', py: 2, ...rowProps(d, idx).sx }}
        >
          {columns.map((c, idx1) => (
            <React.Fragment key={idx1}>{c.render(d, idx1)}</React.Fragment>
          ))}
        </Grid>
      ))}
    </>
  )
}
