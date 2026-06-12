#!/usr/bin/env python3
"""
make-admin.py — تعریف اولین ادمین Xennic

استفاده:
  python3 ~/xennic-patch/scripts/make-admin.py --email admin@example.com

یا بدون آرگومان (interactive):
  python3 ~/xennic-patch/scripts/make-admin.py
"""

import sys
import subprocess
import argparse

def run_sql(sql: str, db_url: str) -> str:
    result = subprocess.run(
        ['psql', db_url, '-c', sql, '--no-psqlrc', '-t', '-A'],
        capture_output=True, text=True,
    )
    return result.stdout.strip()

def get_db_url() -> str:
    """خواندن DATABASE_URL از .env"""
    import pathlib, re
    for env_path in [
        pathlib.Path.home() / 'xennic/apps/api/.env',
        pathlib.Path.home() / 'xennic/.env',
        pathlib.Path.home() / 'xennic/packages/database/.env',
    ]:
        if env_path.exists():
            content = env_path.read_text()
            m = re.search(r'^DATABASE_URL\s*=\s*["\']?(.+?)["\']?\s*$', content, re.MULTILINE)
            if m:
                return m.group(1).strip().strip('"\'')
    raise RuntimeError(
        "DATABASE_URL پیدا نشد.\n"
        "مسیر فایل .env را با --db-url مشخص کنید:\n"
        "  python3 make-admin.py --email EMAIL --db-url 'postgresql://...'"
    )

def make_admin(email: str, db_url: str):
    print(f"\n🔍 بررسی کاربر: {email}")

    # پیدا کردن کاربر
    result = run_sql(
        f"SELECT id, email, first_name, last_name, is_admin FROM users WHERE email = '{email}' AND deleted_at IS NULL LIMIT 1;",
        db_url,
    )

    if not result:
        print(f"❌ کاربر با ایمیل '{email}' پیدا نشد.")
        print("   مطمئن شوید ابتدا در سیستم ثبت‌نام کرده‌اید.")
        sys.exit(1)

    parts    = result.split('|')
    user_id  = parts[0]
    user_email = parts[1]
    name     = f"{parts[2]} {parts[3]}"
    is_admin = parts[4].lower() in ('t', 'true', '1')

    print(f"   یافت شد: {name} ({user_email})")
    print(f"   وضعیت ادمین فعلی: {'✅ بله' if is_admin else '❌ خیر'}")

    if is_admin:
        print("\n✅ این کاربر قبلاً ادمین است — نیازی به تغییر نیست.")
        return

    # تأیید
    confirm = input(f"\n⚠️  آیا مطمئن هستید که می‌خواهید '{name}' را ادمین کنید؟ [y/N] ").strip().lower()
    if confirm not in ('y', 'yes', 'بله'):
        print("لغو شد.")
        sys.exit(0)

    # اعمال تغییر
    run_sql(
        f"UPDATE users SET is_admin = true, updated_at = NOW() WHERE id = '{user_id}';",
        db_url,
    )

    # اضافه کردن role هم
    run_sql(
        f"""
        INSERT INTO user_roles (id, user_id, role, workspace_id, created_at)
        VALUES (gen_random_uuid(), '{user_id}', 'super_admin', NULL, NOW())
        ON CONFLICT (user_id, role) DO NOTHING;
        """,
        db_url,
    )

    print(f"\n✅ کاربر '{name}' با موفقیت ادمین شد!")
    print("   اکنون می‌توانید با این حساب لاگین کرده و به /fa/admin دسترسی داشته باشید.")


def main():
    parser = argparse.ArgumentParser(description='تعریف ادمین Xennic')
    parser.add_argument('--email',  help='ایمیل کاربر')
    parser.add_argument('--db-url', help='DATABASE_URL (اختیاری، از .env خوانده می‌شود)')
    args = parser.parse_args()

    # db url
    db_url = args.db_url or get_db_url()

    # email
    email = args.email
    if not email:
        email = input("ایمیل کاربر: ").strip()

    if not email:
        print("❌ ایمیل وارد نشد.")
        sys.exit(1)

    make_admin(email, db_url)

if __name__ == '__main__':
    main()
