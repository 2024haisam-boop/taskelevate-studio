import { ButtonLink } from "@/components/ui/ButtonLink";
import { Headline } from "@/components/ui/Headline";

export default function NotFound() {
  return (
    <section className="container-x flex min-h-[80svh] flex-col items-start justify-center pt-[calc(var(--nav-top)+var(--nav-h)+40px)] pb-24">
      <p className="label-mono text-fg-3">Error 404</p>
      <Headline as="h1" text={"OFF THE\n*GRID.*"} entrance className="mt-6 text-display-xl" />
      <p className="mt-8 max-w-md text-lead text-fg-2">This page doesn&apos;t exist — but plenty of other things do.</p>
      <div className="mt-10 flex flex-col gap-3 xs:flex-row">
        <ButtonLink href="/">Back to home</ButtonLink>
        <ButtonLink href="/work" variant="glass">
          Explore Our Work
        </ButtonLink>
      </div>
    </section>
  );
}
