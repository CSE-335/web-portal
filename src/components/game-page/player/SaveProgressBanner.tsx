"use client";

import { useState } from "react";
import Link from "next/link";
import { Box, Flex, Text, Button } from "@mantine/core";

export default function SaveProgressBanner() {
  const [isOpen, setIsOpen] = useState(true);

  if (!isOpen) {
    return null;
  }

  return (
    <Box p="xs" pb={0}>
      <Flex
        align="center"
        justify="center"
        gap="sm"
        direction={{ base: "column", sm: "row" }}
        px="md"
        py="sm"
        style={{
          borderRadius: "9999px",
          background: "linear-gradient(90deg, #234BFF 0%, #238BFF 100%)",
          textAlign: "center",
        }}
      >
        <Text fz="sm" fw={600}>
          Don&apos;t lose your progress
        </Text>

        <Flex align="center" gap="xs">
          <Button
            component={Link}
            href="/login"
            variant="outline"
            color="white"
            radius="xl"
            size="compact-sm"
          >
            Log in
          </Button>

          <Button
            color="white"
            c="#1F4DCC"
            radius="xl"
            size="compact-sm"
            onClick={() => setIsOpen(false)}
          >
            Close
          </Button>
        </Flex>
      </Flex>
    </Box>
  );
}
