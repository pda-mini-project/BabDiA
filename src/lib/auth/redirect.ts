export type RedirectSearchParams = {
  redirect?: string | string[] | undefined;
};

export function resolveRedirect(
  searchParams?: RedirectSearchParams,
): string | null {
  if (!searchParams?.redirect) {
    return null;
  }

  return Array.isArray(searchParams.redirect)
    ? searchParams.redirect[0]
    : searchParams.redirect;
}
