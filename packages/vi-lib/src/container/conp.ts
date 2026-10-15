import { Logger } from '@tomsoftware/logger';
import { VirtualFile } from '@tomsoftware/virtual-fs';
import { ConnectorPanelBase } from './connector-panel-base';

/**
 * Connector Pane Content Type -
 *   Holds a list of type descriptor references. A VI stores exactly one
 *   entry; a library (LLB) may store several.
 *   The referenced type descriptor is of the Function type. Its own list of
 *   sub-types holds the types of the connectors bound to the terminal
 *   points on the VI icon's connector pane.
 *   In LabVIEW 7.1, the equivalent block is named CPCT.
*/
export class CONP extends ConnectorPanelBase{
}
