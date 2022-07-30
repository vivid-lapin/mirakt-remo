import { TextInput, Button, Space, Grid } from "@mantine/core"
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
        <Grid align="end">
          <Grid.Col span={9}>
            <TextInput
              required
              label="Host"
              placeholder="localhost:10171"
              size="md"
              {...form.getInputProps("host")}
            />
          </Grid.Col>
          <Grid.Col span={3}>
            <Button type="submit" size="md" fullWidth={true}>
              更新
            </Button>
          </Grid.Col>
        </Grid>
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
