'use client';

type TagFilterProps = {
  tags: string[];
  activeTags: Set<string>;
  onToggle: (tag: string) => void;
};

export default function TagFilter({ tags, activeTags, onToggle }: TagFilterProps) {
  if (tags.length === 0) return null;

  /** Four STEM subjects fit a stable 2×2 grid on narrow phones; otherwise center wrapped rows. */
  const layoutClass =
    tags.length === 4
      ? 'mb-4 grid grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:justify-center'
      : 'mb-4 flex flex-wrap justify-center gap-2';

  return (
    <div className={layoutClass}>
      {tags.map((tag) => {
        const active = activeTags.has(tag);
        return (
          <button
            key={tag}
            onClick={() => onToggle(tag)}
            className="w-full min-w-0 rounded-full px-3 py-1.5 text-center text-sm font-medium transition-all sm:w-auto sm:px-4"
            style={{
              background: active
                ? "var(--button-primary-bg)"
                : "var(--tag-bg)",
              border: active
                ? "1px solid transparent"
                : "1px solid var(--tag-border)",
              color: active ? "#ffffff" : "var(--text-tag)",
              cursor: "pointer",
            }}
          >
            {tag}
          </button>
        );
      })}
    </div>
  );
}
