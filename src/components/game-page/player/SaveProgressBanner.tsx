"use client";

import { useState, useEffect } from "react";
import { useTranslations } from 'next-intl';
import { Box, Flex, Text, Button } from "@mantine/core";
import { supabase } from "@/lib/supabase/client";
import SignupPopup from "@/components/SignupPopup";

export default function SaveProgressBanner() {
  const [isOpen, setIsOpen] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(true);
  const [signupOpened, setSignupOpened] = useState(false);
  const t = useTranslations('saveBanner');

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setIsLoggedIn(!!data.user);
    });
  }, []);

  if (!isOpen || isLoggedIn) {
    return null;
  }

  return (
    <>
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
          <Text fz="sm" fw={600} c="white">
            {t('dontLose')}
          </Text>

          <Flex align="center" gap="xs">
            <Button
              variant="outline"
              color="white"
              radius="xl"
              size="compact-sm"
              onClick={() => setSignupOpened(true)}
            >
              {t('signUp')}
            </Button>

            <Button
              color="white"
              c="#1F4DCC"
              radius="xl"
              size="compact-sm"
              onClick={() => setIsOpen(false)}
            >
              {t('close')}
            </Button>
          </Flex>
        </Flex>
      </Box>

      <SignupPopup
        opened={signupOpened}
        onClose={() => setSignupOpened(false)}
      />
    </>
  );
}
