'use client';

type TagFilterProps = {
  tags: string[];
  activeTags: Set<string>;
  onToggle: (tag: string) => void;
};

export default function TagFilter({ tags, activeTags, onToggle }: TagFilterProps) {
  if (tags.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2">
      {tags.map((tag) => {
        const active = activeTags.has(tag);
        return (
          <button
            key={tag}
            onClick={() => onToggle(tag)}
            className="rounded-full px-4 py-1.5 mb-4 text-sm font-medium transition-all"
            style={{
              background: active
                ? "linear-gradient(135deg, #1b41ff, #0054f0)"
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
