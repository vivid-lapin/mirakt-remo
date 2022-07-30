import { Button, Grid, NativeSelect, Space, Text } from "@mantine/core"
import { IconPlayerPause, IconPlayerPlay } from "@tabler/icons"
import React, { useEffect, useMemo } from "react"
import { ContentPlayerState, ServerInfo } from "./types"

export const Controller: React.FC<{
  isConnected: boolean
  serverInfo: ServerInfo
  players: Map<string, ContentPlayerState>
  set: (p: object) => void
}> = ({ isConnected, serverInfo, players, set }) => {
  const [windowId, setWindowId] = React.useState<number>(-1)
  useEffect(() => {
    const window = players.values().next().value?.window
    if (windowId === -1 && window) {
      setWindowId(window.windowId)
    }
  }, [players])
  const selectedPlayer = useMemo(
    () => players.get(windowId.toString()),
    [players, windowId]
  )
  return (
    <>
      <Text>
        RMCN Version: {serverInfo.version} / App Version:{" "}
        {serverInfo.appVersion}
      </Text>
      <NativeSelect
        size="md"
        data={[
          { label: "未選択", value: "-1" },
          ...Array.from(players.values()).map((window) => ({
            label: `${window.windowId}: ${window.playingContent?.service?.name} - ${window.playingContent?.program?.name}`,
            value: window.windowId.toString(),
          })),
        ]}
        placeholder="Pick one"
        value={windowId}
        onChange={(event) => {
          const selectedWindowId = parseInt(event.currentTarget.value)
          if (
            Number.isNaN(selectedWindowId) ||
            !players.has(selectedWindowId.toString())
          ) {
            return
          }
          setWindowId(selectedWindowId)
        }}
        disabled={!isConnected}
      />
      <Space h="md" />
      {selectedPlayer && (
        <Grid>
          <Grid.Col span={12}>
            <Button
              component="button"
              leftIcon={
                selectedPlayer.isPlaying === true ? (
                  <IconPlayerPause size={32} />
                ) : (
                  <IconPlayerPlay size={32} />
                )
              }
              disabled={!isConnected}
              fullWidth={true}
              size="lg"
              onClick={() =>
                set({
                  type: "setState",
                  windowId,
                  key: selectedPlayer.isPlaying === true ? "pause" : "play",
                })
              }
            >
              {selectedPlayer.isPlaying === true ? "停止" : "再生"}
            </Button>
          </Grid.Col>
        </Grid>
      )}
    </>
  )
}
