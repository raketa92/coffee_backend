export type ProductResponseDto = {
  guid: string;
  name: string;
  image: string;
  price: number;
  categoryGuid: string;
  shopGuid: string;
  rating: number;
  ingredients: string[] | null;
};
