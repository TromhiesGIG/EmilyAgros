// src/navigation/types.ts
export type HomeStackParamList = {
  Home: undefined;
  AllCategories: undefined;
  CategoryProducts: { categoryId: number; categoryName: string };
  ProductDetail: { product: Product };
};

export type MainTabParamList = {
  HomeTab: undefined;
  SearchTab: undefined;
  SellTab: undefined;
  MessagesTab: undefined;
  MoreTab: undefined;
};

export type Product = {
  id: number;
  title: string;
  price: number;
  location: string;
  condition: string;
  image: string;
  description?: string;
  categoryId: number;
};

export type Category = {
  id: number;
  name: string;
  icon: any; // For require() images
  featured: boolean;
};