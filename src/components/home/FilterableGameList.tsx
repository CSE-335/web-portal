'use client';

import { useMemo, useState } from 'react';
import { Stack } from '@mantine/core';
import GameListCard from './GameListCard';
import TagFilter from './TagFilter';
import type { GameMeta } from '@/data/games';

/** Display order for homepage subject tags (STEM acronym). */
const SUBJECT_TAG_ORDER: GameMeta['subject'][] = [
  'Science',
  'Technology',
  'Engineering',
  'Mathematics',
];

type FilterableGameListProps = {
  games: GameMeta[];
};

function subjectTagSortKey(subject: string): number {
  const i = SUBJECT_TAG_ORDER.indexOf(subject as GameMeta['subject']);
  return i === -1 ? SUBJECT_TAG_ORDER.length : i;
}

export default function FilterableGameList({ games }: FilterableGameListProps) {
  const [activeSubject, setActiveSubject] = useState<string | null>(null);

  const allSubjects = useMemo(() => {
    const subjects = new Set<string>();
    for (const game of games) {
      subjects.add(game.subject);
    }
    return [...subjects].sort(
      (a, b) =>
        subjectTagSortKey(a) - subjectTagSortKey(b) || a.localeCompare(b)
    );
  }, [games]);

  const filteredGames = useMemo(() => {
    if (!activeSubject) return games;
    return games.filter((game) => game.subject === activeSubject);
  }, [games, activeSubject]);

  function handleToggle(subject: string) {
    setActiveSubject((prev) => (prev === subject ? null : subject));
  }

  return (
    <>
      <TagFilter tags={allSubjects} activeTags={new Set(activeSubject ? [activeSubject] : [])} onToggle={handleToggle} />

      <Stack gap="lg">
        {filteredGames.map((game) => (
          <GameListCard key={game.slug} {...game} />
        ))}
      </Stack>
    </>
  );
}
