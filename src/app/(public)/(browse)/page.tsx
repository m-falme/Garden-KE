import { Leaf } from "lucide-react";
import { ExploreView } from "@/components/explore-view";
import { getActiveVenues } from "@/lib/queries/venues";

export default async function ExplorePage() {
  const venues = await getActiveVenues();

  return (
    <main className="px-5 pt-4">
      <header className="flex items-center gap-2.5">
        <span className="flex size-9 items-center justify-center rounded-full bg-primary text-primary-foreground">
          <Leaf className="size-5" aria-hidden="true" />
        </span>
        <span className="font-heading text-[22px] font-bold tracking-tight">
          Bustani
        </span>
      </header>
      <h1 className="mt-4 font-heading text-[27px] leading-tight font-bold tracking-tight">
        Gardens and lawns for your next gathering
      </h1>
      <ExploreView venues={venues} />
    </main>
  );
}