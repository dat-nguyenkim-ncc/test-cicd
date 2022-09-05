import moment from 'moment'
import { INVALID_DATE } from './consts'

export default (date: string, format: string = 'DD-MM-YYYY') => {
  const formatted = moment(date).format(format)
  return formatted !== INVALID_DATE ? formatted : ''
}
