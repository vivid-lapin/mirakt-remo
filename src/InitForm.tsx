import { TextInput, Group, Button, Space } from "@mantine/core"
import { useForm } from "@mantine/form"
import { useLocalStorage } from "@mantine/hooks"
import React from "react"
import { SessionManager } from "./SessionManager"

const RMCN_HOST = "RMCN_HOST"

export const InitForm: React.FC<{}> = () => {
  const [host, setHost] = useLocalStorage({
    key: RMCN_HOST,
    defaultValue: "",
  })

  const form = useForm({
    initialValues: {
      host,
    },

    validate: {},
  })

  return (
    <>
      <form
        onSubmit={form.onSubmit((values) => {
          setHost(values.host)
        })}
      >
        <TextInput
          required
          label="Host"
          placeholder="localhost:10171"
          size="md"
          {...form.getInputProps("host")}
        />

        <Group position="right" mt="md">
          <Button type="submit">Set</Button>
        </Group>
      </form>
      {host && (
        <>
          <Space h="md" />
          <SessionManager host={host} />
        </>
      )}
    </>
  )
}
