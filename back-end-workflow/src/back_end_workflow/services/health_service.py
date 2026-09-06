from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text

async def check_database_connection(db: AsyncSession) -> dict:
    try:
        # A simple query to check if the database responds
        await db.execute(text("SELECT 1"))
        return {"status": "success", "message": "Database is connected successfully!"}
    except Exception as e:
        return {"status": "error", "message": f"Database connection failed: {str(e)}"}

# You can add more placeholder service functions here like this:
# async def some_future_logic():
#     pass
