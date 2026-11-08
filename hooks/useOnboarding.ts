import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
  OnboardingForm,
  OnboardingSubmission,
  GenerateOnboardingFormResponse,
} from "@/lib/types/onboarding";

export function useOnboardingForms() {
  return useQuery<{ forms: OnboardingForm[] }>({
    queryKey: ["admin", "onboarding-forms"],
    queryFn: async () => {
      const res = await fetch("/api/admin/onboarding");
      if (!res.ok) {
        throw new Error("Failed to load onboarding forms");
      }
      return res.json();
    },
  });
}

export function useOnboardingForm(id: string | null) {
  return useQuery<{ form: OnboardingForm }>({
    queryKey: ["admin", "onboarding-form", id],
    queryFn: async () => {
      if (!id) throw new Error("No ID provided");
      const res = await fetch(`/api/admin/onboarding/${id}`);
      if (!res.ok) {
        throw new Error("Failed to load onboarding form");
      }
      return res.json();
    },
    enabled: Boolean(id),
  });
}

export function useAvailableProposals() {
  return useQuery<{
    proposals: Array<{
      id: string;
      name: string;
      email: string;
      project_type: string;
      summary: string;
      estimated_timeline: string;
      estimated_cost: string;
      created_at: string;
      status: string;
    }>;
  }>({
    queryKey: ["admin", "onboarding-proposals-list"],
    queryFn: async () => {
      const res = await fetch("/api/admin/onboarding/proposals");
      if (!res.ok) {
        throw new Error("Failed to load proposals");
      }
      return res.json();
    },
  });
}

export function useSaveOnboardingForm(options?: {
  onSuccess?: (form: OnboardingForm) => void;
  onError?: (error: Error) => void;
}) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: Partial<OnboardingForm> & { id?: string }) => {
      const isUpdate = Boolean(payload.id);
      const url = isUpdate
        ? `/api/admin/onboarding/${payload.id}`
        : "/api/admin/onboarding";
      const method = isUpdate ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to save onboarding form");
      }
      return data.form as OnboardingForm;
    },
    onSuccess: (form) => {
      queryClient.invalidateQueries({ queryKey: ["admin", "onboarding-forms"] });
      queryClient.invalidateQueries({
        queryKey: ["admin", "onboarding-form", form.id],
      });
      options?.onSuccess?.(form);
    },
    onError: (error: Error) => {
      options?.onError?.(error);
    },
  });
}

export function useDeleteOnboardingForm(options?: {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/admin/onboarding/${id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to delete form");
      }
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "onboarding-forms"] });
      options?.onSuccess?.();
    },
    onError: (error: Error) => {
      options?.onError?.(error);
    },
  });
}

export function useGenerateOnboardingForm(options?: {
  onSuccess?: (data: { generated: GenerateOnboardingFormResponse; form?: OnboardingForm }) => void;
  onError?: (error: Error) => void;
}) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: {
      quoteId?: string;
      save?: boolean;
      customContext?: string;
      clientName?: string;
      clientEmail?: string;
      projectType?: string;
      description?: string;
      summary?: string;
      deliverables?: string[];
      techStack?: string[];
      phases?: Array<{ name: string; tasks?: string[] }>;
      clientResponsibilities?: string[];
      timeline?: string;
    }) => {
      const res = await fetch("/api/admin/onboarding/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to generate form");
      }
      return data as {
        success: boolean;
        generated: GenerateOnboardingFormResponse;
        form?: OnboardingForm;
      };
    },
    onSuccess: (data) => {
      if (data.form) {
        queryClient.invalidateQueries({
          queryKey: ["admin", "onboarding-forms"],
        });
      }
      options?.onSuccess?.(data);
    },
    onError: (error: Error) => {
      options?.onError?.(error);
    },
  });
}

export function useFormSubmissions(formId: string | null) {
  return useQuery<{ submissions: OnboardingSubmission[] }>({
    queryKey: ["admin", "onboarding-submissions", formId],
    queryFn: async () => {
      if (!formId) throw new Error("No form ID provided");
      const res = await fetch(`/api/admin/onboarding/${formId}/submissions`);
      if (!res.ok) {
        throw new Error("Failed to load submissions");
      }
      return res.json();
    },
    enabled: Boolean(formId),
  });
}

export function useUpdateSubmissionStatus(options?: {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: {
      formId: string;
      submissionId: string;
      status: "submitted" | "reviewed";
      notes?: string;
    }) => {
      const res = await fetch(
        `/api/admin/onboarding/${payload.formId}/submissions`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to update submission");
      }
      return data;
    },
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({
        queryKey: ["admin", "onboarding-submissions", vars.formId],
      });
      options?.onSuccess?.();
    },
    onError: (error: Error) => {
      options?.onError?.(error);
    },
  });
}
