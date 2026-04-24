'use client';

import { useMemo, useState } from 'react';
import { Stack } from '@mantine/core';
import GameListCard from './GameListCard';
import TagFilter from './TagFilter';
import type { GameMeta } from '@/data/games';

type FilterableGameListProps = {
  games: GameMeta[];
};

export default function FilterableGameList({ games }: FilterableGameListProps) {
  const [activeSubject, setActiveSubject] = useState<string | null>(null);

  const allSubjects = useMemo(() => {
    const subjects = new Set<string>();
    for (const game of games) {
      subjects.add(game.subject);
    }
    return [...subjects].sort();
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
