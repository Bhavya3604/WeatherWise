from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user, get_db
from app.db import models, schemas

router = APIRouter(prefix="/admin", tags=["admin"])


def check_admin(user: models.User = Depends(get_current_user)) -> models.User:
    if not user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="The user doesn't have enough privileges",
        )
    return user


@router.get("/users", response_model=List[schemas.UserRead])
async def read_users(
    skip: int = 0,
    limit: int = 100,
    current_user: models.User = Depends(check_admin),
    db: AsyncSession = Depends(get_db),
) -> List[schemas.UserRead]:
    """
    Retrieve users. Only for admins.
    """
    result = await db.execute(select(models.User).offset(skip).limit(limit))
    users = result.scalars().all()
    return users


@router.delete("/users/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_user(
    user_id: int,
    current_user: models.User = Depends(check_admin),
    db: AsyncSession = Depends(get_db),
):
    """
    Delete a user. Only for admins.
    """
    user = await db.get(models.User, user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )
    if user.id == current_user.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot delete yourself",
        )
    
    await db.delete(user)
    await db.commit()
