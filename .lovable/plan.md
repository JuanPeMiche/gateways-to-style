# Agregar "Canguros" como nueva categoría

Sí, se puede. Las portadas ya se pueden editar hoy desde el panel admin → "Portadas de categorías" (subir / cambiar / eliminar imagen por categoría), así que eso ya funciona igual para Canguros una vez que la agreguemos.

## Cambios

1. **`src/lib/productStore.ts`**
   Agregar `"Canguros"` al array `CATEGORIES`. Esto la habilita en:
   - El selector de categoría al crear/editar producto en el admin
   - La grilla del panel "Portadas de categorías" (podrás subir su portada igual que las demás)
   - Los filtros del catálogo

2. **`src/components/ProductsSection.tsx`** (home)
   Agregar una entrada en `categoryMeta` para Canguros con:
   - `name: "Canguros"`
   - `description`: una línea corta (ej: "Canguros con diseños anime, gaming y arte urbano.")
   - `icon`: un ícono de `lucide-react` (sugiero `Shirt` igual que Remeras, o si preferís te busco uno tipo `ShoppingBag`)

   Recordá que en la home solo aparecen categorías con al menos 1 producto publicado, así que Canguros se va a mostrar automáticamente cuando subas el primero (o cuando le pongas portada + producto).

3. **Portadas** — no hay que tocar código: una vez agregada la categoría, andá a Admin → Portadas de categorías y vas a ver la tarjeta de "Canguros" lista para subirle imagen, igual que el resto. Y desde ahí también podés cambiar/eliminar las portadas actuales de Remeras, Mousepads, etc.

## Preguntas rápidas antes de implementar

- ¿La querés ubicar al lado de Remeras en el orden, o al final?
- ¿Texto de descripción para la home? (si no, uso uno genérico)
- ¿Algún ícono preferido o uso uno parecido al de Remeras?
