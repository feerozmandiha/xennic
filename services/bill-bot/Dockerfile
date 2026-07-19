# ربات تحلیل قبض برق — image سبک بدون build step
FROM node:22-slim

WORKDIR /app

# فقط کد منبع سرویس کپی می‌شود (بدون node_modules — بدون وابستگی اجباری)
COPY package.json ./
COPY src ./src

ENV NODE_ENV=production
ENV DATA_DIR=/data
VOLUME ["/data"]

# در صورت نیاز به PDF: فونت وزیرمتن را mount کنید و REPORT_FONT_PATH را تنظیم کنید
CMD ["node", "--experimental-strip-types", "src/index.ts"]
