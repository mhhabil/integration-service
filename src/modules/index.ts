import { CompanyModule } from './company/company.module';
import { IntegrationTypeModule } from './integration-type/integration-type.module';
import { SatuSehatModule } from './satu-sehat/satu-sehat.module';
import { LogModule } from './log/log.module';

const RequiredModules = [
  SatuSehatModule,
  CompanyModule,
  IntegrationTypeModule,
  LogModule,
];

export default RequiredModules;
