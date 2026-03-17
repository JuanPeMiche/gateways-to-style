import { supabase } from "@/integrations/supabase/client";

export interface Product {
  id: string;
  name: string;
  category: ProductCategory;
  description: string;
  price: number | null;
  images: string[]; // URLs from storage
  visible: boolean;
  created_at: string;
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

const BUCKET = "product-images";
const PAGE_SIZE = 18;

// Upload a file to storage, return public URL
export async function uploadImage(file: File): Promise<string> {
  const ext = file.name.split(".").pop() || "jpg";
  const path = `${crypto.randomUUID()}.${ext}`;

  const { error } = await supabase.storage.from(BUCKET).upload(path, file, {
    cacheControl: "3600",
    upsert: false,
  });

  if (error) throw error;

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return data.publicUrl;
}

// Upload a base64 data URL (for backward compat / canvas output)
export async function uploadBase64Image(dataUrl: string): Promise<string> {
  const res = await fetch(dataUrl);
  const blob = await res.blob();
  const ext = blob.type.split("/")[1] || "jpeg";
  const file = new File([blob], `image.${ext}`, { type: blob.type });
  return uploadImage(file);
}

export async function deleteStorageImage(url: string): Promise<void> {
  const match = url.match(/\/product-images\/(.+)$/);
  if (match) {
    await supabase.storage.from(BUCKET).remove([match[1]]);
  }
}

export async function getProducts(): Promise<Product[]> {
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data || []) as Product[];
}

export async function getPublishedProducts(): Promise<Product[]> {
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("visible", true)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data || []) as Product[];
}

// Paginated fetch for catalog
export async function getPublishedProductsPaginated(
  page: number,
  category?: string,
  search?: string
): Promise<{ products: Product[]; hasMore: boolean }> {
  const from = page * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  let query = supabase
    .from("products")
    .select("*")
    .eq("visible", true)
    .order("created_at", { ascending: false })
    .range(from, to);

  if (category && category !== "Todos") {
    query = query.eq("category", category);
  }

  if (search?.trim()) {
    const q = `%${search.trim()}%`;
    query = query.or(`name.ilike.${q},description.ilike.${q},category.ilike.${q}`);
  }

  const { data, error } = await query;
  if (error) throw error;

  const products = (data || []) as Product[];
  return { products, hasMore: products.length === PAGE_SIZE };
}

// Get counts per category for published products
export async function getCategoryCounts(): Promise<Record<string, number>> {
  const { data, error } = await supabase
    .from("products")
    .select("category")
    .eq("visible", true);

  if (error) throw error;

  const counts: Record<string, number> = { Todos: data?.length || 0 };
  for (const row of data || []) {
    counts[row.category] = (counts[row.category] || 0) + 1;
  }
  return counts;
}

export async function addProduct(
  product: Omit<Product, "id" | "created_at">
): Promise<Product> {
  const { data, error } = await supabase
    .from("products")
    .insert({
      name: product.name,
      category: product.category,
      description: product.description,
      price: product.price,
      images: product.images,
      visible: product.visible,
    })
    .select()
    .single();

  if (error) throw error;
  return data as Product;
}

export async function updateProduct(
  id: string,
  updates: Partial<Omit<Product, "id" | "created_at">>
): Promise<void> {
  const { error } = await supabase
    .from("products")
    .update(updates)
    .eq("id", id);

  if (error) throw error;
}

export async function deleteProduct(id: string): Promise<void> {
  const { data: product } = await supabase
    .from("products")
    .select("images")
    .eq("id", id)
    .single();

  if (product?.images?.length) {
    const paths = product.images
      .map((url: string) => {
        const match = url.match(/\/product-images\/(.+)$/);
        return match ? match[1] : null;
      })
      .filter(Boolean) as string[];
    if (paths.length) {
      await supabase.storage.from(BUCKET).remove(paths);
    }
  }

  const { error } = await supabase.from("products").delete().eq("id", id);
  if (error) throw error;
}

export { PAGE_SIZE };
