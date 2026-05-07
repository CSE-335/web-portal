import type { ReactNode } from 'react';
import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { Paper, Stack, Text, Title } from '@mantine/core';
import { getTranslations } from 'next-intl/server';
import {
  AutoplayIcon,
  CloseIcon,
  ExplainIcon,
  HintIcon,
  HistoryIcon,
  MicIcon,
  SendIcon,
  SummarizeIcon,
  VolumeIcon,
  VolumeOffIcon,
} from '@/features/assistant/components/icons';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('tutorial');
  return {
    title: t('metaTitle'),
    description: t('metaDescription'),
  };
}

export default async function TutorialPage() {
  const t = await getTranslations('tutorial');
  const tCommon = await getTranslations('common');

  return (
    <main className="tutorial-page mx-auto w-full max-w-3xl">
      <Stack
        style={{
          gap: 'clamp(0.875rem, 1.8vw, 1.25rem)',
          paddingBottom: 'clamp(1.25rem, 3vw, 2rem)',
        }}
      >
        <div>
          <Title
            order={1}
            fz={{ base: '1.65rem', sm: '2rem' }}
            style={{ color: 'var(--text-primary)', lineHeight: 1.25 }}
          >
            {t('pageTitle')}
          </Title>
          <Text mt="sm" style={{ color: 'var(--text-body)', lineHeight: 1.55 }} className="break-words">
            {t('intro')}
          </Text>
          <Text mt="xs" size="sm" c="dimmed">
            <Link
              href="/"
              style={{ color: 'var(--link-color)' }}
              className="inline-flex min-h-10 items-center underline-offset-[3px] [touch-action:manipulation] hover:underline"
            >
              {t('backToHome')}
            </Link>
          </Text>
        </div>

        <Paper
          component="section"
          id="site-overview"
          p={{ base: 'md', sm: 'lg' }}
          radius="md"
          aria-labelledby="site-overview-heading"
          style={{
            background: 'var(--surface-primary)',
            border: '1px solid var(--card-border)',
          }}
        >
          <SectionTitle id="site-overview-heading">{t('siteOverviewTitle')}</SectionTitle>

          <BulletWithIcon icon={<TutorialThemeIcons />}>
            <strong>{t('themeLabel')}</strong> — {t('themeDesc')}
          </BulletWithIcon>
          <BulletWithIcon icon={<ImgIcon src="/images/language.svg" alt="" />}>
            <strong>{t('languageLabel')}</strong> — {t('languageDesc')}
          </BulletWithIcon>
          <BulletWithIcon icon={<ImgIcon src="/images/like.svg" alt="" />}>
            <strong>{t('heartLabel')}</strong> — {t('heartDesc')}
          </BulletWithIcon>
          <BulletWithIcon icon={<ProfileSilhouette />}>
            <strong>{t('profileLabel')}</strong> — {t('profileDesc')}
          </BulletWithIcon>

          <Text
            mt="sm"
            size="sm"
            c="dimmed"
            className="break-words"
            style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem', alignItems: 'center', lineHeight: 1.5 }}
          >
            {t('homepageExtra')}{' '}
            <InlineImg src="/images/shuffle.svg" alt="" /> <strong>{tCommon('randomGame')}</strong>, {t('andConj')}{' '}
            <InlineImg src="/images/arrow.svg" alt="" /> <strong>{tCommon('backToTop')}</strong>.
          </Text>
        </Paper>

        <Paper
          component="section"
          p={{ base: 'md', sm: 'lg' }}
          radius="md"
          aria-labelledby="game-page-heading"
          style={{
            background: 'var(--surface-primary)',
            border: '1px solid var(--card-border)',
          }}
        >
          <SectionTitle id="game-page-heading">{t('playingTitle')}</SectionTitle>

          <Text mt="xs" mb="sm" fw={600} size="sm" style={{ color: 'var(--text-primary)' }}>
            {t('guestBannerTitle')}
          </Text>
          <Bullet>
            <strong>{t('guestLogIn')}</strong> — {t('guestLogInDesc')}
          </Bullet>
          <Bullet>
            <strong>{t('guestClose')}</strong> — {t('guestCloseDesc')}
          </Bullet>

          <Text mt="md" mb="sm" fw={600} size="sm" style={{ color: 'var(--text-primary)' }}>
            {t('barUnderGame')}
          </Text>
          <BulletWithIcon icon={<ImgIcon src="/images/arrow.svg" alt="" flip />}>
            <strong>{t('returnMainLabel')}</strong> — {t('returnMainDesc')}
          </BulletWithIcon>
          <BulletWithIcon icon={<ImgIcon src="/images/like2.svg" alt="" />}>
            <strong>{t('heartGameLabel')}</strong> — {t('heartGameDesc')}
          </BulletWithIcon>
          <BulletWithIcon icon={<ImgIcon src="/images/aichat.svg" alt="" />}>
            <strong>{t('askAiLabel')}</strong> — {t('askAiDesc')}
          </BulletWithIcon>
          <BulletWithIcon
            icon={
              <IconBadge aria-hidden>
                <span className="inline-flex items-center justify-center gap-0.5">
                  <Image
                    src="/images/unmute.svg"
                    alt=""
                    width={20}
                    height={20}
                    className="pointer-events-none max-h-[20px] max-w-[20px] select-none"
                    style={{ filter: 'var(--icon-filter)' }}
                  />
                  <span className="px-0.5 text-[10px] text-[var(--text-muted)]">/</span>
                  <Image
                    src="/images/mute.svg"
                    alt=""
                    width={20}
                    height={20}
                    className="pointer-events-none max-h-[20px] max-w-[20px] select-none"
                    style={{ filter: 'var(--icon-filter)' }}
                  />
                </span>
              </IconBadge>
            }
          >
            <strong>{t('muteLabel')}</strong> — {t('muteDesc')}
          </BulletWithIcon>
          <BulletWithIcon icon={<ImgIcon src="/images/full.svg" alt="" />}>
            <strong>{t('fullscreenLabel')}</strong> — {t('fullscreenDescBefore')}{' '}
            <kbd className="tutorial-kbd">Esc</kbd> {t('fullscreenDescAfter')}
          </BulletWithIcon>

          <Text mt="md" mb={0} size="sm" style={{ color: 'var(--text-body)' }}>
            {t('gamePageFooterBefore')}{' '}
            <strong>{tCommon('backToTop')}</strong> <InlineImg src="/images/arrow.svg" alt="" /> {t('gamePageFooterAfter')}
          </Text>
        </Paper>

        <Paper
          component="section"
          p={{ base: 'md', sm: 'lg' }}
          radius="md"
          aria-labelledby="tutors-heading"
          style={{
            background: 'var(--surface-primary)',
            border: '1px solid var(--card-border)',
          }}
        >
          <SectionTitle id="tutors-heading">{t('tutorsTitle')}</SectionTitle>

          <Text
            mb="sm"
            className="break-words"
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '0.5rem',
              alignItems: 'flex-start',
              color: 'var(--text-body)',
            }}
          >
            <span className="mt-0.5 shrink-0">
              <ImgIcon src="/images/aichat.svg" alt="" />
            </span>
            <span className="min-w-0 flex-1" style={{ lineHeight: 1.55 }}>
              {t('tutorsOpen1')} <strong>{t('askAiLabel')}</strong>. {t('tutorsOpen2')} <strong>{t('tutorsPill')}</strong>{' '}
              {t('tutorsOpen3')}
            </span>
          </Text>

          <Bullet>
            <strong>{t('speechBubblesLabel')}</strong> {t('speechBubblesDesc')} <kbd className="tutorial-kbd">Esc</kbd>{' '}
            {t('speechBubblesEsc')}
          </Bullet>

          <BulletWithIcon icon={<TutorialTutorTriple />}>
            <strong>{t('hintExplainSummaryLabel')}</strong> {t('hintExplainSummaryDesc')}
          </BulletWithIcon>

          <BulletWithIcon
            icon={
              <IconBadge aria-hidden>
                <AutoplayIcon size={18} />
              </IconBadge>
            }
          >
            <strong>{t('autoAdvanceLabel')}</strong> {t('autoAdvanceDescStart')} <em>{t('autoAdvanceVoiceOff')}</em>
            {t('autoAdvanceDescMid')}
          </BulletWithIcon>

          <BulletWithIcon
            icon={
              <IconBadge aria-hidden>
                <span className="inline-flex items-center gap-0">
                  <VolumeIcon size={16} />
                  <VolumeOffIcon size={16} />
                </span>
              </IconBadge>
            }
          >
            <strong>{t('speakerLabel')}</strong> {t('speakerDesc')}
          </BulletWithIcon>

          <BulletWithIcon
            icon={
              <IconBadge aria-hidden>
                <HistoryIcon size={18} />
              </IconBadge>
            }
          >
            <strong>{t('historyLabel')}</strong> {t('historyDesc')}
          </BulletWithIcon>

          <BulletWithIcon
            icon={
              <IconBadge aria-hidden>
                <CloseIcon size={14} />
              </IconBadge>
            }
          >
            <strong>{t('skipLabel')}</strong> {t('skipDesc')}
          </BulletWithIcon>

          <BulletWithIcon
            icon={
              <IconBadge aria-hidden>
                <span className="inline-flex items-center gap-1">
                  <MicIcon size={17} />
                  <SendIcon size={14} />
                </span>
              </IconBadge>
            }
          >
            <strong>{t('chatBoxLabel')}</strong> {t('chatBoxDesc')}{' '}
            <kbd className="tutorial-kbd">Enter</kbd> {t('chatBoxEnterSends')}{' '}
            <kbd className="tutorial-kbd">Shift+Enter</kbd> {t('chatBoxNewLine')} {t('chatBoxMic')}
          </BulletWithIcon>

          <BulletWithIcon
            icon={
              <IconBadge aria-hidden>
                <CloseIcon size={14} />
              </IconBadge>
            }
          >
            <strong>{t('bannersLabel')}</strong> {t('bannersDesc')}
          </BulletWithIcon>

          <Title order={3} mt="lg" mb="sm" fz="md" style={{ color: 'var(--text-primary)' }}>
            {t('handyKeys')}
          </Title>
          <div className="-mx-1 touch-pan-x overflow-x-auto pb-px [-webkit-overflow-scrolling:touch] sm:mx-0">
            <table className="tutorial-shortcuts-table tutorial-shortcuts-table--mobile">
              <thead>
                <tr>
                  <th scope="col">{t('thKey')}</th>
                  <th scope="col">{t('thDoes')}</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>
                    <kbd className="tutorial-kbd">Enter</kbd> {t('rowInChat')}
                  </td>
                  <td>{t('rowEnterSend')}</td>
                </tr>
                <tr>
                  <td>
                    <kbd className="tutorial-kbd">Shift</kbd> + <kbd className="tutorial-kbd">Enter</kbd>
                  </td>
                  <td>{t('rowShiftEnterDesc')}</td>
                </tr>
                <tr>
                  <td>
                    <kbd className="tutorial-kbd">Space</kbd> {t('rowOr')} <kbd className="tutorial-kbd">Enter</kbd>
                  </td>
                  <td>{t('rowAdvanceDialogue')}</td>
                </tr>
                <tr>
                  <td>
                    <kbd className="tutorial-kbd">Esc</kbd>
                  </td>
                  <td>{t('rowCloseDialogue')}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </Paper>

        <Text size="sm" c="dimmed" className="break-words" style={{ lineHeight: 1.55 }}>
          {t('tryGame')}{' '}
          <Link
            href="/games/circuit-breaker"
            style={{ color: 'var(--link-color)' }}
            className="inline-flex min-h-10 items-center underline-offset-[3px] [touch-action:manipulation] hover:underline"
          >
            {t('openSampleGame')}
          </Link>
          .
        </Text>
      </Stack>
    </main>
  );
}

