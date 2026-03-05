export type ReviewRecord = {
  id: string;
  nickname: string;
  menu: string;
  rating: number;
  comment: string;
};

export type InfoBlockRecord = {
  label: string;
  value: string;
  detail: string;
  linkUrl?: string;
  linkLabel?: string;
};

export type RestaurantDetailRecord = {
  slug: string;
  name: string;
  tagline: string;
  rating: number;
  reviewCount: number;
  naverLink: string;
  infoBlocks: InfoBlockRecord[];
  reviews: ReviewRecord[];
};

const RESTAURANTS: Record<string, RestaurantDetailRecord> = {
  kimchijjigae: {
    slug: "kimchijjigae",
    name: "김치찌개집",
    tagline: "한식 · 국물 · 혼밥 편함 · 도보 5분",
    rating: 4.8,
    reviewCount: 32,
    naverLink: "https://map.naver.com",
    infoBlocks: [
      {
        label: "메뉴",
        value: "김치찌개 · 제육덮밥 · 순두부",
        detail: "대표 메뉴 예시",
      },
      {
        label: "도보 거리",
        value: "도보 5분",
        detail: "프디아 기준 (대략)",
      },
      {
        label: "가격대",
        value: "8,000 ~ 12,000원",
        detail: "점심 평균 가격",
      },
      {
        label: "대략적인 위치",
        value: "OO역 2번 출구 근처",
        detail: "정확한 위치는 네이버 링크로",
        linkUrl: "https://map.naver.com",
        linkLabel: "네이버 플레이스에서 보기",
      },
    ],
    reviews: [
      {
        id: "a",
        nickname: "닉네임A",
        menu: "김치찌개",
        rating: 5,
        comment: "국물이 진하고 고기가 많아서 만족스러웠어요.",
      },
      {
        id: "b",
        nickname: "닉네임B",
        menu: "제육덮밥",
        rating: 4,
        comment: "양도 넉넉하고 빨리 나와서 점심에 좋아요.",
      },
      {
        id: "c",
        nickname: "닉네임C",
        menu: "순두부",
        rating: 5,
        comment: "혼밥하기 편한 자리여서 자주 와요.",
      },
    ],
  },
};

export const DEFAULT_RESTAURANT = RESTAURANTS.kimchijjigae;

export function getRestaurantDetail(slug: string) {
  return RESTAURANTS[slug] ?? DEFAULT_RESTAURANT;
}
