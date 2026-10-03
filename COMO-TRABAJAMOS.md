# Cómo trabajamos

`main` **es lo que está en línea.** Vercel (la web) y Railway (el backend)
despliegan `main` solos, sin preguntar: lo que entra a `main` lo ven los
inversionistas en `www.zequara.com` un par de minutos después.

Por eso nada entra a `main` directo. Todo cambio pasa por una rama, se prueba
en su propia URL y entra por un Pull Request con las pruebas en verde.

## El recorrido de un cambio

```
main ──┬─────────────────────────────●── (despliega a www.zequara.com)
       │                            ╱
       └── feat/favicon ──●──●──●──╯  Pull Request: pruebas ✓ + revisión ✓
                          │
                          └─ Vercel publica una URL de prueba por cada push
```

1. **Rama nueva desde `main`**, con un nombre que diga qué es:

   ```bash
   git checkout main
   git pull
   git checkout -b feat/login-inversionistas
   ```

   | Prefijo  | Para qué                                   | Ejemplo                      |
   |----------|--------------------------------------------|------------------------------|
   | `feat/`  | algo nuevo                                  | `feat/politica-privacidad`   |
   | `fix/`   | arreglar algo roto                          | `fix/footer-movil`           |
   | `chore/` | mantenimiento que no cambia lo que se ve    | `chore/actualizar-next`      |
   | `sec/`   | seguridad                                   | `sec/rls-tablas-nuevas`      |

2. **Commits y push de la rama.** Se puede subir cuantas veces haga falta:
   `main` no se entera.

   ```bash
   git push -u origin feat/login-inversionistas
   ```

3. **Revisar la URL de prueba.** Vercel publica la rama en una dirección propia
   (sale en el Pull Request y en Vercel → Deployments). Ahí se revisa en
   computador y en celular.

4. **Pull Request a `main`** en GitHub. GitHub corre las pruebas solo
   (`.github/workflows/pruebas.yml`): las del backend y el build del
   frontend. Si algo sale en rojo, se arregla en la misma rama.

5. **Fusionar** ("Squash and merge"). Vercel y Railway despliegan.

6. **Mirar `www.zequara.com`.** Si algo salió mal, no se arregla a las
   carreras: se vuelve atrás y se corrige con calma en otra rama.
   - Web: Vercel → Deployments → el despliegue anterior → **Instant Rollback**.
   - Backend: Railway → Deployments → el anterior → **Redeploy**.

## Mientras no haya entorno de pruebas propio

Hoy las URLs de prueba de Vercel hablan con **el mismo backend y la misma base
que producción**. Para cambios de la web (textos, diseño, páginas) no importa.
Pero en una URL de prueba **la consola escribe en la base real**: decidir,
publicar o borrar ahí es hacerlo de verdad.

## Cambios en la base de datos

- Cada cambio va en un `.sql` dentro de `database/`, en el mismo PR que el
  código que lo necesita.
- Se aplica a mano en Supabase → SQL Editor, **antes** de fusionar si el código
  nuevo lo necesita para arrancar.
- Nada de escribir `CREATE TABLE …` dentro de un texto entre comillas: el
  editor de Supabase lo confunde con una orden real y el script entero falla.
- Toda tabla nueva nace con RLS (lo hace solo el disparador de
  `database/cerrar_zequara.sql`). No se le dan permisos a `anon` ni a
  `authenticated`: el backend no los necesita.

## Probar en local antes de subir

```bash
cd backend  && .venv/Scripts/python.exe -m pytest tests -q
cd frontend && npx tsc --noEmit
```

Son las mismas pruebas que corre GitHub, así que si pasan aquí, pasan allí.

## Secretos

Nunca en el repositorio ni en un chat. Viven en las variables de Vercel y de
Railway, y en local en `backend/.env` y `frontend/.env.local` (ignorados por
git). Si uno se filtra, se cambia en los dos lados: un secreto que salió ya no
es secreto.
