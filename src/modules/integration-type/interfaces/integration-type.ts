interface IIntegrationTypeDetail {
  id: string;
  name: string;
  disabled: boolean;
}

export interface IIntegrationType {
  integration_types: IIntegrationTypeDetail[];
  created_at: string;
  created_by: string;
  updated_at: string;
  updated_by: string;
}
