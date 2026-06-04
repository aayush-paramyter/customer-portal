from starlette.middleware.cors import CORSMiddleware

from ..host_registry import is_allowed_cors_origin


class PortalDynamicCORSMiddleware(CORSMiddleware):
    """CORS middleware that allows origins registered in portal_host_mappings."""

    def is_allowed_origin(self, origin: str) -> bool:  # type: ignore[override]
        if super().is_allowed_origin(origin):
            return True
        return is_allowed_cors_origin(origin)
