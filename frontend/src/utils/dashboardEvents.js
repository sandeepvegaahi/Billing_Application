export const notifyDashboardUpdate = () => {
  window.dispatchEvent(new Event("studentsUpdated"));
};
