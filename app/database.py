import os
import re
from contextvars import ContextVar

from dotenv import load_dotenv
from sqlalchemy import create_engine, event, text, pool
from sqlalchemy.orm import Session, declarative_base, sessionmaker

load_dotenv()

SQLALCHEMY_DATABASE_URL = os.getenv("DB", "")
Base = declarative_base()
current_schema = ContextVar("schema", default="public")
_engines: dict[str, object] = {}
SCHEMA_PATTERN = re.compile(r"^(public|tenant_[a-z0-9_]+)$", re.IGNORECASE)


def validate_schema_name(schema: str) -> str:
    if not schema:
        raise ValueError("Schema is required")
    schema = schema.strip().lower()
    if not SCHEMA_PATTERN.match(schema):
        raise ValueError("Invalid schema name")
    for token in (";", "--", "/*", "*/", "'", '"', "\\", "\n", "\r", "\x00"):
        if token in schema:
            raise ValueError("Invalid schema token")
    return schema


def _quote_schema(schema: str) -> str:
    return f'"{schema}"'


def get_engine(schema: str):
    schema = validate_schema_name(schema)
    if schema in _engines:
        return _engines[schema]

    engine = create_engine(
        SQLALCHEMY_DATABASE_URL,
        pool_size=10,
        max_overflow=20,
        pool_timeout=30,
        pool_recycle=1800,
        pool_pre_ping=True,
        connect_args={"connect_timeout": 10},
        poolclass=pool.QueuePool,
    )

    quoted_schema = _quote_schema(schema)

    def _apply_search_path(dbapi_connection) -> None:
        with dbapi_connection.cursor() as cursor:
            cursor.execute(f"SET search_path TO {quoted_schema}")

    @event.listens_for(engine, "connect")
    def _set_path_on_connect(dbapi_connection, connection_record):  # noqa: ANN001,ARG001
        _apply_search_path(dbapi_connection)

    @event.listens_for(engine, "checkout")
    def _set_path_on_checkout(dbapi_connection, connection_record, connection_proxy):  # noqa: ANN001,ARG001
        _apply_search_path(dbapi_connection)

    _engines[schema] = engine
    return engine


@event.listens_for(Session, "after_transaction_end")
def _restore_search_path_after_transaction(session, transaction) -> None:
    """Neon pooler resets search_path when a transaction ends; re-apply for the tenant."""
    if transaction.nested or transaction.parent is not None:
        return
    schema = session.info.get("tenant_schema")
    if schema:
        session.execute(text(f"SET search_path TO {_quote_schema(schema)}"))


def get_session(schema: str):
    schema = validate_schema_name(schema)
    session = sessionmaker(bind=get_engine(schema), autocommit=False, autoflush=False)()
    session.info["tenant_schema"] = schema
    session.execute(text(f"SET search_path TO {_quote_schema(schema)}"))
    return session
