"""SQLAlchemy ORM 模型 — 对齐 LKM-service app/db/models.py"""

import datetime

import sqlalchemy as sa
from sqlalchemy.orm import DeclarativeBase, relationship


def now_iso() -> str:
    return datetime.datetime.now(datetime.timezone.utc).isoformat()


class Base(DeclarativeBase):
    pass


# ── User & Profile ────────────────────────────────────────────


class User(Base):
    __tablename__ = "users"

    id = sa.Column(sa.Integer, primary_key=True, autoincrement=True)
    username = sa.Column(sa.String(100), unique=True, nullable=False)
    email = sa.Column(sa.String(200), unique=True, nullable=True)
    phone = sa.Column(sa.String(20), unique=True, nullable=True)
    hashed_password = sa.Column(sa.Text, nullable=False)
    account_level = sa.Column(sa.String(10), nullable=False, default="local")
    is_locked = sa.Column(sa.Boolean, nullable=False, default=False)
    locked_until = sa.Column(sa.Text, nullable=True)
    failed_login_attempts = sa.Column(sa.Integer, nullable=False, default=0)
    token_version = sa.Column(sa.Integer, nullable=False, default=0)
    created_at = sa.Column(sa.Text, nullable=False, default=now_iso)
    updated_at = sa.Column(sa.Text, nullable=False, default=now_iso)

    profile = relationship("Profile", back_populates="user", uselist=False, cascade="all, delete-orphan")
    refresh_tokens = relationship("RefreshToken", back_populates="user", cascade="all, delete-orphan")

    # ── 高级认证/注册流扩展字段（本任务新增） ──────────────
    two_factor_enabled = sa.Column(sa.Boolean, nullable=False, default=False)
    recovery_codes_json = sa.Column(sa.Text, nullable=True)
    onboarding_step = sa.Column(sa.Integer, nullable=False, default=0)
    onboarding_completed = sa.Column(sa.Boolean, nullable=False, default=False)
    onboarding_data_json = sa.Column(sa.Text, nullable=True)

    auth_identities = relationship("AuthIdentity", back_populates="user", cascade="all, delete-orphan")
    passkeys = relationship("PasskeyCredential", back_populates="user", cascade="all, delete-orphan")
    column_applications = relationship(
        "ColumnApplication", back_populates="user",
        primaryjoin="User.id == foreign(ColumnApplication.user_id)",
    )
    owned_columns = relationship("ColumnModel", back_populates="owner")
    posts = relationship("ColumnPost", back_populates="author")
    blog_series = relationship("BlogSeries", back_populates="owner")
    blog_comments = relationship("BlogComment", back_populates="user")
    blog_stars = relationship("BlogStar", back_populates="user")

    # ── 展示型计数列（本任务新增） ──────────────────────────
    points = sa.Column(sa.Integer, nullable=False, default=0)
    follower_count = sa.Column(sa.Integer, nullable=False, default=0)
    following_count = sa.Column(sa.Integer, nullable=False, default=0)


class Profile(Base):
    __tablename__ = "profiles"

    user_id = sa.Column(sa.Integer, sa.ForeignKey("users.id"), primary_key=True)
    nickname = sa.Column(sa.String(100), nullable=True)
    avatar = sa.Column(sa.Text, nullable=True)
    role = sa.Column(sa.String(20), nullable=False, default="member")
    bio = sa.Column(sa.String(200), nullable=True)
    major = sa.Column(sa.String(100), nullable=True)
    grade = sa.Column(sa.String(50), nullable=True)
    interests = sa.Column(sa.Text, nullable=True)  # JSON 数组字符串
    ideals = sa.Column(sa.String(300), nullable=True)
    title = sa.Column(sa.String(50), nullable=False, default="newbie")
    contact_links = sa.Column(sa.Text, nullable=True)

    user = relationship("User", back_populates="profile")


# ── Auth ──────────────────────────────────────────────────────


class RefreshToken(Base):
    __tablename__ = "refresh_tokens"

    id = sa.Column(sa.Integer, primary_key=True, autoincrement=True)
    user_id = sa.Column(sa.Integer, sa.ForeignKey("users.id"), nullable=False)
    token = sa.Column(sa.String(500), unique=True, nullable=False)
    expires_at = sa.Column(sa.Text, nullable=False)
    created_at = sa.Column(sa.Text, nullable=False, default=now_iso)

    user = relationship("User", back_populates="refresh_tokens")


class AuthIdentity(Base):
    """第三方 / 扩展认证身份绑定（OAuth openid / 平台 subject）"""

    __tablename__ = "auth_identities"

    id = sa.Column(sa.Integer, primary_key=True, autoincrement=True)
    user_id = sa.Column(sa.Integer, sa.ForeignKey("users.id"), nullable=False)
    provider = sa.Column(sa.String(30), nullable=False)
    subject = sa.Column(sa.String(200), unique=True, nullable=False)
    created_at = sa.Column(sa.Text, nullable=False, default=now_iso)

    user = relationship("User", back_populates="auth_identities")


class PasskeyCredential(Base):
    """Passkey 公钥凭据存储（WebAuthn 模拟）"""

    __tablename__ = "passkey_credentials"

    id = sa.Column(sa.Integer, primary_key=True, autoincrement=True)
    user_id = sa.Column(sa.Integer, sa.ForeignKey("users.id"), nullable=False)
    credential_id = sa.Column(sa.String(200), unique=True, nullable=False)
    name = sa.Column(sa.String(80), nullable=False, default="")
    created_at = sa.Column(sa.Text, nullable=False, default=now_iso)

    user = relationship("User", back_populates="passkeys")


