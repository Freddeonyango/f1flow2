#!/usr/bin/env python3
"""Simple CLI login/register with SQLite + PBKDF2 password hashing."""

import base64
import getpass
import hashlib
import os
import sqlite3
import sys
from typing import Tuple

DB_PATH = os.path.join(os.path.dirname(__file__), "users.db")
PBKDF2_ITERS = 200_000
SALT_BYTES = 16


def _connect() -> sqlite3.Connection:
    conn = sqlite3.connect(DB_PATH)
    conn.execute(
        """
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            salt TEXT NOT NULL,
            password_hash TEXT NOT NULL
        )
        """
    )
    return conn


def _hash_password(password: str, salt: bytes) -> str:
    dk = hashlib.pbkdf2_hmac("sha256", password.encode("utf-8"), salt, PBKDF2_ITERS)
    return base64.b64encode(dk).decode("ascii")


def _make_salt() -> bytes:
    return os.urandom(SALT_BYTES)


def register(conn: sqlite3.Connection) -> None:
    username = input("New username: ").strip()
    if not username:
        print("Username cannot be empty.")
        return

    password = getpass.getpass("New password: ")
    confirm = getpass.getpass("Confirm password: ")
    if password != confirm:
        print("Passwords do not match.")
        return
    if len(password) < 8:
        print("Password must be at least 8 characters.")
        return

    salt = _make_salt()
    password_hash = _hash_password(password, salt)

    try:
        conn.execute(
            "INSERT INTO users (username, salt, password_hash) VALUES (?, ?, ?)",
            (username, base64.b64encode(salt).decode("ascii"), password_hash),
        )
        conn.commit()
        print("User registered.")
    except sqlite3.IntegrityError:
        print("That username already exists.")


def _get_user(conn: sqlite3.Connection, username: str) -> Tuple[str, str] | None:
    cur = conn.execute(
        "SELECT salt, password_hash FROM users WHERE username = ?", (username,)
    )
    row = cur.fetchone()
    if not row:
        return None
    return row[0], row[1]


def login(conn: sqlite3.Connection) -> None:
    username = input("Username: ").strip()
    password = getpass.getpass("Password: ")

    user = _get_user(conn, username)
    if not user:
        print("Invalid username or password.")
        return

    salt_b64, password_hash = user
    salt = base64.b64decode(salt_b64)
    candidate_hash = _hash_password(password, salt)

    if hashlib.compare_digest(candidate_hash, password_hash):
        print("Login successful.")
    else:
        print("Invalid username or password.")


def main() -> None:
    conn = _connect()
    try:
        while True:
            print("\n1) Register\n2) Login\n3) Exit")
            choice = input("Choose an option: ").strip()
            if choice == "1":
                register(conn)
            elif choice == "2":
                login(conn)
            elif choice == "3":
                print("Goodbye.")
                return
            else:
                print("Invalid choice.")
    finally:
        conn.close()


if __name__ == "__main__":
    main()
