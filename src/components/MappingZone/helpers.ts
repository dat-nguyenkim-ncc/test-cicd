import { CELL_SIZE } from '../../utils/consts'

export const MAPPING_GRID = `
  [company] repeat(8, ${CELL_SIZE}) 
  [company-end]
  ${CELL_SIZE} 
  [url] repeat(7, ${CELL_SIZE}) 
  [url-end]
  ${CELL_SIZE} 
  [amount] repeat(6, ${CELL_SIZE}) 
  [amount-end]
  ${CELL_SIZE} 
  [source] repeat(4, ${CELL_SIZE}) 
  [source-end]
  ${CELL_SIZE} 
  [button] repeat(3, ${CELL_SIZE}) 
  [button-end]
`
