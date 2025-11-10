export type HomeStackParamList = {
  Home: undefined;
  AllCategories: undefined;
  CategoryProducts: { categoryId: number; categoryName: string };
  ProductDetail: { product: Product };
};

export type SellStackParamList = {
  PostNewAd: {
    selectedCategory?: Category;
    selectedSubcategory?: Subcategory;
  } | undefined;
  CategorySelection: {
    currentCategory?: Category;
  };
  SubcategorySelection: {
    category: Category;
    currentSubcategory?: Subcategory;
  };
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
  slug: string;
  icon: any; // For require() images
  featured: boolean;
  hasSubcategories: boolean;
};

export type Subcategory = {
  id: number;
  categoryId: number;
  name: string;
  slug: string;
};