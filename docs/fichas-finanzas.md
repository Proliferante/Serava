# Finanzas automáticas de la ficha del predio

Rama `feat/fichas-finanzas-automaticas` · David (análisis de datos) · 29-sep-2026

## Qué resuelve

En la reunión del 28-sep Paola dijo: «la creación de fichas ya está, pero falta la parte financiera.
¿Cómo se logran estas tablas? ¿Con qué datos?». La pestaña Finanzas tiene unas cuarenta cifras (TIR por
escenario, renta, rango de arriendo, proyección año a año, payback…) que había que calcular aparte y
copiar a mano. Con esta rama, al armar la ficha:

1. Paola entra a **Flujo de inmuebles → Visita agendada → «Continúa · armar ficha»** (o «Editar ficha» en Publicados).
2. Arriba del formulario aparece **«Calcular finanzas con el modelo»**. Ya trae lo que dice el anuncio
   (zona, tipo, área, precio, administración). Ella corrige lo que sepa distinto, sobre todo el
   **precio negociado** y el **costo de obra**, y pulsa **Calcular**.
3. Ve el resumen (inversión, TIR de los 3 escenarios, múltiplo, renta, score), una lista de **avisos** para
   revisar antes de publicar y las **fuentes** de cada dato.
4. **«Pasar al formulario»** llena 63 campos de Cabecera, Oportunidad y Finanzas. Si alguno ya tenía otra
   cifra, se pide confirmación antes de reemplazarla. Después es el flujo de siempre: revisar, **Guardar
   borrador** o **Publicar**.

Calcular **no escribe nada en la base**. Los titulares, las fotos, el «activo difícil de replicar» y la
propuesta de transformación no se tocan.

## Qué cambió

| Dónde | Cambio |
|---|---|
| `backend/app/services/fichas/` | **Nuevo.** El modelo de las fichas del evento, sin pandas: `modelo.py` (finanzas), `score.py` + `score_modelo.py` + `zonas_score.json` (Score Zequara de predio v0.2), `macro.py` (CDT e IPC en vivo), `redactar.py` (del resultado a las claves del esquema), `mercado_referencia.json` (fotografía de mercado). |
| `backend/app/api/flujo.py` | `POST /api/admin/flujo/ficha/calcular` (nuevo). `GET /ficha` devuelve además `calculo_base` y `calculo_zonas`. `_lee_detalle` lee también `tipo_inmueble`, `administracion` y `dentro_poligono_real` de `clean_listings`. |
| `frontend/components/admin/ficha/CalcularFinanzas.tsx` | **Nuevo.** El panel de la consola. |
| `frontend/components/admin/views/ArmarFicha.tsx` | Monta el panel y aplica sus cifras al formulario. |
| `frontend/components/admin/ficha/esquema.ts` | Campos nuevos `ft_cdt_referencia` y `ft_supuestos` (no se renombró ninguna clave). Títulos: «rentabilidad del arriendo», «escenarios de TIR frente al CDT», «escenario alto». |
| `frontend/components/predios/ficha/Finanzas.tsx` y `responsive/.../FinanzasCompact.tsx` | Los ajustes de Paola del 28-sep: «Rentabilidad del arriendo» (antes «Rentabilidad detallada»); la tabla de comparación lleva los **3 escenarios** del activo y el **CDT va debajo como referencia**; «Comparación con el CDT»; el supuesto de IPC bajo la proyección. Corregido: el rango de arriendo decía siempre «(320 m²)», ahora usa el área del predio. |
| `backend/tests/test_fichas_*.py` | 15 pruebas. La principal comprueba que con SN001–SN004 se obtienen **las mismas cifras** que las fichas locales que Paola aprobó (inversión, TIR, múltiplo, renta, score). |

## Datos y supuestos

- **Mercado:** la base de producción solo tiene anuncios de venta, sin arriendos ni antigüedad. Por eso
  el modelo lee `mercado_referencia.json`: venta, venta en estado remodelado y arriendo por
  zona × tipo × tamaño, con fecha y fuente.
  - La Cabrera, Chicó y El Poblado vienen del 27-sep, con antigüedad.
  - El Retiro, Laureles, Centro Histórico y Getsemaní vienen del 13-sep, sin antigüedad; el valor remodelado usa todas las antigüedades y la consola lo avisa.
  - Panamá no está: la moneda y el modelo son colombianos.
  - La fotografía se genera con `tarea_8dias/fichas_evento/exportar_mercado_referencia.py`, que está en la carpeta de David y no en el repo.
  - **Cuando el Motor de Inteligencia escriba la fotografía semanal en la base, este JSON se reemplaza por una consulta.**
- **CDT:** Superfinanciera (formato 441, datos.gov.co). Es el promedio ponderado de los bancos a 360 días en los últimos 5 cortes: **12,03 %** al 29-sep.
- **IPC:** DANE, vía la API del Banco de la República: **6,24 %** (agosto de 2026), constante 5 años.
- **Escenarios:** valorización = (1 + IPC)(1 + prima real) − 1, con primas −2 / 0 / +2 %. Arriendo y gastos crecen con el IPC.
- **Si no hay red:** CDT e IPC salen de la caché (12 h y 7 días) y, en último caso, de `macro_respaldo.json`. La consola dice de dónde salió cada dato.
  - El servidor del BanRep no envía su certificado intermedio. El código descarga el oficial de DigiCert y verifica igual; **no desactiva la verificación TLS**.
  - Con `FICHAS_MACRO_EN_VIVO=0` no se sale a internet (así corren las pruebas).
- **Score:** sin visita, las características arquitectónicas valen neutro y los gates quedan «Por validar».
  - Las notas de zona oficiales son solo las de La Cabrera; las de Chicó y El Poblado son estimadas. Para las demás zonas **no se calcula score** y la consola lo avisa.
  - El veto por polígono usa `dentro_poligono_real`.
- **Costo de obra en Medellín:** sigue pendiente de arquitectura. Si no se escribe, se usa el de Bogotá ($3,1M/m²) y se avisa.

## Para desplegar

- **No hay migración de base:** no se crean tablas ni columnas.
- El backend necesita salida a internet hacia `www.datos.gov.co`, `suameca.banrep.gov.co` y `cacerts.digicert.com`. Sin ella funciona igual, con el respaldo.
- Pruebas: `cd backend && python -m pytest tests -q` (pytest y httpx no están en `requirements.txt`).
