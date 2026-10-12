import { dataSource } from "@/services/dataSource";
import type {
  BusinessProfile,
  ChecklistItem,
  DocumentInput,
  InvoiceInput,
  OrderInput,
  OrderStatus,
  PaymentInput,
} from "@/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export const queryKeys = {
  dashboardMetrics: ["dashboard", "metrics"] as const,
  monthlyFinancials: ["dashboard", "monthly"] as const,
  buyerDelayReport: ["dashboard", "buyer-delays"] as const,
  complianceSummary: ["compliance", "summary"] as const,
  workingCapital: ["reports", "working-capital"] as const,
  activity: ["activity"] as const,
  orders: ["orders"] as const,
  invoices: ["invoices"] as const,
  tenders: ["tenders"] as const,
  documents: ["documents"] as const,
  checklist: ["compliance", "checklist"] as const,
  buyerRisks: ["compliance", "buyer-risks"] as const,
  businessProfile: ["business", "profile"] as const,
};

export function useDashboardMetrics() {
  return useQuery({
    queryKey: queryKeys.dashboardMetrics,
    queryFn: () => dataSource.getDashboardMetrics(),
  });
}

export function useMonthlyFinancials() {
  return useQuery({
    queryKey: queryKeys.monthlyFinancials,
    queryFn: () => dataSource.getMonthlyFinancials(),
  });
}

export function useBuyerDelayReport() {
  return useQuery({
    queryKey: queryKeys.buyerDelayReport,
    queryFn: () => dataSource.getBuyerDelayReport(),
  });
}

export function useComplianceSummary() {
  return useQuery({
    queryKey: queryKeys.complianceSummary,
    queryFn: () => dataSource.getComplianceSummary(),
  });
}

export function useWorkingCapitalEstimate(enteredExpenses: bigint) {
  return useQuery({
    queryKey: [...queryKeys.workingCapital, enteredExpenses.toString()],
    queryFn: () => dataSource.getWorkingCapitalEstimate(enteredExpenses),
  });
}

export function useActivity() {
  return useQuery({
    queryKey: queryKeys.activity,
    queryFn: () => dataSource.listActivity(),
  });
}

export function useOrders() {
  return useQuery({
    queryKey: queryKeys.orders,
    queryFn: () => dataSource.listOrders(),
  });
}

export function useInvoices() {
  return useQuery({
    queryKey: queryKeys.invoices,
    queryFn: () => dataSource.listInvoices(),
  });
}

export function useOrder(id: bigint | null) {
  return useQuery({
    queryKey: [...queryKeys.orders, id?.toString() ?? "none"],
    queryFn: async () => {
      const orders = await dataSource.listOrders();
      return orders.find((order) => order.id === id) ?? null;
    },
    enabled: id !== null,
  });
}

export function useInvoice(id: bigint | null) {
  return useQuery({
    queryKey: [...queryKeys.invoices, id?.toString() ?? "none"],
    queryFn: async () => {
      const invoices = await dataSource.listInvoices();
      return invoices.find((invoice) => invoice.id === id) ?? null;
    },
    enabled: id !== null,
  });
}

export function useTender(id: bigint | null) {
  return useQuery({
    queryKey: [...queryKeys.tenders, id?.toString() ?? "none"],
    queryFn: async () => {
      const tenders = await dataSource.listTenders();
      return tenders.find((tender) => tender.id === id) ?? null;
    },
    enabled: id !== null,
  });
}

export function useTenders() {
  return useQuery({
    queryKey: queryKeys.tenders,
    queryFn: () => dataSource.listTenders(),
  });
}

export function useDocuments() {
  return useQuery({
    queryKey: queryKeys.documents,
    queryFn: () => dataSource.listDocuments(),
  });
}

export function useChecklistItems() {
  return useQuery({
    queryKey: queryKeys.checklist,
    queryFn: () => dataSource.listChecklistItems(),
  });
}

export function useBuyerRisks() {
  return useQuery({
    queryKey: queryKeys.buyerRisks,
    queryFn: () => dataSource.listBuyerRisks(),
  });
}

export function useBusinessProfile() {
  return useQuery({
    queryKey: queryKeys.businessProfile,
    queryFn: () => dataSource.getBusinessProfile(),
  });
}

export function useSaveBusinessProfile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (profile: BusinessProfile) =>
      dataSource.saveBusinessProfile(profile),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.businessProfile,
      });
      void queryClient.invalidateQueries({ queryKey: queryKeys.activity });
    },
  });
}

export function useSetTenderSaved() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, saved }: { id: bigint; saved: boolean }) =>
      dataSource.setTenderSaved(id, saved),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.tenders });
      void queryClient.invalidateQueries({ queryKey: queryKeys.activity });
    },
  });
}

function invalidateDashboard(queryClient: ReturnType<typeof useQueryClient>) {
  void queryClient.invalidateQueries({ queryKey: queryKeys.dashboardMetrics });
  void queryClient.invalidateQueries({ queryKey: queryKeys.monthlyFinancials });
  void queryClient.invalidateQueries({ queryKey: queryKeys.buyerDelayReport });
  void queryClient.invalidateQueries({ queryKey: queryKeys.complianceSummary });
  void queryClient.invalidateQueries({ queryKey: queryKeys.workingCapital });
}

export function useSetOrderStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status }: { id: bigint; status: OrderStatus }) =>
      dataSource.setOrderStatus(id, status),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.orders });
      void queryClient.invalidateQueries({ queryKey: queryKeys.activity });
      invalidateDashboard(queryClient);
    },
  });
}

export function useCreateOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: OrderInput) => dataSource.createOrder(input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.orders });
      void queryClient.invalidateQueries({ queryKey: queryKeys.activity });
      invalidateDashboard(queryClient);
    },
  });
}

export function useDeleteOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: bigint) => dataSource.deleteOrder(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.orders });
      void queryClient.invalidateQueries({ queryKey: queryKeys.activity });
      invalidateDashboard(queryClient);
    },
  });
}

export function useCreateInvoice() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: InvoiceInput) => dataSource.createInvoice(input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.invoices });
      void queryClient.invalidateQueries({ queryKey: queryKeys.activity });
      invalidateDashboard(queryClient);
    },
  });
}

export function useDeleteInvoice() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: bigint) => dataSource.deleteInvoice(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.invoices });
      void queryClient.invalidateQueries({ queryKey: queryKeys.activity });
      invalidateDashboard(queryClient);
    },
  });
}

export function useRecordPayment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: PaymentInput) => dataSource.recordPayment(input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.invoices });
      void queryClient.invalidateQueries({ queryKey: queryKeys.activity });
      invalidateDashboard(queryClient);
    },
  });
}

export function useCreateDocument() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: DocumentInput) =>
      dataSource.createDocument(input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.documents });
      void queryClient.invalidateQueries({ queryKey: queryKeys.activity });
      invalidateDashboard(queryClient);
    },
  });
}

export function useDeleteDocument() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: bigint) => dataSource.deleteDocument(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.documents });
      void queryClient.invalidateQueries({ queryKey: queryKeys.activity });
      invalidateDashboard(queryClient);
    },
  });
}

export function useSaveChecklistItems() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (items: ChecklistItem[]) =>
      dataSource.saveChecklistItems(items),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.checklist });
      void queryClient.invalidateQueries({ queryKey: queryKeys.activity });
    },
  });
}
