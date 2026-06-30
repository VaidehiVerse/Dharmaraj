"""Shared MongoDB client factory for Atlas + cloud hosts (Render, etc.)."""
from __future__ import annotations

import certifi
from motor.motor_asyncio import AsyncIOMotorClient
from pymongo import MongoClient

_TLS_KWARGS = {
    "serverSelectionTimeoutMS": 10000,
    "tlsCAFile": certifi.where(),
}


def create_async_client(uri: str) -> AsyncIOMotorClient:
    return AsyncIOMotorClient(uri, **_TLS_KWARGS)


def create_sync_client(uri: str) -> MongoClient:
    return MongoClient(uri, **_TLS_KWARGS)
