import { Importers } from '/app/importer';
import { HipChatEnterpriseImporterInfo } from '../lib/info';
import { HipChatEnterpriseImporter } from './importer';

Importers.add(new HipChatEnterpriseImporterInfo(), HipChatEnterpriseImporter);
