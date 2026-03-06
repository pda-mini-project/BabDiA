export type RedirectSearchParams = {
  redirect?: string | string[] | undefined;
};

type MaybePromise<T> = T | Promise<T>;

export async function resolveRedirect(
  searchParams?: MaybePromise<RedirectSearchParams | undefined>,
): Promise<string | null> {
  const resolved = await searchParams;
  if (!resolved?.redirect) {
    return null;
  }

  return Array.isArray(resolved.redirect)
    ? resolved.redirect[0]
    : resolved.redirect;
}
