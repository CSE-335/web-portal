import { Group } from "@mantine/core"
import Navbar from "./Navbar/Navbar"
import UtilityNav from "./UtilityNav/UtilityNav"

export default function Header() {
  return (
    <Group justify="space-between">
      <p>Cool STEM games</p>
      <Navbar />
      <UtilityNav />
    </Group>
  )
}
