import React from 'react'

type IContext = {
  isRunning: boolean
  ingestRunning: boolean
  ETLTimer: Timer
  checkTimeETL(): boolean
}

export type Timer = {
  start: string,
  end: string
}

export const INIT_TIMER = {
  start: '',
  end: '',
}

export const ETLRunTimeContext = React.createContext<IContext>({
  isRunning: false,
  ingestRunning: false,
  ETLTimer: INIT_TIMER,
  checkTimeETL: () => {
    return true
  },
})
export default ETLRunTimeContext
