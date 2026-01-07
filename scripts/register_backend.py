#!/usr/bin/env python3
"""
Register backend URL with Lovable Cloud for frontend discovery.

Usage:
  python scripts/register_backend.py [URL]

If URL is not provided, auto-detects Codespaces URL.
"""
import os
import sys
from supabase import create_client

SUPABASE_URL = os.environ.get("VITE_SUPABASE_URL") or os.environ.get("SUPABASE_URL")
SUPABASE_KEY = os.environ.get("VITE_SUPABASE_PUBLISHABLE_KEY") or os.environ.get("SUPABASE_ANON_KEY")


def get_codespaces_url() -> str | None:
    """Build Codespaces forwarded URL for port 8000."""
    name = os.environ.get("CODESPACE_NAME")
    domain = os.environ.get("GITHUB_CODESPACES_PORT_FORWARDING_DOMAIN")
    if name and domain:
        return f"https://{name}-8000.{domain}"
    return None


def register_url(api_url: str) -> None:
    """Upsert the backend URL into backend_config table."""
    if not SUPABASE_URL or not SUPABASE_KEY:
        print("Error: SUPABASE_URL and SUPABASE_ANON_KEY env vars required")
        print("  Set VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY from .env")
        sys.exit(1)

    client = create_client(SUPABASE_URL, SUPABASE_KEY)
    result = client.table("backend_config").upsert({
        "id": "default",
        "api_url": api_url,
    }).execute()

    print(f"✓ Registered backend URL: {api_url}")


def main():
    if len(sys.argv) > 1:
        url = sys.argv[1]
    else:
        url = get_codespaces_url()
        if not url:
            print("Error: Not in Codespaces and no URL provided")
            print("Usage: python scripts/register_backend.py <URL>")
            sys.exit(1)

    register_url(url)


if __name__ == "__main__":
    main()
