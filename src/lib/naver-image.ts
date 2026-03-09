const GRAPHQL_URL = "https://pcmap-api.place.naver.com/graphql";

function extractPlaceId(url: string): string | null {
  try {
    const u = new URL(url);
    const path = u.pathname;
    const placeMatch =
      path.match(/\/entry\/place\/([^/?]+)/) ||
      path.match(/\/place\/([^/?]+)/) ||
      path.match(/\/restaurant\/([^/?]+)/);
    if (placeMatch) return placeMatch[1];
    const numericId = path.match(/\/(\d{8,})/);
    return numericId ? numericId[1] : null;
  } catch {
    return null;
  }
}

async function expandShortUrl(url: string): Promise<string> {
  try {
    const res = await fetch(url, { method: "HEAD", redirect: "follow" });
    return res.url || url;
  } catch {
    return url;
  }
}

const GET_PHOTO_VIEWER_ITEMS_QUERY = `query getPhotoViewerItems($input: PhotoViewerInput) {
  photoViewer(input: $input) {
    photos {
      originalUrl
      __typename
    }
    __typename
  }
}`;

function getOriginalUrlFromResponse(data: unknown): string | null {
  if (!data || typeof data !== "object") return null;
  const d = data as Record<string, unknown>;

  if (Array.isArray(d) && d[2] != null) {
    const third = d[2] as Record<string, unknown>;
    const photos = (third?.data as Record<string, unknown>)?.photoViewer as Record<string, unknown>;
    const list = photos?.photos as Array<{ originalUrl?: string }> | undefined;
    const first = list?.[0]?.originalUrl;
    if (first && typeof first === "string") return first;
  }

  const viewer = d?.data as Record<string, unknown> | undefined;
  const photoViewer = viewer?.photoViewer as Record<string, unknown> | undefined;
  const photos = photoViewer?.photos as Array<{ originalUrl?: string }> | undefined;
  const first = photos?.[0]?.originalUrl;
  if (first && typeof first === "string") return first;

  return null;
}

/** 네이버 플레이스 URL(또는 단축 URL)에서 대표 이미지 URL을 가져옵니다. */
export async function fetchNaverRestaurantImage(naverLink: string): Promise<string | null> {
  try {
    let url = naverLink;

    const hostname = new URL(url).hostname;
    if (hostname === "naver.me") {
      url = await expandShortUrl(url);
    }

    const allowedHosts = ["map.naver.com", "pcmap.place.naver.com"];
    const resolvedHostname = new URL(url).hostname;
    if (!allowedHosts.includes(resolvedHostname) && !resolvedHostname.endsWith(".naver.com")) {
      return null;
    }

    const businessId = extractPlaceId(url);
    if (!businessId) return null;

    const body = {
      operationName: "getPhotoViewerItems",
      variables: {
        input: {
          businessId,
          businessType: "restaurant",
          cursors: [
            { id: "biz" },
            { id: "clip" },
            { id: "cp0" },
            { id: "aiView" },
            { id: "visitorReview" },
            { id: "imgSas" },
            { id: "cp" },
          ],
          dateRange: "",
          excludeAuthorIds: [],
          excludeClipIds: [],
          excludeSection: [],
        },
      },
      query: GET_PHOTO_VIEWER_ITEMS_QUERY,
    };

    const res = await fetch(GRAPHQL_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "*/*",
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept-Language": "ko-KR,ko;q=0.9",
        Origin: "https://pcmap.place.naver.com",
        Referer: "https://pcmap.place.naver.com/",
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) return null;

    const data = await res.json();
    return getOriginalUrlFromResponse(data);
  } catch {
    return null;
  }
}
