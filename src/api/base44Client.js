// Deprecated: kept for backward compatibility — now re-exports professional TOLS client
// Migrated: all imports now use @/api/client — this file is deprecated wrapper, will be removed in v2
import { tols } from './client.js';
export const base44 = tols;
export default tols;
