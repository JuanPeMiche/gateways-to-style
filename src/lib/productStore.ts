export interface Product {
  id: string;
  name: string;
  category: ProductCategory;
  description: string;
  price: number | null;
  images: string[]; // base64 data URLs
  visible: boolean;
  createdAt: number;
}

export const CATEGORIES = [
  "Remeras",
  "Scrolls",
  "Mousepads",
  "Cuadros de Cerámica",
  "Combos",
  "Box Regalo",
] as const;

export type ProductCategory = (typeof CATEGORIES)[number];

const STORAGE_KEY = "gate01_products";

export function getProducts(): Product[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveProducts(products: Product[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
    window.dispatchEvent(new Event("gate01_products_updated"));
  } catch (e) {
    console.error("Error saving products (localStorage may be full):", e);
    throw new Error("No se pudo guardar: almacenamiento lleno");
  }
}

export function addProduct(product: Omit<Product, "id" | "createdAt">): Product {
  const products = getProducts();
  const newProduct: Product = {
    ...product,
    id: crypto.randomUUID(),
    createdAt: Date.now(),
  };
  products.push(newProduct);
  saveProducts(products);
  return newProduct;
}

export function updateProduct(id: string, updates: Partial<Omit<Product, "id" | "createdAt">>): void {
  const products = getProducts();
  const idx = products.findIndex((p) => p.id === id);
  if (idx !== -1) {
    products[idx] = { ...products[idx], ...updates };
    saveProducts(products);
  }
}

export function deleteProduct(id: string): void {
  saveProducts(getProducts().filter((p) => p.id !== id));
}

export function getPublishedProducts(): Product[] {
  return getProducts().filter((p) => p.visible);
}

export function useProductsListener() {
  // Call this in components to re-render on product changes
}
