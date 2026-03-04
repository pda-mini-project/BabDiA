import type { Restaurant } from "@/type/result";

export const SAMPLE_RESTAURANTS: Restaurant[] = [
  {
    id: "1",
    name: "김치찌개집",
    emoji: "🍲",
    rating: 4.8,
    walkMin: 5,
    price: "8,000~12,000원",
    wait: "웨이팅 없음",
    recommendedMenu: "김치찌개, 된장찌개",
    tags: ["한식", "국물", "혼밥 가능", "맵기 보통"],
    address: "공학관 뒤쪽 골목",
    solo: "가능",
    crosswalk: "없음",
    operatingHours: "11:00 ~ 14:30",
    mapQuery: "김치찌개",
  },
  {
    id: "2",
    name: "라멘 하나",
    emoji: "🍜",
    rating: 4.6,
    walkMin: 8,
    price: "10,000~13,000원",
    wait: "웨이팅 있음",
    recommendedMenu: "돈코츠 라멘, 쇼유 라멘",
    tags: ["일식", "국물", "면", "맵기 순한"],
    address: "정문 건너편 2층",
    solo: "가능",
    crosswalk: "있음",
    operatingHours: "11:00 ~ 21:00",
    mapQuery: "라멘",
  },
  {
    id: "3",
    name: "버거킹 스타일 버거",
    emoji: "🍔",
    rating: 4.3,
    walkMin: 3,
    price: "7,000~10,000원",
    wait: "웨이팅 없음",
    recommendedMenu: "와퍼, 치킨버거",
    tags: ["햄버거/샌드위치", "국물 없는", "빠른 식사"],
    address: "후문 1층",
    solo: "가능",
    crosswalk: "없음",
    mapQuery: "버거",
  },
  {
    id: "4",
    name: "중화반점",
    emoji: "🥟",
    rating: 4.5,
    walkMin: 10,
    price: "9,000~15,000원",
    wait: "웨이팅 없음",
    recommendedMenu: "짜장면, 짬뽕, 탕수육",
    tags: ["중식", "국물 없는", "밥/면"],
    address: "학교 앞 대로변",
    solo: "가능",
    crosswalk: "있음",
    mapQuery: "중화요리",
  },
  {
    id: "5",
    name: "파스타 브런치",
    emoji: "🍝",
    rating: 4.7,
    walkMin: 12,
    price: "12,000~18,000원",
    wait: "웨이팅 있음",
    recommendedMenu: "크림 파스타, 로제 파스타",
    tags: ["양식", "국물 없는", "면"],
    address: "카페 거리 중간",
    solo: "가능",
    crosswalk: "있음",
    mapQuery: "파스타",
  },
  {
    id: "6",
    name: "초밥집 스시야",
    emoji: "🍣",
    rating: 4.9,
    walkMin: 7,
    price: "15,000~25,000원",
    wait: "웨이팅 있음",
    recommendedMenu: "연어 초밥, 참치 초밥 세트",
    tags: ["일식", "국물 없는", "혼밥 가능"],
    address: "문화관 옆",
    solo: "가능",
    crosswalk: "없음",
    mapQuery: "초밥",
  },
];

export function pickRecommendation(all: Restaurant[]): Restaurant {
  return all[Math.floor(Math.random() * all.length)];
}

export function pickRecommendationExcluding(
  all: Restaurant[],
  currentId: string,
): Restaurant {
  const others = all.filter((r) => r.id !== currentId);
  if (others.length === 0) return all[0];
  return others[Math.floor(Math.random() * others.length)];
}
