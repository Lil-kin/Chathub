import { Logger } from '../../../../server/lib/logger/Logger';

const deprecationLogger = new Logger('DeprecationWarning');

export const apiDeprecationLogger = deprecationLogger.section('API');
export const methodDeprecationLogger = deprecationLogger.section('METHOD');
export const functionDeprecationLogger = deprecationLogger.section('FUNCTION');
