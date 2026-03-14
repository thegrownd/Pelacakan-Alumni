import { useQueryClient } from "@tanstack/react-query";
import {
  useGetAlumni,
  useCreateAlumni,
  useUpdateAlumni,
  useDeleteAlumni,
  useGetAlumniById,
  getGetAlumniQueryKey,
  useGetCandidates,
  useVerifyCandidate,
  useRejectCandidate,
  getGetCandidatesQueryKey,
  useGetDashboardStats,
  useRunScheduler,
  getGetDashboardStatsQueryKey,
  getGetAlumniByIdQueryKey,
  type GetCandidatesParams
} from "@workspace/api-client-react";
import { useToast } from "@/hooks/use-toast";

// ALUMNI HOOKS WITH INVALIDATION
export function useAlumniList() {
  return useGetAlumni();
}

export function useAlumniDetail(id: number) {
  return useGetAlumniById(id);
}

export function useCreateAlumniMutation() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useCreateAlumni({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetAlumniQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetDashboardStatsQueryKey() });
        toast({ title: "Berhasil", description: "Data alumni berhasil ditambahkan." });
      },
      onError: (error) => {
        toast({ variant: "destructive", title: "Gagal", description: "Gagal menambahkan alumni." });
      }
    }
  });
}

export function useUpdateAlumniMutation() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useUpdateAlumni({
    mutation: {
      onSuccess: (data, variables) => {
        queryClient.invalidateQueries({ queryKey: getGetAlumniQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetAlumniByIdQueryKey(variables.id) });
        toast({ title: "Berhasil", description: "Data alumni berhasil diperbarui." });
      },
      onError: () => {
        toast({ variant: "destructive", title: "Gagal", description: "Gagal memperbarui alumni." });
      }
    }
  });
}

export function useDeleteAlumniMutation() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useDeleteAlumni({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetAlumniQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetDashboardStatsQueryKey() });
        toast({ title: "Berhasil", description: "Data alumni berhasil dihapus." });
      }
    }
  });
}

// TRACKING / CANDIDATE HOOKS WITH INVALIDATION
export function useCandidateList(params?: GetCandidatesParams) {
  return useGetCandidates(params);
}

export function useVerifyCandidateMutation() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useVerifyCandidate({
    mutation: {
      onSuccess: (data) => {
        queryClient.invalidateQueries({ queryKey: getGetCandidatesQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetAlumniByIdQueryKey(data.alumniId) });
        queryClient.invalidateQueries({ queryKey: getGetAlumniQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetDashboardStatsQueryKey() });
        toast({ title: "Diverifikasi", description: "Kandidat berhasil diverifikasi sebagai alumni." });
      }
    }
  });
}

export function useRejectCandidateMutation() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useRejectCandidate({
    mutation: {
      onSuccess: (data) => {
        queryClient.invalidateQueries({ queryKey: getGetCandidatesQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetAlumniByIdQueryKey(data.alumniId) });
        toast({ title: "Ditolak", description: "Kandidat ditolak." });
      }
    }
  });
}

// DASHBOARD & SCHEDULER
export function useDashboardStats() {
  return useGetDashboardStats();
}

export function useGlobalSchedulerMutation() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useRunScheduler({
    mutation: {
      onSuccess: (result) => {
        queryClient.invalidateQueries({ queryKey: getGetDashboardStatsQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetAlumniQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetCandidatesQueryKey() });
        toast({ 
          title: "Pelacakan Selesai", 
          description: `Memproses ${result.processed} data. Menemukan ${result.newCandidatesFound} kandidat baru.` 
        });
      },
      onError: () => {
        toast({ variant: "destructive", title: "Gagal", description: "Gagal menjalankan pelacakan global." });
      }
    }
  });
}
