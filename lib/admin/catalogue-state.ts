export type AdminCatalogueActionState = {
  message?: string;
  fieldErrors?: Record<string, string[] | undefined>;
};

export const initialAdminCatalogueActionState: AdminCatalogueActionState = {};
