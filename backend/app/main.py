from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.admin import router as admin_router

app = FastAPI(title="Zequora API")

# TODO (backend oficial): agregar aquí el/los router(s) de auth, inmuebles,
# dashboard y notificaciones con app.include_router(...) — no reemplazar
# este archivo, solo sumar. El router de abajo es la consola interna del
# equipo (embudo/seguimiento/add-value), coordinado con David — ver
# app/api/admin.py y app/services/admin/.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # restringir al dominio real de Zequora al desplegar
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(admin_router, prefix="/api/admin")
