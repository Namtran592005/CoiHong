#!/usr/bin/env bash
# Khởi động CoiHong trên VPS.
#
# Được systemd gọi. Không cần `npm` trên máy chủ: `standalone/server.js` đã
# gộp sẵn mọi phụ thuộc Node mà ứng dụng thật sự dùng.
set -euo pipefail

cd "$(dirname "$0")"

# `standalone` mặc định bind mọi interface trên cổng 3000. Đặt qua biến môi
# trường nên đổi cổng chỉ cần sửa file env của systemd, không sửa code.
export PORT="${PORT:-3000}"
export HOSTNAME="${HOSTNAME:-0.0.0.0}"

exec node client/server.js