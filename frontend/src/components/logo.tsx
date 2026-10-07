/** Marca do QuadLab (mesmo `.logo` do protótipo): quadrado verde + nome. */
export function Logo() {
  return (
    <div className="flex items-center gap-2.75 font-extrabold">
      <div className="relative size-8.5 rounded-[11px] bg-[linear-gradient(145deg,#26d4c1,#087b72)] shadow-[0_8px_18px_rgba(18,184,166,0.25)]">
        <span className="absolute -right-0.5 -bottom-0.5 size-2.25 rounded-full bg-white shadow-[0_0_0_3px_var(--color-canvas)]" />
      </div>
      <span className="text-[21px] tracking-[-0.6px]">QuadLab</span>
    </div>
  );
}
