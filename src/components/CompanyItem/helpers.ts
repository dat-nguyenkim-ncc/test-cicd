import { CELL_SIZE } from '../../utils/consts'

export const GRID = `
  ${CELL_SIZE} 
  [checkbox] ${CELL_SIZE} 
  ${CELL_SIZE} 
  [company] repeat(6, ${CELL_SIZE}) 
  [company-end]
  ${CELL_SIZE} 
  [url] repeat(8, ${CELL_SIZE}) 
  [url-end]
  ${CELL_SIZE} 
  [source] repeat(4, ${CELL_SIZE}) 
  [source-end]
  ${CELL_SIZE} 
  [icons] repeat(6, ${CELL_SIZE}) 
  [icons-end]
`

export const CONFIRM_CHANGE_REQUEST = ` 
[date] repeat(4, ${CELL_SIZE}) 
[date-end]
${CELL_SIZE} 
[user] repeat(5, ${CELL_SIZE}) 
[user-end]
${CELL_SIZE} 
[previous-value] repeat(6, ${CELL_SIZE}) 
[previous-value-end]
${CELL_SIZE} 
[new-value] repeat(6, ${CELL_SIZE}) 
[new-value-end]
${CELL_SIZE}
[input-source] repeat(4, ${CELL_SIZE}) 
[input-source-end]
${CELL_SIZE}
[self-declared] repeat(3, ${CELL_SIZE}) 
[self-declared-end]
${CELL_SIZE}
[reason] repeat(10, ${CELL_SIZE})
[Reason-end]`

export const OVERRIDES_GRID = `
  [date] repeat(4, ${CELL_SIZE}) 
  [date-end]
  ${CELL_SIZE} 
  [user] repeat(8, ${CELL_SIZE}) 
  [user-end]
  ${CELL_SIZE} 
  [value] repeat(6, ${CELL_SIZE}) 
  [value-end]
  ${CELL_SIZE}
  [inputSource] repeat(4, ${CELL_SIZE}) 
  [inputSource-end]
  ${CELL_SIZE} 
  [selfDeclared] repeat(3, ${CELL_SIZE}) 
  [selfDeclared-end]
  ${CELL_SIZE} 
  [reason] repeat(6, ${CELL_SIZE}) 
  [reason-end]
  ${CELL_SIZE}
`

export const CQ_GRID = `
[date] repeat(4, ${CELL_SIZE}) 
[date-end]
${CELL_SIZE} 
[user] repeat(8, ${CELL_SIZE}) 
[user-end]
${CELL_SIZE} 
[value] repeat(6, ${CELL_SIZE}) 
[value-end]
${CELL_SIZE}
[inputSource] repeat(4, ${CELL_SIZE}) 
[inputSource-end]
${CELL_SIZE} 
[selfDeclared] repeat(3, ${CELL_SIZE}) 
[selfDeclared-end]
${CELL_SIZE} 
[reason] repeat(6, ${CELL_SIZE}) 
[reason-end]
${CELL_SIZE}
[action] repeat(6, ${CELL_SIZE})
[action-end]
${CELL_SIZE}
`

export const COMPANY_GRID = `
  ${CELL_SIZE} 
  [checkbox] ${CELL_SIZE} 
  ${CELL_SIZE} 
  [company] repeat(6, ${CELL_SIZE}) 
  [company-end]
  ${CELL_SIZE} 
  [url] repeat(8, ${CELL_SIZE}) 
  [url-end]
  ${CELL_SIZE} 
  [source] repeat(3, ${CELL_SIZE}) 
  [source-end]
  ${CELL_SIZE} 
  [icons] repeat(7, ${CELL_SIZE}) 
  [icons-end]
`
