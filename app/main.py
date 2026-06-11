import os

from fastapi import FastAPI

from .middleware.cors import PortalDynamicCORSMiddleware
from .routes.auth import router as auth_router
from .routes.cases import router as cases_router
from .routes.invoices import router as invoices_router
from .routes.orders import router as orders_router
from .routes.profile import router as profile_router
from .routes.public import router as public_router

app = FastAPI(title="Hyegro Customer Portal API", version="0.2.0", redirect_slashes=False)

_cors_origins = [
    o.strip()
    for o in os.getenv(
        "PORTAL_CORS_ORIGINS",
        "http://localhost:5173,http://127.0.0.1:5173",
    ).split(",")
    if o.strip()
]
app.add_middleware(
    PortalDynamicCORSMiddleware,
    allow_origins=_cors_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allow_headers=[
        "Authorization",
        "Content-Type",
        "X-Tenant-Schema",
        "X-Portal-Host",
        "X-Portal-Origin",
        "Accept",
        "Host",
    ],
)

app.include_router(public_router)
app.include_router(auth_router)
app.include_router(cases_router)
app.include_router(orders_router)
app.include_router(invoices_router)
app.include_router(profile_router)


@app.get("/health")
def health():
    return {"status": "ok"}
