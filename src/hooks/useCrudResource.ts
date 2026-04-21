import { useMemo } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { BaseRecord, ModuleConfig } from "../types/entities";
import { useDataverseClient } from "../services/dataverse/DataverseContext";
import { DataverseCrudService } from "../services/dataverse/DataverseCrudService";

export function useCrudService<TRecord extends BaseRecord>(moduleConfig: ModuleConfig<TRecord>) {
  const client = useDataverseClient();
  return useMemo(() => new DataverseCrudService(client, moduleConfig), [client, moduleConfig]);
}

export function useCrudResource<TRecord extends BaseRecord>(moduleConfig: ModuleConfig<TRecord>) {
  const queryClient = useQueryClient();
  const service = useCrudService(moduleConfig);


  const listQuery = useQuery({
    queryKey: [moduleConfig.key, "list"],
    queryFn: () => service.list(),
  });

  const createMutation = useMutation({
    mutationFn: (values: Partial<TRecord>) => service.create(values),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: [moduleConfig.key] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, values }: { id: string; values: Partial<TRecord> }) =>
      service.update(id, values),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: [moduleConfig.key] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => service.delete(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: [moduleConfig.key] });
    },
  });

  return {
    service,
    listQuery,
    createMutation,
    updateMutation,
    deleteMutation,
  };
}
