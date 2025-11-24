import asyncio
import sys
from pathlib import Path

# Add backend directory to path
sys.path.append(str(Path(__file__).parent.parent))

from app.core.security import get_password_hash
from app.db.session import AsyncSessionLocal, engine
from app.db.models import User
from app.db.base import Base

async def create_admin(email, password, full_name="Admin User"):
    # Create tables
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    async with AsyncSessionLocal() as db:
        user = User(
            email=email,
            hashed_password=get_password_hash(password),
            full_name=full_name,
            is_admin=True
        )
        db.add(user)
        try:
            await db.commit()
            print(f"Admin user {email} created successfully.")
        except Exception as e:
            print(f"Error creating admin: {e}")

if __name__ == "__main__":
    if len(sys.path) < 2:
        print("Usage: python create_admin.py <email> <password>")
    else:
        asyncio.run(create_admin("admin@example.com", "admin123"))
