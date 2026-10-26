/** Skeleton shown while the work index streams in on client navigation. */
export default function Loading() {
  return (
    <div className="container-x pt-[calc(var(--nav-top)+var(--nav-h)+120px)] pb-32" aria-busy="true" aria-label="Loading work">
      <div className="h-3 w-40 animate-pulse rounded-full bg-black/10" />
      <div className="mt-8 h-24 w-3/4 max-w-2xl animate-pulse rounded-2xl bg-black/[0.06]" />
      <div className="mt-16 grid gap-10 md:grid-cols-2 lg:grid-cols-12">
        {[7, 5, 5, 7].map((span, i) => (
          <div key={i} className={span === 7 ? "lg:col-span-7" : "lg:col-span-5"}>
            <div className="aspect-[4/3] animate-pulse rounded-[22px] border border-line bg-black/[0.035]" />
            <div className="mt-5 h-5 w-1/2 animate-pulse rounded-full bg-black/10" />
            <div className="mt-3 h-3 w-3/4 animate-pulse rounded-full bg-black/[0.06]" />
          </div>
        ))}
      </div>
    </div>
  );
}
