import type { ReactNode } from 'react';
import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { Paper, Stack, Text, Title } from '@mantine/core';
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

export const metadata: Metadata = {
  title: 'Quick guide — how to use the site',
  description: 'A short, friendly tour of the header, game page buttons, and AI tutors.',
};

export default function TutorialPage() {
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
            Quick guide
          </Title>
          <Text mt="sm" style={{ color: 'var(--text-body)', lineHeight: 1.55 }} className="break-words">
            New here? This page explains the main controls. Each game also has its own menus inside the play area—those
            can differ from game to game.
          </Text>
          <Text mt="xs" size="sm" c="dimmed">
            <Link
              href="/"
              style={{ color: 'var(--link-color)' }}
              className="inline-flex min-h-10 items-center underline-offset-[3px] [touch-action:manipulation] hover:underline"
            >
              Back to homepage
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
          <SectionTitle id="site-overview-heading">Top of every page</SectionTitle>

          <BulletWithIcon icon={<TutorialThemeIcons />}>
            <strong>Theme</strong> — light or dark mode.
          </BulletWithIcon>
          <BulletWithIcon icon={<ImgIcon src="/images/language.svg" alt="" />}>
            <strong>Language</strong> — change the site language.
          </BulletWithIcon>
          <BulletWithIcon icon={<ImgIcon src="/images/like.svg" alt="" />}>
            <strong>Heart</strong> — your saved favorites (sign in to use).
          </BulletWithIcon>
          <BulletWithIcon icon={<ProfileSilhouette />}>
            <strong>Log in / profile</strong> — account and settings.
          </BulletWithIcon>

          <Text
            mt="sm"
            size="sm"
            c="dimmed"
            className="break-words"
            style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem', alignItems: 'center', lineHeight: 1.5 }}
          >
            On the homepage you’ll also see subject tags,
            <InlineImg src="/images/shuffle.svg" alt="" /> <strong>Random game</strong>, and
            <InlineImg src="/images/arrow.svg" alt="" /> <strong>Back to the top</strong>.
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
          <SectionTitle id="game-page-heading">When you’re playing a game</SectionTitle>

          <Text mt="xs" mb="sm" fw={600} size="sm" style={{ color: 'var(--text-primary)' }}>
            Guest banner (if you’re not signed in)
          </Text>
          <Bullet>
            <strong>Log in</strong> — saves progress to your account across visits.
          </Bullet>
          <Bullet>
            <strong>Close</strong> — hides the banner until you reload the page.
          </Bullet>

          <Text mt="md" mb="sm" fw={600} size="sm" style={{ color: 'var(--text-primary)' }}>
            Bar under the game
          </Text>
          <BulletWithIcon icon={<ImgIcon src="/images/arrow.svg" alt="" flip />}>
            <strong>Return to main page</strong> — back to the home list.
          </BulletWithIcon>
          <BulletWithIcon icon={<ImgIcon src="/images/like2.svg" alt="" />}>
            <strong>Heart</strong> — favorite this game when you’re logged in.
          </BulletWithIcon>
          <BulletWithIcon icon={<ImgIcon src="/images/aichat.svg" alt="" />}>
            <strong>Ask AI tutors</strong> — opens Laurie &amp; Livvy. Tap again to <strong>fully close</strong> them for
            this visit.
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
                  />
                  <span className="px-0.5 text-[10px] text-[var(--text-muted)]">/</span>
                  <Image
                    src="/images/mute.svg"
                    alt=""
                    width={20}
                    height={20}
                    className="pointer-events-none max-h-[20px] max-w-[20px] select-none"
                  />
                </span>
              </IconBadge>
            }
          >
            <strong>Mute / Unmute</strong> — tutor voice on or off (same idea as the speaker icons in the tutor bar).
          </BulletWithIcon>
          <BulletWithIcon icon={<ImgIcon src="/images/full.svg" alt="" />}>
            <strong>Fullscreen</strong> — bigger play area; press your browser’s exit fullscreen (often{' '}
            <kbd className="tutorial-kbd">Esc</kbd>) to leave.
          </BulletWithIcon>

          <Text mt="md" mb={0} size="sm" style={{ color: 'var(--text-body)' }}>
            Under that you’ll find the game’s description—it’s read-only info. At the bottom of the page there’s{' '}
            <strong>Back to the top</strong>{' '}
            <InlineImg src="/images/arrow.svg" alt="" /> (games don’t show “Random game” here—you’re already in one.)
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
          <SectionTitle id="tutors-heading">AI tutors (Laurie &amp; Livvy)</SectionTitle>

          <Text
            mb="sm"
            className="break-words"
            style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', alignItems: 'flex-start', color: 'var(--text-body)' }}
          >
            <span className="mt-0.5 shrink-0">
              <ImgIcon src="/images/aichat.svg" alt="" />
            </span>
            <span className="min-w-0 flex-1" style={{ lineHeight: 1.55 }}>
              Open them with <strong>Ask AI tutors</strong>. You might see loading text first—or a small <strong>Tutors</strong>{' '}
              pill; tap it to expand again.
            </span>
          </Text>

          <Bullet>
            <strong>Speech bubbles</strong> — tap (or Space / Enter) to advance, then close when you’re done.{' '}
            <kbd className="tutorial-kbd">Esc</kbd> exits sooner.
          </Bullet>

          <BulletWithIcon icon={<TutorialTutorTriple />}>
            <strong>Hint / Explain / Summary</strong> — extra help for your spot in the game (when the game has sent tutor
            context recently).
          </BulletWithIcon>

          <BulletWithIcon
            icon={
              <IconBadge aria-hidden>
                <AutoplayIcon size={18} />
              </IconBadge>
            }
          >
            <strong>Auto-advance</strong> — moves between lines when tutor voice is <em>off</em>; with voice on, playback
            usually sets the pace.
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
            <strong>Speaker</strong> — voice on/off in the tutor bar (same setting as mute in the game toolbar above).
          </BulletWithIcon>

          <BulletWithIcon
            icon={
              <IconBadge aria-hidden>
                <HistoryIcon size={18} />
              </IconBadge>
            }
          >
            <strong>History / notebook</strong> — opens a log of tutor messages; small ✕ only closes that panel.
          </BulletWithIcon>

          <BulletWithIcon
            icon={
              <IconBadge aria-hidden>
                <CloseIcon size={14} />
              </IconBadge>
            }
          >
            <strong>Skip (×)</strong> — end the current tutor scene quickly.
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
            <strong>Chat box</strong> — type a question (up to 500 characters).{' '}
            <kbd className="tutorial-kbd">Enter</kbd> sends; <kbd className="tutorial-kbd">Shift+Enter</kbd> is a new line.
            Mic = hold to dictate where supported.
          </BulletWithIcon>

          <BulletWithIcon
            icon={
              <IconBadge aria-hidden>
                <CloseIcon size={14} />
              </IconBadge>
            }
          >
            <strong>Red or yellow banners</strong> — rate limits or voice quota; read the note, dismiss with ✕ when ready.
          </BulletWithIcon>

          <Title order={3} mt="lg" mb="sm" fz="md" style={{ color: 'var(--text-primary)' }}>
            Handy keys
          </Title>
          <div className="-mx-1 touch-pan-x overflow-x-auto pb-px [-webkit-overflow-scrolling:touch] sm:mx-0">
            <table className="tutorial-shortcuts-table tutorial-shortcuts-table--mobile">
              <thead>
                <tr>
                  <th scope="col">Key</th>
                  <th scope="col">What it does</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>
                    <kbd className="tutorial-kbd">Enter</kbd> in chat
                  </td>
                  <td>Send your message</td>
                </tr>
                <tr>
                  <td>
                    <kbd className="tutorial-kbd">Shift</kbd> + <kbd className="tutorial-kbd">Enter</kbd>
                  </td>
                  <td>New line in chat (without sending)</td>
                </tr>
                <tr>
                  <td>
                    <kbd className="tutorial-kbd">Space</kbd> or <kbd className="tutorial-kbd">Enter</kbd>
                  </td>
                  <td>Advance tutor dialogue (when you’re not typing in chat)</td>
                </tr>
                <tr>
                  <td>
                    <kbd className="tutorial-kbd">Esc</kbd>
                  </td>
                  <td>Close the current tutor dialogue</td>
                </tr>
              </tbody>
            </table>
          </div>
        </Paper>

        <Text size="sm" c="dimmed" className="break-words" style={{ lineHeight: 1.55 }}>
          Want to try it?{' '}
          <Link
            href="/games/circuit-breaker"
            style={{ color: 'var(--link-color)' }}
            className="inline-flex min-h-10 items-center underline-offset-[3px] [touch-action:manipulation] hover:underline"
          >
            Open a sample game
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
        color: 'rgba(226,232,240,0.92)',
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
          style={{ maxHeight: w, maxWidth: w }}
        />
      </span>
    </IconBadge>
  );
}

function InlineImg({ src, alt = '' }: { src: string; alt?: string }) {
  return (
    <span className="inline-block align-middle" style={{ width: 20, height: 20 }}>
      <Image src={src} alt={alt} width={20} height={20} className="pointer-events-none select-none opacity-85" />
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
