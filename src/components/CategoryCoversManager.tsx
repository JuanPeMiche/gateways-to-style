import { useState, useEffect, useRef } from "react";
import { Upload, X, Trash2, Image as ImageIcon } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { CATEGORIES } from "@/lib/productStore";
import { uploadImage } from "@/lib/productStore";
import { compressImage, formatBytes } from "@/lib/imageCompressor";
import { toast } from "@/hooks/use-toast";

const CategoryCoversManager = () => {
  const [covers, setCovers] = useState<Record<string, string>>({});
  const [fallbacks, setFallbacks] = useState<Record<string, string>>({});
  const [uploading, setUploading] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  useEffect(() => {
    fetchCovers();
    fetchFallbacks();
  }, []);

  const fetchCovers = async () => {
    const { data } = await supabase
      .from("category_covers")
      .select("category, image_url");
    if (data) {
      const map: Record<string, string> = {};
      for (const row of data) {
        map[row.category] = row.image_url;
      }
      setCovers(map);
    }
  };

  const fetchFallbacks = async () => {
    const { data } = await supabase
      .from("products")
      .select("category, images")
      .eq("visible", true)
      .order("created_at", { ascending: false });
    if (data) {
      const map: Record<string, string> = {};
      for (const row of data) {
        if (!map[row.category] && row.images?.length > 0) {
          map[row.category] = row.images[0];
        }
      }
      setFallbacks(map);
    }
  };

  const handleFileSelect = (category: string) => {
    setActiveCategory(category);
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !activeCategory) return;

    const ACCEPTED = ["image/jpeg", "image/png", "image/webp"];
    if (!ACCEPTED.includes(file.type)) {
      toast({ title: "Formato no soportado", description: "Solo JPG, PNG y WEBP", variant: "destructive" });
      return;
    }

    setUploading(activeCategory);
    try {
      const { file: compressed, originalSize, compressedSize } = await compressImage(file);
      if (compressedSize < originalSize) {
        toast({ title: `Imagen optimizada: ${formatBytes(compressedSize)}`, description: `Original: ${formatBytes(originalSize)}` });
      }
      const url = await uploadImage(compressed);

      const { error } = await supabase
        .from("category_covers")
        .upsert({ category: activeCategory, image_url: url, updated_at: new Date().toISOString() }, { onConflict: "category" });

      if (error) throw error;

      setCovers((prev) => ({ ...prev, [activeCategory!]: url }));
      toast({ title: `Portada de "${activeCategory}" actualizada` });
    } catch (err) {
      console.error(err);
      toast({ title: "Error al subir imagen", variant: "destructive" });
    } finally {
      setUploading(null);
      setActiveCategory(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const removeCover = async (category: string) => {
    try {
      await supabase.from("category_covers").delete().eq("category", category);
      setCovers((prev) => {
        const next = { ...prev };
        delete next[category];
        return next;
      });
      toast({ title: `Portada personalizada de "${category}" eliminada` });
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div>
      <p className="font-body text-sm text-muted-foreground mb-6">
        Estas son las portadas actuales de cada categoría en la página de inicio. Podés cambiarlas o eliminar la personalizada para volver a la imagen automática del primer producto.
      </p>

      <input
        ref={fileInputRef}
        type="file"
        accept=".jpg,.jpeg,.png,.webp"
        className="hidden"
        onChange={handleFileChange}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {CATEGORIES.map((cat) => {
          const customCover = covers[cat];
          const fallbackImg = fallbacks[cat];
          const displayImg = customCover || fallbackImg;
          const isUploading = uploading === cat;

          return (
            <div key={cat} className="border border-border rounded-lg overflow-hidden bg-card">
              <div className="relative h-44 bg-muted flex items-center justify-center">
                {displayImg ? (
                  <img src={ImageSize.ADMIN_COVER(displayImg)} alt={cat} className="w-full h-full object-cover" loading="lazy" decoding="async" />
                ) : (
                  <div className="text-muted-foreground/40 flex flex-col items-center gap-1">
                    <ImageIcon className="w-10 h-10" />
                    <span className="text-xs font-body">Sin imagen</span>
                  </div>
                )}
                {customCover && (
                  <span className="absolute top-2 left-2 px-2 py-0.5 bg-primary/80 text-primary-foreground text-[10px] font-body font-bold uppercase tracking-wider rounded">
                    Personalizada
                  </span>
                )}
                {!customCover && fallbackImg && (
                  <span className="absolute top-2 left-2 px-2 py-0.5 bg-muted-foreground/60 text-white text-[10px] font-body font-bold uppercase tracking-wider rounded">
                    Automática
                  </span>
                )}
                {isUploading && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  </div>
                )}
              </div>
              <div className="p-3 flex items-center justify-between">
                <span className="font-body font-semibold text-sm text-foreground">{cat}</span>
                <div className="flex items-center gap-2">
                  {customCover && (
                    <button
                      onClick={() => removeCover(cat)}
                      className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-body font-bold uppercase tracking-wider border border-border text-muted-foreground hover:text-destructive hover:border-destructive rounded-md transition-colors"
                      title="Eliminar portada personalizada"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  )}
                  <button
                    onClick={() => handleFileSelect(cat)}
                    disabled={isUploading}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-body font-bold uppercase tracking-wider border border-border text-muted-foreground hover:text-primary hover:border-primary rounded-md transition-colors disabled:opacity-50"
                  >
                    <Upload className="w-3 h-3" />
                    {customCover ? "Cambiar" : "Subir"}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CategoryCoversManager;
