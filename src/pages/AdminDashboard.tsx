import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  Plus, Pencil, Trash2, ExternalLink, LogOut, Eye, EyeOff,
  Upload, X, Image as ImageIcon, UploadCloud,
} from "lucide-react";
import BulkUploadDialog from "@/components/BulkUploadDialog";
import { isAuthenticated, logout } from "@/lib/adminAuth";
import {
  getProducts, addProduct, updateProduct, deleteProduct, uploadImage,
  CATEGORIES, type Product, type ProductCategory,
} from "@/lib/productStore";
import logoImage from "@/assets/logo-gate01.png";
import { toast } from "@/hooks/use-toast";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";

const MAX_IMAGES = 5;
const MAX_SIZE = 10 * 1024 * 1024;
const ACCEPTED = ["image/jpeg", "image/png", "image/webp"];

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [filter, setFilter] = useState<string>("Todos");
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [deleting, setDeleting] = useState<Product | null>(null);
  const [bulkOpen, setBulkOpen] = useState(false);

  // Form state
  const [name, setName] = useState("");
  const [category, setCategory] = useState<ProductCategory>("Remeras");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [visible, setVisible] = useState(true);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isAuthenticated()) {
      navigate("/admin", { replace: true });
      return;
    }
    getProducts().then(setProducts).catch(console.error);
  }, [navigate]);

  const reload = useCallback(() => {
    getProducts().then(setProducts).catch(console.error);
  }, []);

  const filtered = filter === "Todos" ? products : products.filter((p) => p.category === filter);

  const handleLogout = () => {
    logout();
    navigate("/admin", { replace: true });
  };

  // Form helpers
  const resetForm = () => {
    setName("");
    setCategory("Remeras");
    setDescription("");
    setPrice("");
    setImages([]);
    setVisible(true);
    setFormErrors({});
    setEditing(null);
  };

  const openAdd = () => {
    resetForm();
    setFormOpen(true);
  };

  const openEdit = (p: Product) => {
    setEditing(p);
    setName(p.name);
    setCategory(p.category);
    setDescription(p.description);
    setPrice(p.price !== null ? String(p.price) : "");
    setImages(p.images);
    setVisible(p.visible);
    setFormErrors({});
    setFormOpen(true);
  };

  const handleFiles = (files: FileList | null) => {
    if (!files) return;
    const remaining = MAX_IMAGES - images.length;
    const toProcess = Array.from(files).slice(0, remaining);

    toProcess.forEach((file) => {
      if (!ACCEPTED.includes(file.type)) {
        toast({ title: "Formato no soportado", description: "Solo JPG, PNG y WEBP", variant: "destructive" });
        return;
      }
      if (file.size > MAX_SIZE) {
        toast({ title: "Archivo muy grande", description: "Máximo 5MB por imagen", variant: "destructive" });
        return;
      }
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setImages((prev) => (prev.length < MAX_IMAGES ? [...prev, result] : prev));
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (idx: number) => {
    setImages((prev) => prev.filter((_, i) => i !== idx));
  };

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (!name.trim()) errs.name = "El nombre es obligatorio";
    if (price && (isNaN(Number(price)) || Number(price) < 0)) errs.price = "Precio inválido";
    if (description.length > 120) errs.description = "Máximo 120 caracteres";
    setFormErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSave = () => {
    if (!validate()) return;
    const data = {
      name: name.trim(),
      category,
      description: description.trim(),
      price: price ? Number(price) : null,
      images,
      visible,
    };
    if (editing) {
      updateProduct(editing.id, data);
      toast({ title: "Producto actualizado" });
    } else {
      addProduct(data);
      toast({ title: "Producto agregado" });
    }
    setFormOpen(false);
    resetForm();
    reload();
  };

  const handleDelete = () => {
    if (!deleting) return;
    deleteProduct(deleting.id);
    toast({ title: "Producto eliminado" });
    setDeleting(null);
    reload();
  };

  const toggleVisibility = (p: Product) => {
    updateProduct(p.id, { visible: !p.visible });
    toast({ title: p.visible ? "Producto ocultado" : "Producto publicado" });
    reload();
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Top bar */}
      <header className="border-b border-border bg-card sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <img src={logoImage} alt="Gate01" className="h-[38px] w-auto" />
            <span className="hidden sm:block font-body text-sm text-muted-foreground uppercase tracking-wider">
              Panel de Administración
            </span>
          </div>
          <div className="flex items-center gap-3">
            <a
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-sm text-secondary hover:text-secondary/80 font-body transition-colors"
            >
              Ver sitio <ExternalLink className="w-3.5 h-3.5" />
            </a>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm border border-border text-muted-foreground hover:text-destructive hover:border-destructive font-body transition-colors rounded-md"
            >
              <LogOut className="w-3.5 h-3.5" /> Cerrar sesión
            </button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Title + Add */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <h1 className="font-display text-3xl text-foreground">Gestión de Productos</h1>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setBulkOpen(true)}
              className="flex items-center gap-2 px-5 py-2.5 border border-secondary text-secondary font-body font-bold text-sm uppercase tracking-wider rounded-md hover:bg-secondary hover:text-secondary-foreground transition-colors"
            >
              <UploadCloud className="w-4 h-4" /> Carga masiva
            </button>
            <button
              onClick={openAdd}
              className="flex items-center gap-2 px-5 py-2.5 bg-secondary text-secondary-foreground font-body font-bold text-sm uppercase tracking-wider rounded-md hover:bg-secondary/80 transition-colors"
            >
              <Plus className="w-4 h-4" /> Agregar producto
            </button>
          </div>
        </div>

        {/* Category tabs */}
        <div className="flex flex-wrap gap-2 mb-8">
          {["Todos", ...CATEGORIES].map((cat) => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`px-4 py-1.5 font-body font-bold text-xs uppercase tracking-wider rounded-full border transition-all ${
                filter === cat
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-transparent text-muted-foreground border-border hover:border-secondary hover:text-secondary"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Product list */}
        {filtered.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground font-body">
            <ImageIcon className="w-10 h-10 mx-auto mb-3 opacity-40" />
            <p>No hay productos en esta categoría</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-border text-muted-foreground font-body text-xs uppercase tracking-wider">
                  <th className="pb-3 pr-4">Imagen</th>
                  <th className="pb-3 pr-4">Nombre</th>
                  <th className="pb-3 pr-4 hidden sm:table-cell">Categoría</th>
                  <th className="pb-3 pr-4 hidden md:table-cell">Precio</th>
                  <th className="pb-3 pr-4">Estado</th>
                  <th className="pb-3">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((p) => (
                  <tr key={p.id} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                    <td className="py-3 pr-4">
                      <div className="w-12 h-12 rounded bg-muted flex items-center justify-center overflow-hidden">
                        {p.images.length > 0 ? (
                          <img src={p.images[0]} alt={p.name} className="w-full h-full object-cover" />
                        ) : (
                          <ImageIcon className="w-5 h-5 text-muted-foreground/40" />
                        )}
                      </div>
                    </td>
                    <td className="py-3 pr-4 font-body font-semibold text-foreground">{p.name}</td>
                    <td className="py-3 pr-4 hidden sm:table-cell font-body text-sm text-muted-foreground">
                      {p.category}
                    </td>
                    <td className="py-3 pr-4 hidden md:table-cell font-body text-sm text-muted-foreground">
                      {p.price !== null ? `$${p.price}` : "—"}
                    </td>
                    <td className="py-3 pr-4">
                      <button
                        onClick={() => toggleVisibility(p)}
                        className={`flex items-center gap-1 text-xs font-body font-bold uppercase tracking-wider px-2 py-1 rounded-full border transition-colors ${
                          p.visible
                            ? "text-secondary border-secondary/40"
                            : "text-muted-foreground border-border"
                        }`}
                      >
                        {p.visible ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                        {p.visible ? "Publicado" : "Oculto"}
                      </button>
                    </td>
                    <td className="py-3">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => openEdit(p)}
                          className="p-1.5 text-muted-foreground hover:text-primary transition-colors"
                          title="Editar"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeleting(p)}
                          className="p-1.5 text-muted-foreground hover:text-destructive transition-colors"
                          title="Eliminar"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add/Edit modal */}
      <Dialog open={formOpen} onOpenChange={(o) => { if (!o) { setFormOpen(false); resetForm(); } }}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto bg-card border-border">
          <DialogHeader>
            <DialogTitle className="font-display text-xl">
              {editing ? "Editar producto" : "Agregar producto"}
            </DialogTitle>
            <DialogDescription className="font-body text-muted-foreground text-sm">
              {editing ? "Modificá los datos del producto." : "Completá los datos del nuevo producto."}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Name */}
            <div>
              <label className="font-body text-sm text-muted-foreground">Nombre del producto *</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full mt-1 bg-input border border-border rounded-md px-3 py-2 font-body text-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
              />
              {formErrors.name && <p className="text-destructive text-xs mt-1 font-body">{formErrors.name}</p>}
            </div>

            {/* Category */}
            <div>
              <label className="font-body text-sm text-muted-foreground">Categoría *</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as ProductCategory)}
                className="w-full mt-1 bg-input border border-border rounded-md px-3 py-2 font-body text-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            {/* Description */}
            <div>
              <label className="font-body text-sm text-muted-foreground">
                Descripción corta ({description.length}/120)
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value.slice(0, 120))}
                rows={2}
                className="w-full mt-1 bg-input border border-border rounded-md px-3 py-2 font-body text-foreground resize-none focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
              />
              {formErrors.description && <p className="text-destructive text-xs mt-1 font-body">{formErrors.description}</p>}
            </div>

            {/* Price */}
            <div>
              <label className="font-body text-sm text-muted-foreground">Precio en UYU</label>
              <input
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                min="0"
                step="1"
                className="w-full mt-1 bg-input border border-border rounded-md px-3 py-2 font-body text-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
                placeholder="Opcional"
              />
              {formErrors.price && <p className="text-destructive text-xs mt-1 font-body">{formErrors.price}</p>}
            </div>

            {/* Images */}
            <div>
              <label className="font-body text-sm text-muted-foreground">
                Imágenes ({images.length}/{MAX_IMAGES})
              </label>
              <div
                onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); }}
                onDrop={(e) => { e.preventDefault(); e.stopPropagation(); handleFiles(e.dataTransfer.files); }}
                onClick={() => fileInputRef.current?.click()}
                className="mt-1 border-2 border-dashed border-border rounded-lg p-6 text-center cursor-pointer hover:border-primary/50 transition-colors"
              >
                <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground/50" />
                <p className="font-body text-sm text-muted-foreground">
                  Arrastrá imágenes o hacé clic para buscar
                </p>
                <p className="font-body text-xs text-muted-foreground/60 mt-1">JPG, PNG, WEBP — máx 5MB</p>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept=".jpg,.jpeg,.png,.webp"
                multiple
                className="hidden"
                onChange={(e) => handleFiles(e.target.files)}
              />
              {images.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {images.map((img, i) => (
                    <div key={i} className="relative w-16 h-16 rounded overflow-hidden border border-border group">
                      <img src={img} alt="" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); removeImage(i); }}
                        className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"
                      >
                        <X className="w-4 h-4 text-white" />
                      </button>
                      {i === 0 && (
                        <span className="absolute bottom-0 left-0 right-0 bg-primary/80 text-[9px] text-center text-primary-foreground font-body">
                          Principal
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Visibility */}
            <div className="flex items-center justify-between">
              <span className="font-body text-sm text-muted-foreground">Visible en el sitio</span>
              <button
                type="button"
                onClick={() => setVisible(!visible)}
                className={`relative w-11 h-6 rounded-full transition-colors ${
                  visible ? "bg-secondary" : "bg-muted"
                }`}
              >
                <span
                  className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                    visible ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
            </div>
          </div>

          <DialogFooter className="mt-4">
            <button
              type="button"
              onClick={() => { setFormOpen(false); resetForm(); }}
              className="px-4 py-2 font-body text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleSave}
              className="px-6 py-2 bg-primary text-primary-foreground font-body font-bold text-sm uppercase tracking-wider rounded-md hover:bg-primary/80 transition-colors"
            >
              Guardar producto
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete confirmation */}
      <Dialog open={!!deleting} onOpenChange={(o) => { if (!o) setDeleting(null); }}>
        <DialogContent className="max-w-sm bg-card border-border">
          <DialogHeader>
            <DialogTitle className="font-display text-lg">Eliminar producto</DialogTitle>
            <DialogDescription className="font-body text-muted-foreground">
              ¿Estás seguro que querés eliminar <strong className="text-foreground">{deleting?.name}</strong>?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <button
              onClick={() => setDeleting(null)}
              className="px-4 py-2 border border-border text-muted-foreground font-body text-sm rounded-md hover:text-foreground transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleDelete}
              className="px-4 py-2 bg-destructive text-destructive-foreground font-body font-bold text-sm uppercase tracking-wider rounded-md hover:bg-destructive/80 transition-colors"
            >
              Eliminar
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Bulk upload */}
      <BulkUploadDialog open={bulkOpen} onOpenChange={setBulkOpen} onComplete={reload} />
    </div>
  );
};

export default AdminDashboard;
