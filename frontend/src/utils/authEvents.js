
export const notifyAuthChange = () => {
  window.dispatchEvent(new Event("authChange"));
};