function TutorialThemeIcons() {
  return (
    <IconBadge aria-hidden>
      <svg width={14} height={14} viewBox="0 0 24 24" fill="none" aria-hidden stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="5" />
        <line x1="12" y1="1" x2="12" y2="3" />
        <line x1="12" y1="21" x2="12" y2="23" />
      </svg>
      <svg width={14} height={14} viewBox="0 0 24 24" aria-hidden stroke="#a0b4d8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="rgba(180,195,230,0.35)">
        <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
      </svg>
    </IconBadge>
  );
}

function TutorialTutorTriple() {
  return (
    <IconBadge aria-hidden>
      <HintIcon size={16} />
      <ExplainIcon size={16} />
      <SummarizeIcon size={16} />
    </IconBadge>
  );
}

function IconBadge({ children, 'aria-hidden': ariaHidden }: { children: ReactNode; 'aria-hidden'?: boolean }) {
  return (
    <span
      aria-hidden={ariaHidden}
      className="tutorial-icon-badge inline-flex max-w-full shrink-0 flex-wrap items-center justify-center gap-1 px-1.5 sm:gap-1 sm:px-2"
      style={{
        minWidth: 40,
        minHeight: 40,
        borderRadius: 9999,
        background: 'var(--toolbar-btn-bg)',
        border: '1px solid var(--toolbar-btn-border)',
        color: 'var(--text-primary)',
      }}
    >
      {children}
    </span>
  );
}

