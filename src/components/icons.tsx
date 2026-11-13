/** Hand-drawn icon set — one line weight, rounded caps, leaf-flavored. */

type IconProps = { className?: string };

export function IconSprout({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M12 21v-8" />
      <path d="M12 13c0-3.5-2.5-5-6-5 0 3.5 2.5 5 6 5z" />
      <path d="M12 10c0-3 2-4.5 5.5-4.5 0 3-2 4.5-5.5 4.5z" />
    </svg>
  );
}

export function IconShelf({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M4 4h4v16H4z" />
      <path d="M10 4h4v16h-4z" />
      <path d="M16.5 5l3.5.8L17.6 20l-3.6-.8z" />
    </svg>
  );
}

export function IconBranch({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M3 14c5-1 9-5 11-9" />
      <path d="M9 12c1.5.4 3 0 4-1" />
      <path d="M14 5c2 .5 4 0 5-2" />
      <path d="M8.5 13.5l1.5 4M3 14l1 5" />
    </svg>
  );
}

export function IconFlag({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M5 21V4" />
      <path d="M5 4c4-2 7 2 11 0v9c-4 2-7-2-11 0" />
    </svg>
  );
}

export function IconLeaf({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M20 4C10 4 4 9 4 17c8 1 14-3 16-13z" />
      <path d="M4 17C8 11 13 8 19 5" />
    </svg>
  );
}

export function IconBack({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M15 5l-7 7 7 7" />
    </svg>
  );
}

export function IconSoundOn({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M4 9v6h4l5 4V5L8 9H4z" />
      <path d="M16.5 8.5a5 5 0 0 1 0 7" />
    </svg>
  );
}

export function IconSoundOff({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M4 9v6h4l5 4V5L8 9H4z" />
      <path d="M16 9l5 6M21 9l-5 6" />
    </svg>
  );
}

export function IconPlus({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}

export function IconPressedLeaf({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M20 4C10 4 4 9 4 17c8 1 14-3 16-13z" />
      <path d="M4 17C8 11 13 8 19 5" />
      <path d="M7 20h13" />
    </svg>
  );
}
