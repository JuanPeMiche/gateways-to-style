import { useState, useRef, useCallback } from "react";
import { Upload, X, Image as ImageIcon, Loader2 } from "lucide-react";
import { addProduct, CATEGORIES, type ProductCategory } from "@/lib/productStore";
import { toast } from "@/hooks/use-toast";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";

const MAX_BULK = 30;
const MAX_SIZE = 10 * 1024 * 1024;
const ACCEPTED = ["image/jpeg", "image/png", "image/webp"];

interface BulkUploadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onComplete: () => void;
}

interface PendingFile {
  file: File;
  preview: string;
  name: string;
}

const BulkUploadDialog = ({ open, onOpenChange, onComplete }: BulkUploadDialogProps) => {
  const [pending, setPending] = useState<PendingFile[]>([]);
  const [category, setCategory] = useState<ProductCategory>("Remeras");
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const reset = () => {
    setPending([]);
    setCategory("Remeras");
    setUploading(false);
    setProgress(0);
    setDragOver(false);
  };

  const handleClose = (o: boolean) => {
    if (!o && !uploading) {
      // Revoke object URLs
      pending.forEach((p) => URL.revokeObjectURL(p.preview));
      reset();
      onOpenChange(false);
    }
  };

  const processFiles = useCallback((files: FileList | null) => {
    if (!files) return;
    const remaining = MAX_BULK - pending.length;
    if (remaining <= 0) {
      toast({ title: "Límite alcanzado", description: `Máximo ${MAX_BULK} imágenes por lote`, variant: "destructive" });
      return;
    }

    const valid: PendingFile[] = [];
    const arr = Array.from(files).slice(0, remaining);

    for (const file of arr) {
      if (!ACCEPTED.includes(file.type)) {
        toast({ title: "Formato no soportado", description: `${file.name} — solo JPG, PNG, WEBP`, variant: "destructive" });
        continue;
      }
      if (file.size > MAX_SIZE) {
        toast({ title: "Archivo muy grande", description: `${file.name} — máximo 10MB`, variant: "destructive" });
        continue;
      }
      // Derive a clean name from filename
      const cleanName = file.name
        .replace(/\.[^/.]+$/, "") // remove extension
        .replace(/[_-]/g, " ")   // replace _ and - with spaces
        .replace(/\s+/g, " ")    // collapse spaces
        .trim();

      valid.push({
        file,
        preview: URL.createObjectURL(file),
        name: cleanName || "Producto sin nombre",
      });
    }

    if (valid.length > 0) {
      setPending((prev) => [...prev, ...valid]);
    }
  }, [pending.length]);

  const removeFile = (idx: number) => {
    setPending((prev) => {
      URL.revokeObjectURL(prev[idx].preview);
      return prev.filter((_, i) => i !== idx);
    });
  };

  const compressImage = (file: File, maxDim = 800, quality = 0.7): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onerror = reject;
      reader.onload = () => {
        const img = new Image();
        img.onerror = reject;
        img.onload = () => {
          let { width, height } = img;
          if (width > maxDim || height > maxDim) {
            const ratio = Math.min(maxDim / width, maxDim / height);
            width = Math.round(width * ratio);
            height = Math.round(height * ratio);
          }
          const canvas = document.createElement("canvas");
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d")!;
          ctx.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL("image/jpeg", quality));
        };
        img.src = reader.result as string;
      };
      reader.readAsDataURL(file);
    });

  const handleBulkCreate = async () => {
    if (pending.length === 0) return;
    setUploading(true);
    setProgress(0);

    let created = 0;
    for (let i = 0; i < pending.length; i++) {
      try {
        const dataUrl = await readFileAsDataURL(pending[i].file);
        addProduct({
          name: pending[i].name,
          category,
          description: "",
          price: null,
          images: [dataUrl],
          visible: false, // Hidden by default so admin can edit before publishing
        });
        created++;
      } catch {
        console.error(`Error processing ${pending[i].file.name}`);
      }
      setProgress(Math.round(((i + 1) / pending.length) * 100));
    }

    toast({
      title: "Carga masiva completada",
      description: `${created} producto${created !== 1 ? "s" : ""} creado${created !== 1 ? "s" : ""} como ocultos. Editá cada uno para completar su info.`,
    });

    pending.forEach((p) => URL.revokeObjectURL(p.preview));
    reset();
    onOpenChange(false);
    onComplete();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-card border-border">
        <DialogHeader>
          <DialogTitle className="font-display text-xl">Carga masiva de productos</DialogTitle>
          <DialogDescription className="font-body text-muted-foreground text-sm">
            Subí hasta {MAX_BULK} imágenes. Se creará un producto por imagen, oculto por defecto para que lo edites después.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Category selector */}
          <div>
            <label className="font-body text-sm text-muted-foreground">Categoría para todos los productos</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as ProductCategory)}
              disabled={uploading}
              className="w-full mt-1 bg-input border border-border rounded-md px-3 py-2 font-body text-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors disabled:opacity-50"
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {/* Drop zone */}
          <div
            onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); setDragOver(true); }}
            onDragLeave={(e) => { e.preventDefault(); e.stopPropagation(); setDragOver(false); }}
            onDrop={(e) => { e.preventDefault(); e.stopPropagation(); setDragOver(false); processFiles(e.dataTransfer.files); }}
            onClick={() => !uploading && fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              uploading ? "opacity-50 cursor-not-allowed" : "cursor-pointer hover:border-primary/50"
            } ${dragOver ? "border-primary bg-primary/5" : "border-border"}`}
          >
            <Upload className="w-10 h-10 mx-auto mb-3 text-muted-foreground/50" />
            <p className="font-body text-sm text-muted-foreground">
              Arrastrá hasta {MAX_BULK} imágenes o hacé clic para buscar
            </p>
            <p className="font-body text-xs text-muted-foreground/60 mt-1">JPG, PNG, WEBP — máx 10MB cada una</p>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept=".jpg,.jpeg,.png,.webp"
            multiple
            className="hidden"
            onChange={(e) => { processFiles(e.target.files); if (e.target) e.target.value = ""; }}
          />

          {/* Pending count */}
          {pending.length > 0 && (
            <div className="flex items-center justify-between">
              <p className="font-body text-sm text-foreground font-semibold">
                {pending.length} imagen{pending.length !== 1 ? "es" : ""} seleccionada{pending.length !== 1 ? "s" : ""}
              </p>
              {!uploading && (
                <button
                  onClick={() => { pending.forEach((p) => URL.revokeObjectURL(p.preview)); setPending([]); }}
                  className="font-body text-xs text-destructive hover:text-destructive/80 transition-colors"
                >
                  Quitar todas
                </button>
              )}
            </div>
          )}

          {/* Thumbnails grid */}
          {pending.length > 0 && (
            <div className="grid grid-cols-5 sm:grid-cols-6 md:grid-cols-8 gap-2 max-h-[250px] overflow-y-auto pr-1">
              {pending.map((p, i) => (
                <div key={i} className="relative aspect-square rounded overflow-hidden border border-border group">
                  <img src={p.preview} alt={p.name} className="w-full h-full object-cover" />
                  {!uploading && (
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); removeFile(i); }}
                      className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"
                    >
                      <X className="w-4 h-4 text-white" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Progress bar */}
          {uploading && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-primary" />
                <span className="font-body text-sm text-muted-foreground">
                  Procesando... {progress}%
                </span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
          )}
        </div>

        <DialogFooter className="mt-4">
          <button
            type="button"
            onClick={() => handleClose(false)}
            disabled={uploading}
            className="px-4 py-2 font-body text-sm text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            onClick={handleBulkCreate}
            disabled={pending.length === 0 || uploading}
            className="px-6 py-2 bg-primary text-primary-foreground font-body font-bold text-sm uppercase tracking-wider rounded-md hover:bg-primary/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {uploading ? "Procesando..." : `Crear ${pending.length} producto${pending.length !== 1 ? "s" : ""}`}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default BulkUploadDialog;
