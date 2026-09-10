-- Auditoría de RLS: ¿hay policies que le den escritura al público?
--
-- Corré esto en el SQL Editor cada tanto, y sobre todo después de que Lovable
-- toque la base: regenera policies solas y puede reabrir lo que cerramos.
--
-- Lo esperado tras el lockdown:
--   * products / category_covers: SELECT para anon (solo visible = true),
--     INSERT/UPDATE/DELETE solo para authenticated.
--   * NINGUNA fila marcada 'REVISAR' abajo.

SELECT
  schemaname,
  tablename,
  policyname,
  cmd,
  roles,
  CASE
    WHEN cmd <> 'SELECT'
     AND (roles::text[] && ARRAY['public','anon'])
    THEN 'REVISAR: escritura pública'
    ELSE 'ok'
  END AS estado
FROM pg_policies
WHERE (schemaname = 'public' AND tablename IN ('products', 'category_covers'))
   OR (schemaname = 'storage' AND tablename = 'objects')
ORDER BY estado DESC, tablename, cmd, policyname;
