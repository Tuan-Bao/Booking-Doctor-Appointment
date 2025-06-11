import { jwtDecode } from "jwt-decode";

/**
 * Kiểm tra xem JWT trong localStorage có còn hợp lệ hay không
 * @returns {boolean} true nếu hết hạn hoặc không có token, false nếu còn hiệu lực
 */
export const isTokenValid = (token) => {
  try {
    const decoded = jwtDecode(token);
    const curTime = Math.floor(Date.now() / 1000);
    return decoded.exp > curTime;
  } catch (error) {
    console.error("Lỗi khi giải mã token:", error);
    return false;
  }
};

/**
 * Xóa token và cả role (nếu có) khỏi localStorage
 */
export function clearAuth() {
  localStorage.removeItem("token");
  localStorage.removeItem("role");
}
