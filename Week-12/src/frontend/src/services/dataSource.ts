import * as api from "@/services/api";
import * as mock from "@/services/mock/service";

const DEMO_KEY = "sarrthi.demo.mode";

export function isDemoMode(): boolean {
  if (typeof window === "undefined") return true;
  return window.localStorage.getItem(DEMO_KEY) !== "false";
}

export function setDemoMode(enabled: boolean): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(DEMO_KEY, enabled ? "true" : "false");
}

export const dataSource = {
  getDashboardMetrics: () =>
    isDemoMode() ? mock.mockGetDashboardMetrics() : api.getDashboardMetrics(),
  getMonthlyFinancials: () =>
    isDemoMode() ? mock.mockGetMonthlyFinancials() : api.getMonthlyFinancials(),
  getBuyerDelayReport: () =>
    isDemoMode() ? mock.mockGetBuyerDelayReport() : api.getBuyerDelayReport(),
  getComplianceSummary: () =>
    isDemoMode() ? mock.mockGetComplianceSummary() : api.getComplianceSummary(),
  getWorkingCapitalEstimate: (expenses: bigint) =>
    isDemoMode()
      ? mock.mockGetWorkingCapitalEstimate(expenses)
      : api.getWorkingCapitalEstimate(expenses),
  listActivity: () =>
    isDemoMode() ? mock.mockListActivity() : api.listActivity(),
  listOrders: () => (isDemoMode() ? mock.mockListOrders() : api.listOrders()),
  listInvoices: () =>
    isDemoMode() ? mock.mockListInvoices() : api.listInvoices(),
  listTenders: () =>
    isDemoMode() ? mock.mockListTenders() : api.listTenders(),
  listDocuments: () =>
    isDemoMode() ? mock.mockListDocuments() : api.listDocuments(),
  listChecklistItems: () =>
    isDemoMode() ? mock.mockListChecklistItems() : api.listChecklistItems(),
  listBuyerRisks: () =>
    isDemoMode() ? mock.mockListBuyerRisks() : api.listBuyerRisks(),
  getBusinessProfile: () =>
    isDemoMode() ? mock.mockGetBusinessProfile() : api.getBusinessProfile(),
  saveBusinessProfile: (
    profile: Parameters<typeof api.saveBusinessProfile>[0],
  ) =>
    isDemoMode()
      ? mock.mockSaveBusinessProfile(profile)
      : api.saveBusinessProfile(profile),
  setTenderSaved: (id: bigint, saved: boolean) =>
    isDemoMode()
      ? mock.mockSetTenderSaved(id, saved)
      : api.setTenderSaved(id, saved),
  setOrderStatus: (
    id: bigint,
    status: Parameters<typeof api.setOrderStatus>[1],
  ) =>
    isDemoMode()
      ? mock.mockSetOrderStatus(id, status)
      : api.setOrderStatus(id, status),
  createOrder: (input: Parameters<typeof api.createOrder>[0]) =>
    isDemoMode() ? mock.mockCreateOrder(input) : api.createOrder(input),
  deleteOrder: (id: bigint) =>
    isDemoMode() ? mock.mockDeleteOrder(id) : api.deleteOrder(id),
  createInvoice: (input: Parameters<typeof api.createInvoice>[0]) =>
    isDemoMode() ? mock.mockCreateInvoice(input) : api.createInvoice(input),
  deleteInvoice: (id: bigint) =>
    isDemoMode() ? mock.mockDeleteInvoice(id) : api.deleteInvoice(id),
  recordPayment: (input: Parameters<typeof api.recordPayment>[0]) =>
    isDemoMode() ? mock.mockRecordPayment(input) : api.recordPayment(input),
  createDocument: (input: Parameters<typeof api.createDocument>[0]) =>
    isDemoMode() ? mock.mockCreateDocument(input) : api.createDocument(input),
  deleteDocument: (id: bigint) =>
    isDemoMode() ? mock.mockDeleteDocument(id) : api.deleteDocument(id),
  saveChecklistItems: (items: Parameters<typeof api.saveChecklistItems>[0]) =>
    isDemoMode()
      ? mock.mockSaveChecklistItems(items)
      : api.saveChecklistItems(items),
};
