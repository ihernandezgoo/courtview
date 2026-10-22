import type { ReactNode } from "react";

type Props = {
  id?: string;
  title: string;
  meta?: string;
  action?: ReactNode;
};

export function SectionHeading({ id, title, meta, action }: Props) {
  return (
    <div className="flex items-baseline justify-between gap-4 border-b border-foreground pb-2">
      <h2 id={id} className="text-xs font-semibold uppercase tracking-wider">
        {title}
      </h2>
      {(meta || action) && (
        <div className="flex items-baseline gap-3">
          {meta && <span className="text-xs text-muted first-letter:uppercase">{meta}</span>}
          {action}
        </div>
      )}
    </div>
  );
}
