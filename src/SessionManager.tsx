import { Text } from "@mantine/core"
import React, { useCallback, useEffect, useState } from "react"
import WS from "reconnecting-websocket"
import { Controller } from "./Controller"
import { ContentPlayerState, InitData, ServerInfo } from "./types"

export const SessionManager: React.FC<{ host: string }> = ({ host }) => {
  const [serverInfo, setServerInfo] = useState<ServerInfo | null>(null)
  const [players, setPlayers] = useState(new Map<string, ContentPlayerState>())
  const [ws, setWs] = useState<WS | null>(null)
  const setter = useCallback(
    (p: object) => {
      ws?.send(JSON.stringify(p))
    },
    [ws]
  )
  useEffect(() => {
    if (!host) {
      setWs(null)
      return
    }
    const ws = new WS(`ws://${host}`)
    let timer: number | null = null
    ws.onopen = () => {
      ws.send(JSON.stringify({ type: "init" }))
      timer = setInterval(() => {
        ws.send(JSON.stringify({ type: "ping" }))
      }, 10_000)
    }
    ws.onclose = () => {
      if (timer) {
        clearTimeout(timer)
        timer = null
      }
    }
    ws.onmessage = (e) => {
      try {
        const data = JSON.parse(e.data)
        switch (data.type) {
          case "init": {
            const initData = data as InitData
            setServerInfo({
              version: initData.version,
              appVersion: initData.appVersion,
            })
            setPlayers(
              new Map(
                initData.contentPlayers.map((player) => [
                  player.windowId.toString(),
                  player,
                ])
              )
            )
            break
          }
          case "stateUpdate": {
            const state = data as ContentPlayerState
            setPlayers((prev) => {
              const next = new Map(prev)
              next.set(state.windowId.toString(), state)
              return next
            })
            break
          }
          default: {
            break
          }
        }
      } catch {}
    }
    setWs(ws)
    return () => {
      ws.close()
      setWs(null)
    }
  }, [host])
  return (
    <>
      {!ws && <Text mb="md">再接続中です/接続できないホストです</Text>}
      {serverInfo ? (
        <Controller
          isConnected={!!ws}
          serverInfo={serverInfo}
          players={players}
          set={setter}
        />
      ) : (
        <></>
      )}
    </>
  )
}
