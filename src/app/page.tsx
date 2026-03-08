import HomePage from "@/features/home";

export const dynamic = "force-dynamic";

type HomePageProps = {
  searchParams: Promise<{
    q?: string;
    sort?: string;
    minRating?: string;
    maxWalking?: string;
    mealType?: string;
  }>;
};

export default async function Page({ searchParams }: HomePageProps) {
  const params = await searchParams;
  const q = params.q ?? "";
  const sort = params.sort ?? "latest";
  const minRating = Number(params.minRating ?? "0");
  const maxWalking = Number(params.maxWalking ?? "0");
  const mealType = params.mealType ?? "all";

  return (
    <HomePage
      searchQuery={q}
      sortBy={sort}
      minRating={Number.isFinite(minRating) ? minRating : 0}
      maxWalking={Number.isFinite(maxWalking) ? maxWalking : 0}
      mealType={mealType}
    />
  );
}
