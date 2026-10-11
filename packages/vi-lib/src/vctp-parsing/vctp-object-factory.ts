import { Logger } from '@tomsoftware/logger';
import { VCTPMainType, VCTPType } from '../vctp-parsing/vctp-types';
import { BaseTypeInfo, IObjectFactory, VCTPObjectBase } from '../vctp-parsing/vctp-object-base';
import { VCTPObjectNumber } from '../vctp-parsing/vctp-object-number';
import { VCTPObjectNumberPtr } from '../vctp-parsing/vctp-object-number-ptr';
import { VCTPObjectBlob } from '../vctp-parsing/vctp-object-blob';
import { VCTPObjectTerminal } from '../vctp-parsing/vctp-object-terminal';
import { VCTPObjectTypeDef } from '../vctp-parsing/vctp-object-type-def';
import { VCTPObjectArray } from '../vctp-parsing/vctp-object-array';
import { VCTPObjectUnit } from '../vctp-parsing/vctp-object-unit';
import { VCTPObjectRef } from '../vctp-parsing/vctp-object-ref';
import { VCTPObjectBool } from '../vctp-parsing/vctp-object-bool';
import { VCTPObjectVoid } from '../vctp-parsing/vctp-object-void';
import { VCTPObjectCluster } from '../vctp-parsing/vctp-object-cluster';
import { VCTPObjectClusterData } from '../vctp-parsing/vctp-object-cluster-data';
import { VCTPObjectUnknown } from './vctp-object-unknown';
import { VCTPObjectBlock } from './vctp-object-block';

/** Generates a new VCTP-Object for a given type */
export class VCTPObjectFactory implements IObjectFactory {
  private static readonly logging = new Logger('VCTPObjectFactory');
  private nextIndex = 0;
  /** registry for all defined objects */
  public objects: VCTPObjectBase[] = [];

  /** returns a objects by it's index */
  public resolveObjectByIndex(index: number): VCTPObjectBase {
    return this.objects[index];
  }

  public createObject(baseTypeInfo: BaseTypeInfo): VCTPObjectBase | null {
    const index = this.nextIndex;
    this.nextIndex++;

    const newObject = this.createObjectFromType(baseTypeInfo.objectType, index, baseTypeInfo);

    this.objects[index] = newObject;

    return newObject;
  }


  private createObjectFromType(objectType: number, index: number, baseTypeInfo: BaseTypeInfo): VCTPObjectBase {
    const mainType = VCTPObjectBase.mainTypeFromValue(objectType);

    switch (mainType) {
      case VCTPMainType.Number:
        return new VCTPObjectNumber(index, baseTypeInfo);

      case VCTPMainType.NumberPointer:
        return new VCTPObjectNumberPtr(index, baseTypeInfo);

      case VCTPMainType.Blob:
        return new VCTPObjectBlob(index, baseTypeInfo);

      case VCTPMainType.Block:
        return new VCTPObjectBlock(index, baseTypeInfo);

      case VCTPMainType.Terminal:
        if (objectType === VCTPType.Terminal) {
          return new VCTPObjectTerminal(index, baseTypeInfo);
        }

        if (objectType === VCTPType.TypeDef) {
          return new VCTPObjectTypeDef(index, baseTypeInfo);
        }
        break;

      case VCTPMainType.Array:
        return new VCTPObjectArray(index, baseTypeInfo);

      case VCTPMainType.Unit:
        return new VCTPObjectUnit(index, baseTypeInfo);

      case VCTPMainType.Ref:
        return new VCTPObjectRef(index, baseTypeInfo);

      case VCTPMainType.Bool:
        return new VCTPObjectBool(index, baseTypeInfo);

      case VCTPMainType.Void:
        return new VCTPObjectVoid(index, baseTypeInfo);

      case VCTPMainType.Cluster:
        if (objectType === VCTPType.Cluster) {
          return new VCTPObjectCluster(index, baseTypeInfo);
        }

        if (objectType === VCTPType.ClusterData) {
          return new VCTPObjectClusterData(index, baseTypeInfo);
        }
        break;
    }

    VCTPObjectFactory.logging.error(`Unknown object type 0x${objectType.toString(16)} [index=${index}] @ ${baseTypeInfo.offset}`);
    return new VCTPObjectUnknown(index, baseTypeInfo);
  }
}