function ImgIcon({ src, alt = '', w = 21, flip }: { src: string; alt?: string; w?: number; flip?: boolean }) {
  return (
    <IconBadge aria-hidden>
      <span style={{ display: 'inline-flex', transform: flip ? 'scaleX(-1)' : undefined }}>
        <Image
          src={src}
          alt={alt}
          width={w}
          height={w}
          className="pointer-events-none select-none"
          style={{ maxHeight: w, maxWidth: w, filter: 'var(--icon-filter)' }}
        />
      </span>
    </IconBadge>
  );
}

function InlineImg({ src, alt = '' }: { src: string; alt?: string }) {
  return (
    <span className="inline-block align-middle" style={{ width: 20, height: 20 }}>
      <Image
        src={src}
        alt={alt}
        width={20}
        height={20}
        className="pointer-events-none select-none opacity-85"
        style={{ filter: 'var(--icon-filter)' }}
      />
    </span>
  );
}

/** Simple person outline (no avatar asset)—matches “login / profile” idea. */
function ProfileSilhouette() {
  return (
    <IconBadge aria-hidden>
      <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="8" r="4" />
        <path d="M20 21a8 8 0 0 0-16 0" />
      </svg>
    </IconBadge>
  );
}

function SectionTitle({ children, id }: { children: ReactNode; id?: string }) {
  return (
    <Title order={2} size="h4" id={id} mb="md" style={{ color: 'var(--text-primary)' }}>
      {children}
    </Title>
  );
}

function Bullet({ children }: { children: ReactNode }) {
  return (
    <Text component="div" style={{ color: 'var(--text-body)' }} mb="xs">
      <span style={{ color: 'var(--link-color)' }} aria-hidden>
        •{' '}
      </span>
      {children}
    </Text>
  );
}

function BulletWithIcon({ icon, children }: { icon: ReactNode; children: ReactNode }) {
  return (
    <div
      className="flex flex-col gap-3 sm:flex-row sm:items-start sm:gap-5"
      style={{
        color: 'var(--text-body)',
        marginBottom: '0.85rem',
      }}
    >
      <span className="shrink-0 self-start sm:pt-0.5">{icon}</span>
      <Text component="span" className="min-w-0 flex-1 break-words" style={{ color: 'var(--text-body)', lineHeight: 1.55 }}>
        {children}
      </Text>
    </div>
  );
}
