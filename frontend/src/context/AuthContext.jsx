import { createContext, useContext, useEffect, useState, useCallback } from "react";
import getUser from "../services/getUser";

const AuthContext = createContext(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

function AuthProvider({ children }) {
  // 初始化从localStorage读取持久化的用户信息，完全沿用原有持久化逻辑
  const [currentUser, setCurrentUser] = useState(() => {
    const savedUser = localStorage.getItem("loggedUser");
    try {
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      localStorage.removeItem("loggedUser");
      return null;
    }
  });

  // 只读属性：是否已认证，与原有逻辑完全对齐
  const isAuthenticated = !!currentUser;

  // 生成带认证的请求头，兼容原有业务逻辑
  const headers = currentUser ? { Authorization: `Token ${currentUser.token}` } : null;

  // 异步登录方法：完成全局登录态更新与持久化
  const login = useCallback(async (loginService, credentials) => {
    const user = await loginService(credentials);
    setCurrentUser(user);
    localStorage.setItem("loggedUser", JSON.stringify(user));
    return user;
  }, []);

  // 同步登出方法：清除当前全局登录态并清空关联持久化数据
  const logout = useCallback(() => {
    setCurrentUser(null);
    localStorage.removeItem("loggedUser");
  }, []);

  // 同步更新用户信息方法：合并更新全局存储并同步持久化
  const updateUserInfo = useCallback((newUserInfo) => {
    setCurrentUser((prev) => {
      if (!prev) return null;
      const updatedUser = { ...prev, ...newUserInfo };
      localStorage.setItem("loggedUser", JSON.stringify(updatedUser));
      return updatedUser;
    });
  }, []);

  // 初始化校验当前token有效性，自动清理无效残留登录态，完全保留原有逻辑
  useEffect(() => {
    if (!headers) return;
    getUser({ headers })
      .then((validUser) => {
        setCurrentUser(validUser);
        localStorage.setItem("loggedUser", JSON.stringify(validUser));
      })
      .catch(() => {
        // 无效token自动执行登出流程
        logout();
      });
  }, [headers, logout]);

  const contextValue = {
    isAuthenticated,
    currentUser,
    login,
    logout,
    updateUserInfo,
    // 兼容原有业务逻辑的请求头属性，保证迁移后所有调用点行为完全不变
    headers,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

export default AuthProvider;