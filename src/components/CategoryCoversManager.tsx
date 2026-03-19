import { useState, useEffect, useRef } from "react";
import { Upload, X, ImageIcon } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { CATEGORIES } from "@/lib/productStore";
import { uploadImage } from "@/lib/productStore";
import { compressImage, formatBytes } from "@/lib/imageCompressor";
import { toast } from "@/hooks/use-toast";

interface CategoryCover {
  category: string;
  image_url: string;
}

const CategoryCoversManager = () => {
  const [covers, setCovers] = useState<Record<string, string>>({});
  const [uploading, setUploading] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  useEffect(() => {
    fetchCovers();
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

      // Upsert into category_covers
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
      toast({ title: `Portada de "${category}" eliminada` });
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="bg-card border border-border rounded-lg p-6">
      <h2 className="font-display text-xl text-foreground mb-1">Portadas de Categorías</h2>
      <p className="font-body text-sm text-muted-foreground mb-6">
        Elegí la foto de portada para cada sección del catálogo en la página de inicio.
      </p>

      <input
        ref={fileInputRef}
        type="file"
        accept=".jpg,.jpeg,.png,.webp"
        className="hidden"
        onChange={handleFileChange}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {CATEGORIES.map((cat) => {
          const coverUrl = covers[cat];
          const isUploading = uploading === cat;

          return (
            <div key={cat} className="border border-border rounded-lg overflow-hidden">
              <div className="relative h-36 bg-muted flex items-center justify-center">
                {coverUrl ? (
                  <>
                    <img src={coverUrl} alt={cat} className="w-full h-full object-cover" />
                    <button
                      onClick={() => removeCover(cat)}
                      className="absolute top-2 right-2 p-1 bg-black/60 rounded-full hover:bg-black/80 transition-colors"
                      title="Eliminar portada"
                    >
                      <X className="w-3.5 h-3.5 text-white" />
                    </button>
                  </>
                ) : (
                  <div className="text-muted-foreground/40 flex flex-col items-center gap-1">
                    <ImageIcon className="w-8 h-8" />
                    <span className="text-xs font-body">Sin portada</span>
                  </div>
                )}
                {isUploading && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  </div>
                )}
              </div>
              <div className="p-3 flex items-center justify-between">
                <span className="font-body font-semibold text-sm text-foreground">{cat}</span>
                <button
                  onClick={() => handleFileSelect(cat)}
                  disabled={isUploading}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-body font-bold uppercase tracking-wider border border-border text-muted-foreground hover:text-primary hover:border-primary rounded-md transition-colors disabled:opacity-50"
                >
                  <Upload className="w-3 h-3" />
                  {coverUrl ? "Cambiar" : "Subir"}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CategoryCoversManager;
