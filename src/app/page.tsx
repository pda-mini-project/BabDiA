import HomePage from "@/features/home";

type HomePageProps = {
  searchParams: Promise<{
    q?: string;
  }>;
};

export default async function Page({ searchParams }: HomePageProps) {
  const params = await searchParams;
  const q = params.q ?? "";

  return <HomePage searchQuery={q} />;
}
