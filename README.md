# Welcome to your Lovable project

## Project info

**URL**: https://lovable.dev/projects/REPLACE_WITH_PROJECT_ID

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/REPLACE_WITH_PROJECT_ID) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/REPLACE_WITH_PROJECT_ID) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/features/custom-domain#custom-domain)

## Rendimiento de imágenes y deploy

### Rewrite SPA en Vercel
`vercel.json` reescribe todas las rutas a `index.html`. Sin eso, entrar directo a
`/catalogo` (o refrescar ahí) devuelve el 404 de Vercel, porque el routing es
client-side y el archivo no existe en disco.

### Imágenes
Las imágenes de producto se sirven vía el endpoint de transformación de Supabase
(`/storage/v1/render/image/public/...`) usando `optimizedImageUrl()` en
`src/lib/imageUrl.ts`. Supabase redimensiona y entrega WebP al vuelo: una PNG de
3.4MB baja a ~20KB, sin volver a subir nada.

`uploadImage()` en `src/lib/productStore.ts` comprime cualquier archivo de más de
600KB antes de subirlo, así que ninguna ruta de carga puede reintroducir
originales de varios MB.

### Migración de imágenes viejas
El catálogo original se cargó antes de que existiera la compresión, así que
algunos objetos son tan grandes que Supabase ni siquiera puede transformarlos
(devuelve `source image ... too large to process`). Para esos, `LazyImage` cae de
vuelta al original, pero conviene recomprimirlos de raíz:

```bash
npm i -D sharp
SUPABASE_SERVICE_ROLE_KEY=xxx node scripts/recompress-images.mjs --dry-run
SUPABASE_SERVICE_ROLE_KEY=xxx node scripts/recompress-images.mjs
```

### Variables de entorno
`.env` ya no se versiona (ver `.env.example`). Las variables `VITE_*` van
configuradas en el panel de Vercel; sin ellas el build sale sin credenciales y
el catálogo no carga.

## Administración y seguridad

El panel `/admin` usa **Supabase Auth** (email + contraseña). Antes comparaba
contra un usuario y contraseña escritos en `src/lib/adminAuth.ts`, que viajaban
en el bundle JS y no protegían nada: todas las escrituras salían igual con la
clave pública `anon`.

Las policies de RLS (ver `supabase/migrations/*_lock_down_rls.sql`) ahora dan:

- `anon` → solo lectura de productos publicados e imágenes públicas
- `authenticated` → escritura completa (el panel de admin)

Para crear el usuario admin: **Supabase → Authentication → Users → Add user**,
con "Auto Confirm User" tildado.

La clave `anon` es pública por diseño (va en el bundle); lo que protege los datos
son las policies, no la clave.
