import type { ReactNode } from "react";

type Props = {
  id?: string;
  title: string;
  meta?: string;
  action?: ReactNode;
};

export function SectionHeading({ id, title, meta, action }: Props) {
  return (
    <div className="flex items-end justify-between gap-4 pb-3">
      <h2
        id={id}
        className="font-display flex items-center gap-2.5 text-xl font-extrabold uppercase leading-none tracking-tight"
      >
        <span aria-hidden className="h-5 w-1 shrink-0 rounded-full bg-accent" />
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
