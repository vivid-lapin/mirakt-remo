import { Button, Grid, Group, NativeSelect, Slider, Text } from "@mantine/core"
import {
  IconCamera,
  IconPlayerPause,
  IconPlayerPlay,
  IconPlayerSkipBack,
  IconPlayerSkipForward,
} from "@tabler/icons"
import React, { useCallback, useEffect, useMemo, useState } from "react"
import { ContentPlayerState, ServerInfo, Service } from "./types"
import { useRefFromState } from "./utils"

export const Controller: React.FC<{
  isConnected: boolean
  serverInfo: ServerInfo
  players: Map<string, ContentPlayerState>
  set: (p: object) => void
  services: Service[]
}> = ({ isConnected, serverInfo, players, set, services }) => {
  const [windowId, setWindowId] = React.useState<number | undefined>(undefined)
  const windowIdRef = useRefFromState(windowId)
  useEffect(() => {
    const window = players.values().next().value?.window
    if (windowId === undefined && window) {
      setWindowId(window.windowId)
    }
  }, [players])
  const selectedPlayer = useMemo(
    () => (windowId ? players.get(windowId.toString()) : undefined),
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
        windowId: windowIdRef.current,
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
  const setRelativeMove = useCallback(
    (value: number) =>
      set({
        type: "setState",
        windowId,
        key: "setRelatieMove",
        value,
      }),
    [windowId, set]
  )
  return (
    <>
      <NativeSelect
        size="md"
        data={Array.from(players.values()).map((window) => ({
          label: `${window.windowId}: ${window.playingContent?.service?.name} - ${window.playingContent?.program?.name}`,
          value: window.windowId.toString(),
        }))}
        placeholder="プレイヤー選択"
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
      <Group grow mt="lg">
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
        <Button
          component="button"
          leftIcon={<IconCamera />}
          disabled={!selectedPlayer || !isConnected}
          fullWidth={true}
          size="lg"
          onClick={() =>
            set({
              type: "setState",
              windowId,
              key: "takeScreenshot",
            })
          }
        >
          SSを撮る
        </Button>
      </Group>
      {selectedPlayer?.isSeekable && (
        <Group my="md" grow>
          {[-60, -30, -10, 30, 60].map((value) => (
            <Button
              key={value}
              component="button"
              onClick={() => setRelativeMove(value * 1000)}
              fullWidth
              disabled={!selectedPlayer || !isConnected}
              leftIcon={
                0 < value ? undefined : <IconPlayerSkipBack size={24} />
              }
              rightIcon={
                0 < value ? <IconPlayerSkipForward size={24} /> : undefined
              }
              size="md"
            >
              {0 < value ? `+${value}` : value}s
            </Button>
          ))}
        </Group>
      )}
      <Slider
        size="md"
        value={volume}
        onChange={setVolume}
        onChangeEnd={setVolumeState}
        my="xl"
        max={200}
      />
      <Grid>
        {[...Array(12).keys()]
          .map((i) => i + 1)
          .map((i) => {
            const service = services.find((s) => s.remoteControlKeyId === i)
            return (
              <Grid.Col span={4} key={i}>
                <Button
                  size="lg"
                  fullWidth
                  compact
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
      <NativeSelect
        my="lg"
        size="lg"
        data={services.map((service) => ({
          label: service.name,
          value: service.id.toString(),
          group: service.channel.type,
        }))}
        disabled={!selectedPlayer || !isConnected}
        value={selectedPlayer?.playingContent?.service?.id.toString()}
        onChange={(event) => {
          const selectedServiceId = parseInt(event.currentTarget.value)
          if (
            Number.isNaN(selectedServiceId) ||
            !services.find((s) => s.id === selectedServiceId)
          ) {
            return
          }
          setServiceId(selectedServiceId)
        }}
      ></NativeSelect>
      <Text mt="md" align="center">
        {`miraktest-rmcn version: ${serverInfo.version} / host version: ${serverInfo.appVersion}`}
      </Text>
    </>
  )
}
