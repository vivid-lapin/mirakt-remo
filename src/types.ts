declare type ContentPlayerContentType = "Mirakurun" | (string & {})

export type Service = {
  id: number
  serviceId: number
  networkId: number
  name: string
  remoteControlKeyId?: number
}

export declare type ContentPlayerPlayingContent = {
  contentType: ContentPlayerContentType
  url: string
  program?: { id: number; name: string; description: string }
  service?: Service
}

export type ContentPlayerState = {
  windowId: number
  isPlaying: boolean
  isSeekable: boolean
  playingContent: ContentPlayerPlayingContent | null
  time: number
  volume: number
}

export type InitData = {
  type: string
  version: string
  appVersion: string
  contentPlayers: ContentPlayerState[]
  services: Service[]
  activeWindowId: number
}

export type ServerInfo = {
  version: string
  appVersion: string
}
