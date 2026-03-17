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
  // Extract path from public URL
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
  // First get product to delete its images from storage
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
