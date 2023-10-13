import { InformationModule } from './information/information.module';
import { CompanyModule } from './company/company.module';
import { IntegrationTypeModule } from './integration-type/integration-type.module';

const RequiredModules = [
  InformationModule,
  CompanyModule,
  IntegrationTypeModule,
];

export default RequiredModules;
