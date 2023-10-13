interface CompanyDetail {
  code: string;
  name: string;
  address: string;
  company_type_code: string;
  company_type_name: string;
}

export interface Companies {
  companies: CompanyDetail[];
  created_at: string;
  created_by: string;
  updated_at: string;
  updated_by: string;
}
