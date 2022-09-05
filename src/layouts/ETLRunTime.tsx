import { gql, useQuery } from '@apollo/client'
import React, { PropsWithChildren, useCallback, useState } from 'react'
import { Updating } from '../components'
import { ErrorModal } from '../components/ErrorModal'
import { ETLRunTimeContext } from '../context'
import { INIT_TIMER, Timer } from '../context/ETLRunTimeContext'
import strings from '../strings'

const GET_ETL_RUN_TIME = gql`
  query {
    getETLRunTime {
      etl {
        start
        end
      }
      ingestion {
        start
        end
      }
    }
  }
`

const ETLRunTime = ({ children }: PropsWithChildren<{}>) => {
  const { error } = strings

  const [ETLRunning, setETLRunning] = useState<boolean>(false)
  const [ingestRunning, setIngestRunning] = useState<boolean>(false)
  const [ETLTimer, setETLTimer] = useState<Timer>(INIT_TIMER)
  const [message, setMessage] = useState<string | undefined>()

  const { loading } = useQuery(GET_ETL_RUN_TIME, {
    onCompleted(data) {
      const { etl, ingestion } = data?.getETLRunTime || {}
      checkTime({
        start: etl.start,
        end: etl.end,
        setRunning: setETLRunning,
        isETL: true,
      })
      checkTime({
        start: ingestion.start,
        end: ingestion.end,
        setRunning: setIngestRunning,
      })
    },
  })

  // check time when the ingestion + ETLs are running
  const checkTime = useCallback(data => {
    if (!data) return
    const { start: _start, end: _end, setRunning, isETL } = data

    const start = _start?.split(':')
    const end = _end?.split(':')

    if (isETL) {
      setETLTimer({ start: _start, end: _end })
    }

    const times = {
      start: {
        hour: +start[0],
        minute: +start[1],
        second: +start[2],
      },
      end: {
        hour: +end[0],
        minute: +end[1],
        second: +end[2],
      },
    }

    const timeNow = new Date()
    const startTime = new Date(
      Date.UTC(
        timeNow.getUTCFullYear(),
        timeNow.getUTCMonth(),
        timeNow.getUTCDate(),
        times.start.hour,
        times.start.minute,
        times.start.second,
        0
      )
    )
    const endTime = new Date(
      Date.UTC(
        timeNow.getUTCFullYear(),
        timeNow.getUTCMonth(),
        timeNow.getUTCDate(),
        times.end.hour,
        times.end.minute,
        times.end.second,
        0
      )
    )
    let timeToStart = startTime.getTime() - timeNow.getTime()
    let timeToEnd = endTime.getTime() - timeNow.getTime()

    if (timeToStart > 0) {
      setRunning(false)
      setTimeout(() => {
        setRunning(true)
        checkTime(data)
      }, timeToStart)
    } else if (timeToEnd > 0) {
      setRunning(true)
      setTimeout(() => {
        setRunning(false)
        checkTime(data)
      }, timeToEnd)
    } else {
      setRunning(false)
      setTimeout(() => {
        setRunning(true)
        checkTime(data)
      }, 1000 * 60 * 60 * 24 + timeToStart) // Show warning in next day
    }
  }, [])

  return loading ? (
    <Updating loading />
  ) : (
    <ETLRunTimeContext.Provider
      value={{
        isRunning: ETLRunning,
        ingestRunning,
        ETLTimer,
        checkTimeETL: () => {
          if (ETLRunning) {
            setMessage(error.etl)
            return false
          }
          return true
        },
      }}
    >
      {children}
      {message && <ErrorModal message={message} onOK={() => setMessage(undefined)} />}
    </ETLRunTimeContext.Provider>
  )
}

export default ETLRunTime
