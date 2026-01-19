// 🔥 global auth event to notify navbar of login/logout
export const notifyAuthChange = () => {
  window.dispatchEvent(new Event("authChange"));
};
