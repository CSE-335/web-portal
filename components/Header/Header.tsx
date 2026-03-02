import { Group } from "@mantine/core"
import Navbar from "./Navbar"
import UtilityNav from "./UtilityNav"

export default function Header() {
  return (
    <Group justify="space-between">
      <p>Cool STEM games</p>
      <Navbar />
      <UtilityNav />
    </Group>
  )
}
