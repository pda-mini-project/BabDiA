import { NextResponse } from "next/server";

const GRAPHQL_URL = "https://pcmap-api.place.naver.com/graphql";

/** 식당 추가 시 저장한 URL에서 place ID 추출 → GraphQL의 businessId로 사용 */
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

/** getPhotoViewerItems 응답에서 첫 번째 사진의 originalUrl 추출 */
function getOriginalUrlFromResponse(data: unknown): string | null {
  if (!data || typeof data !== "object") return null;
  const d = data as Record<string, unknown>;

  // 배치 응답: 세 번째(인덱스 2)가 getPhotoViewerItems
  if (Array.isArray(d) && d[2] != null) {
    const third = d[2] as Record<string, unknown>;
    const photos = (third?.data as Record<string, unknown>)?.photoViewer as Record<string, unknown>;
    const list = photos?.photos as Array<{ originalUrl?: string }> | undefined;
    const first = list?.[0]?.originalUrl;
    if (first && typeof first === "string") return first;
  }

  // 단일 operation 응답
  const viewer = d?.data as Record<string, unknown> | undefined;
  const photoViewer = viewer?.photoViewer as Record<string, unknown> | undefined;
  const photos = photoViewer?.photos as Array<{ originalUrl?: string }> | undefined;
  const first = photos?.[0]?.originalUrl;
  if (first && typeof first === "string") return first;

  return null;
}

const GET_PHOTO_VIEWER_ITEMS_QUERY = `query getPhotoViewerItems($input: PhotoViewerInput) {
  photoViewer(input: $input) {
    cursors { id startIndex hasNext lastCursor __typename }
    photos {
      viewId
      originalUrl
      originalDate
      width
      height
      title
      __typename
    }
    __typename
  }
}`;

/**
 * GET /api/restaurant-image?url=https://map.naver.com/...
 * URL에서 businessId(place id) 추출 → getPhotoViewerItems 호출 → photos[0].originalUrl 반환
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const url = searchParams.get("url");
    if (!url || !url.startsWith("https://")) {
      return NextResponse.json({ imageUrl: null }, { status: 400 });
    }
    const allowedHosts = ["map.naver.com", "pcmap.place.naver.com"];
    try {
      const u = new URL(url);
      if (!allowedHosts.includes(u.hostname) && !u.hostname.endsWith(".naver.com")) {
        return NextResponse.json({ imageUrl: null }, { status: 400 });
      }
    } catch {
      return NextResponse.json({ imageUrl: null }, { status: 400 });
    }

    const businessId = extractPlaceId(url);
    if (!businessId) {
      return NextResponse.json({ imageUrl: null });
    }

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
      next: { revalidate: 86400 },
    });

    if (!res.ok) {
      return NextResponse.json({ imageUrl: null });
    }

    const data = await res.json();
    const imageUrl = getOriginalUrlFromResponse(data);
    return NextResponse.json({ imageUrl });
  } catch (err) {
    console.error("[GET /api/restaurant-image]", err);
    return NextResponse.json({ imageUrl: null });
  }
}
