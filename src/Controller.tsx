import { Button, Grid, NativeSelect, Slider, Space, Text } from "@mantine/core"
import { IconPlayerPause, IconPlayerPlay } from "@tabler/icons"
import React, { useCallback, useEffect, useMemo, useState } from "react"
import { ContentPlayerState, ServerInfo, Service } from "./types"

export const Controller: React.FC<{
  isConnected: boolean
  serverInfo: ServerInfo
  players: Map<string, ContentPlayerState>
  set: (p: object) => void
  services: Service[]
}> = ({ isConnected, serverInfo, players, set, services }) => {
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
  const [volume, setVolume] = useState(selectedPlayer?.volume ?? 0)
  useEffect(() => {
    if (selectedPlayer) {
      setVolume(selectedPlayer.volume)
    }
  }, [selectedPlayer])
  const setVolumeState = useCallback(
    (value: number) =>
      set({
        type: "setState",
        windowId,
        key: "setVolume",
        value,
      }),
    [windowId, set]
  )
  const setServiceId = useCallback(
    (value: number) =>
      set({
        type: "setState",
        windowId,
        key: "setService",
        value,
      }),
    [windowId, set]
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
      <Grid my="md">
        <Grid.Col span={12}>
          <Button
            component="button"
            leftIcon={
              selectedPlayer?.isPlaying === true ? (
                <IconPlayerPause size={32} />
              ) : (
                <IconPlayerPlay size={32} />
              )
            }
            disabled={!selectedPlayer || !isConnected}
            fullWidth={true}
            size="lg"
            onClick={() =>
              set({
                type: "setState",
                windowId,
                key: selectedPlayer?.isPlaying === true ? "pause" : "play",
              })
            }
          >
            {selectedPlayer?.isPlaying === true ? "停止" : "再生"}
          </Button>
        </Grid.Col>
        <Grid.Col span={12}>
          <Text size="md" mb="md">
            音量
          </Text>
          <Slider
            size="md"
            value={volume}
            onChange={setVolume}
            onChangeEnd={setVolumeState}
          />
        </Grid.Col>
      </Grid>
      <Grid>
        {[...Array(12).keys()]
          .map((i) => i + 1)
          .map((i) => {
            const service = services.find((s) => s.remoteControlKeyId === i)
            return (
              <Grid.Col span={4} key={i}>
                <Button
                  size="lg"
                  fullWidth={true}
                  component="button"
                  disabled={!selectedPlayer || !isConnected || !service}
                  color="gray"
                  onClick={() => service && setServiceId(service.id)}
                >
                  <Text size="md">{i}</Text>
                  {service && (
                    <Text ml="sm" size="md">
                      {service.name}
                    </Text>
                  )}
                </Button>
              </Grid.Col>
            )
          })}
      </Grid>
    </>
  )
}
