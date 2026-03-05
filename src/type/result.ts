export type Restaurant = {
  id: string;
  name: string;
  emoji: string;
  rating: number;
  walkMin: number;
  price: string;
  wait: string;
  recommendedMenu: string;
  tags: string[];
  address?: string;
  solo?: string;
  crosswalk?: string;
  operatingHours?: string;
  naverMapUrl?: string;
  mapQuery?: string;
  /** 대표 이미지 (ldb-phinf.pstatic.net 등 originalUrl) */
  imageUrl?: string;
};
