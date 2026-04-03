"use client";

import { useState, useEffect } from "react";
import { useTranslations } from 'next-intl';
import { Flex, Text, Button } from "@mantine/core";
import { supabase } from "@/lib/supabase/client";
import LoginPopup from "@/components/LoginPopup";

export default function SaveProgressBanner() {
  const [isOpen, setIsOpen] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(true);
  const [closing, setClosing] = useState(false);
  const [loginOpened, setLoginOpened] = useState(false);
  const t = useTranslations('saveBanner');

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setIsLoggedIn(!!data.user);
    });
  }, []);

  function handleClose() {
    setClosing(true);
    setTimeout(() => setIsOpen(false), 400);
  }

  if (!isOpen || isLoggedIn) return null;

  return (
    <>
      <Flex
        align="center"
        justify="center"
        gap="sm"
        direction={{ base: "column", sm: "row" }}
        px="md"
        py="sm"
        style={{
          position: "absolute",
          top: 12,
          left: "50%",
          transform: "translateX(-50%)",
          zIndex: 10,
          borderRadius: "9999px",
          background: "linear-gradient(90deg, #234BFF 0%, #238BFF 100%)",
          boxShadow: "0 4px 20px rgba(27, 65, 255, 0.4)",
          textAlign: "center",
          width: "calc(100% - 24px)",
          maxWidth: 640,
          whiteSpace: "nowrap",
          animation: closing
            ? "bannerSlideOut 0.4s ease forwards"
            : "bannerSlideIn 0.4s ease forwards",
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
            className="banner-login-btn"
            onClick={() => setLoginOpened(true)}
          >
            {t('logIn')}
          </Button>

          <Button
            color="white"
            c="#1F4DCC"
            radius="xl"
            size="compact-sm"
            className="banner-close-btn"
            onClick={handleClose}
          >
            {t('close')}
          </Button>
        </Flex>
      </Flex>

      <LoginPopup
        opened={loginOpened}
        onClose={() => setLoginOpened(false)}
      />
    </>
  );
}
