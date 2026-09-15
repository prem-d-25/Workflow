import asyncio
import os
import sys

sys.path.insert(0, os.path.abspath("src"))
import httpx
from backend.main import app


async def test_httponly_cookie_flow():
    print("=" * 60)
    print("TESTING PRODUCTION HTTPONLY COOKIE LIFECYCLE")
    print("=" * 60)

    async with httpx.AsyncClient(transport=httpx.ASGITransport(app=app), base_url="http://testserver") as client:
        # 1. Register company & owner
        email = f"cookie_owner_{os.urandom(3).hex()}@corp.com"
        print(f"\n[1] Registering {email}...")
        res = await client.post("/api/v1/auth/register-company", json={
            "company_name": f"Cookie Corp {os.urandom(2).hex()}",
            "email": email,
            "password": "Password123!",
        })
        assert res.status_code == 201, f"Failed: {res.text}"
        data = res.json()
        assert "access_token" in data
        print("  Access token received in JSON body.")

        # Verify Set-Cookie header has HttpOnly refresh_token
        set_cookie = res.headers.get("set-cookie", "")
        print(f"  Set-Cookie Header: {set_cookie}")
        assert "refresh_token=" in set_cookie, "refresh_token cookie missing in header!"
        assert "httponly" in set_cookie.lower(), "HttpOnly flag missing in cookie!"
        assert "samesite=lax" in set_cookie.lower(), "SameSite=Lax missing in cookie!"
        assert "path=/api/v1/auth" in set_cookie.lower(), "Path restriction missing in cookie!"
        print("  Set-Cookie correctly configured with HttpOnly; SameSite=Lax; Path=/api/v1/auth!")

        # 2. Call /api/v1/auth/refresh using the cookie
        print("\n[2] Testing /api/v1/auth/refresh using HttpOnly cookie (no token in body)...")
        refresh_res = await client.post("/api/v1/auth/refresh")
        assert refresh_res.status_code == 200, f"Refresh failed: {refresh_res.text}"
        refreshed_data = refresh_res.json()
        assert "access_token" in refreshed_data
        new_cookie = refresh_res.headers.get("set-cookie", "")
        assert "refresh_token=" in new_cookie
        print("  Automatic cookie-based token refresh & rotation SUCCESSFUL!")

        # 3. Call protected endpoint with new access token
        print("\n[3] Calling protected /api/v1/auth/me with refreshed access token...")
        me_res = await client.get("/api/v1/auth/me", headers={
            "Authorization": f"Bearer {refreshed_data['access_token']}"
        })
        assert me_res.status_code == 200
        assert me_res.json()["user"]["email"] == email
        print("  Protected API call with rotated token SUCCESSFUL!")

        # 4. Test Logout and cookie deletion
        print("\n[4] Calling /api/v1/auth/logout...")
        logout_res = await client.post("/api/v1/auth/logout")
        assert logout_res.status_code == 200
        logout_cookie = logout_res.headers.get("set-cookie", "")
        print(f"  Logout Set-Cookie: {logout_cookie}")
        assert 'refresh_token=""' in logout_cookie or "max-age=0" in logout_cookie.lower() or "expires=" in logout_cookie.lower()
        print("  Logout correctly instructed browser to DELETE the HttpOnly cookie!")

    print("\n" + "=" * 60)
    print("ALL HTTPONLY COOKIE TESTS PASSED 100%!")
    print("=" * 60)


if __name__ == "__main__":
    asyncio.run(test_httponly_cookie_flow())
