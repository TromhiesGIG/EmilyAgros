// src/data/mockData.ts
import { Category, Product } from '../navigation/types';

export const categories: Category[] = [
  { id: 1, name: 'Trending', icon: require('../../assets/trending.png'), featured: true },
  { id: 2, name: 'Livestock & Pets', icon: require('../../assets/livestock.png'), featured: true },
  { id: 3, name: 'Services', icon: require('../../assets/services.png'), featured: true },
  { id: 4, name: 'Food, Fruits and Vegetables', icon: require('../../assets/fruit.png'), featured: true },
  { id: 5, name: 'Animal Feed', icon: require('../../assets/feed.png'), featured: true },
  { id: 6, name: 'Tractors/Farm Equipments', icon: require('../../assets/tractors.png'), featured: true },
  { id: 7, name: 'Fertilizers', icon: require('../../assets/fertilizer.png'), featured: true },
  { id: 8, name: 'Animal Accessories', icon: require('../../assets/accessories.png'), featured: true },
  { id: 9, name: 'Seedlings', icon: require('../../assets/seed.png'), featured: false },
  { id: 10, name: 'Animal Pharmacy', icon: require('../../assets/pharmacy.png'), featured: false },
  { id: 11, name: 'Animal Mating', icon: require('../../assets/Animal.png'), featured: false },
  { id: 12, name: 'Agro Chemicals', icon: require('../../assets/chemicals.png'), featured: false },
  { id: 13, name: 'Horticulture', icon: require('../../assets/hort.png'), featured: false },
  { id: 14, name: 'Agro Loan', icon: require('../../assets/loan.png'), featured: false },
  { id: 15, name: 'Agro Insurance', icon: require('../../assets/insurance.png'), featured: false },
];

export const trendingProducts: Product[] = [
  {
    id: 1,
    title: 'Massey Ferguson 399',
    price: 40000000,
    location: 'Kwara, Ilorin',
    condition: 'Nigerian Used',
    image: 'https://www.howardandsons.co.uk/wp-content/uploads/2020/12/MF-399-J187LGL-5.jpg',
    description: 'Well maintained Massey Ferguson 399 tractor. Perfect for large scale farming operations. All parts functioning properly.',
    categoryId: 6,
  },
  {
    id: 2,
    title: 'Fiat 640',
    price: 18000000,
    location: 'Lagos, Lagos Island',
    condition: 'Brand New',
    image: 'https://www.truck1.eu/img/ful/15014/Fiat-640-Netherlands_15014_6837563368762.jpg',
    description: 'Brand new Fiat 640 tractor imported directly from Italy. Comes with 2 years warranty and free maintenance.',
    categoryId: 6,
  },
  {
    id: 3,
    title: '16 Litre Knapsack Sprayer',
    price: 18000,
    location: 'Lagos, Ojo',
    condition: 'Brand New',
    image: 'https://hardwareheaven.ie/wp/wp-content/uploads/2019/09/16lt-knapsack-356x356.png',
    description: 'Professional grade knapsack sprayer with adjustable nozzle. Perfect for pesticide and fertilizer application.',
    categoryId: 7,
  },
  {
    id: 4,
    title: 'Live Broiler Chickens (50 pieces)',
    price: 125000,
    location: 'Ogun, Abeokuta',
    condition: 'Healthy',
    image: 'https://melissaknorris.com/wp-content/uploads/2022/05/Meat-birds_MKN-1024x576.jpg',
    description: 'Healthy broiler chickens ready for sale. Vaccinated and well fed. Minimum order 50 pieces.',
    categoryId: 2,
  },
];

export const getFeaturedCategories = (): Category[] => {
  return categories.filter(cat => cat.featured);
};

export const getProductsByCategory = (categoryId: number): Product[] => {
  return trendingProducts.filter(product => product.categoryId === categoryId);
};

export const formatPrice = (price: number): string => {
  return `₦${price.toLocaleString()}`;
};