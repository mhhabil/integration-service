import { CompanyModule } from './company/company.module';
import { IntegrationTypeModule } from './integration-type/integration-type.module';
import { SatuSehatModule } from './satu-sehat/satu-sehat.module';

const RequiredModules = [SatuSehatModule, CompanyModule, IntegrationTypeModule];

export default RequiredModules;
