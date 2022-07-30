import { MantineProvider, Container, Space } from "@mantine/core"
import { InitForm } from "./InitForm"

export const App = () => {
  return (
    <MantineProvider
      withGlobalStyles
      withNormalizeCSS
      theme={{ colorScheme: "dark" }}
    >
      <Space h="md" />
      <Container>
        <InitForm />
      </Container>
    </MantineProvider>
  )
}