# ── Columns ───────────────────────────────────────────────────


class ColumnApplication(Base):
    __tablename__ = "column_applications"

    id = sa.Column(sa.Integer, primary_key=True, autoincrement=True)
    user_id = sa.Column(sa.Integer, sa.ForeignKey("users.id"), nullable=False)
    title = sa.Column(sa.String(80), nullable=False)
    description = sa.Column(sa.String(300), nullable=False)
    reason = sa.Column(sa.String(500), nullable=False)
    status = sa.Column(sa.String(20), nullable=False, default="pending")
    reviewer_id = sa.Column(sa.Integer, sa.ForeignKey("users.id"), nullable=True)
    review_note = sa.Column(sa.Text, nullable=True)
    created_at = sa.Column(sa.Text, nullable=False, default=now_iso)
    reviewed_at = sa.Column(sa.Text, nullable=True)

    user = relationship("User", foreign_keys=[user_id], back_populates="column_applications")
    reviewer = relationship("User", foreign_keys=[reviewer_id])
    column = relationship("ColumnModel", back_populates="application", uselist=False)


class ColumnModel(Base):
    __tablename__ = "columns_table"

    id = sa.Column(sa.Integer, primary_key=True, autoincrement=True)
    owner_id = sa.Column(sa.Integer, sa.ForeignKey("users.id"), nullable=False)
    application_id = sa.Column(sa.Integer, sa.ForeignKey("column_applications.id"), unique=True, nullable=True)
    title = sa.Column(sa.String(80), nullable=False)
    description = sa.Column(sa.String(300), nullable=False)
    cover_url = sa.Column(sa.Text, nullable=True)
    status = sa.Column(sa.String(20), nullable=False, default="active")
    created_at = sa.Column(sa.Text, nullable=False, default=now_iso)
    updated_at = sa.Column(sa.Text, nullable=False, default=now_iso)

    owner = relationship("User", back_populates="owned_columns")
    application = relationship("ColumnApplication", back_populates="column")
    posts = relationship("ColumnPost", back_populates="column", cascade="all, delete-orphan")


class ColumnPost(Base):
    __tablename__ = "column_posts"

    id = sa.Column(sa.Integer, primary_key=True, autoincrement=True)
    column_id = sa.Column(sa.Integer, sa.ForeignKey("columns_table.id"), nullable=False)
    author_id = sa.Column(sa.Integer, sa.ForeignKey("users.id"), nullable=False)
    title = sa.Column(sa.String(120), nullable=False)
    summary = sa.Column(sa.String(300), nullable=True)
    content = sa.Column(sa.Text, nullable=False)
    status = sa.Column(sa.String(20), nullable=False, default="published")
    created_at = sa.Column(sa.Text, nullable=False, default=now_iso)
    updated_at = sa.Column(sa.Text, nullable=False, default=now_iso)
    published_at = sa.Column(sa.Text, nullable=True)

    column = relationship("ColumnModel", back_populates="posts")
    author = relationship("User", back_populates="posts")


# ── Blog ──────────────────────────────────────────────────────


class BlogSeries(Base):
    __tablename__ = "blog_series"

    id = sa.Column(sa.Integer, primary_key=True, autoincrement=True)
    owner_id = sa.Column(sa.Integer, sa.ForeignKey("users.id"), nullable=False)
    title = sa.Column(sa.String(120), nullable=False)
    description = sa.Column(sa.Text, nullable=True)
    cover_url = sa.Column(sa.Text, nullable=True)
    repo_name = sa.Column(sa.String(100), unique=True, nullable=False)
    status = sa.Column(sa.String(20), nullable=False, default="active")
    created_at = sa.Column(sa.Text, nullable=False, default=now_iso)
    updated_at = sa.Column(sa.Text, nullable=False, default=now_iso)

    owner = relationship("User", back_populates="blog_series")
    comments = relationship("BlogComment", back_populates="series", cascade="all, delete-orphan")
    stars = relationship("BlogStar", back_populates="series", cascade="all, delete-orphan")


class BlogStar(Base):
    __tablename__ = "blog_stars"

    user_id = sa.Column(sa.Integer, sa.ForeignKey("users.id"), primary_key=True)
    series_id = sa.Column(sa.Integer, sa.ForeignKey("blog_series.id"), primary_key=True)
    created_at = sa.Column(sa.Text, nullable=False, default=now_iso)

    user = relationship("User", back_populates="blog_stars")
    series = relationship("BlogSeries", back_populates="stars")


class BlogComment(Base):
    __tablename__ = "blog_comments"

    id = sa.Column(sa.Integer, primary_key=True, autoincrement=True)
    user_id = sa.Column(sa.Integer, sa.ForeignKey("users.id"), nullable=False)
    series_id = sa.Column(sa.Integer, sa.ForeignKey("blog_series.id"), nullable=False)
    content = sa.Column(sa.Text, nullable=False)
    parent_id = sa.Column(sa.Integer, sa.ForeignKey("blog_comments.id"), nullable=True)
    created_at = sa.Column(sa.Text, nullable=False, default=now_iso)
    updated_at = sa.Column(sa.Text, nullable=False, default=now_iso)

    user = relationship("User", back_populates="blog_comments")
    series = relationship("BlogSeries", back_populates="comments")
    parent = relationship("BlogComment", remote_side=[id], back_populates="replies")
    replies = relationship("BlogComment", back_populates="parent", cascade="all, delete-orphan")
