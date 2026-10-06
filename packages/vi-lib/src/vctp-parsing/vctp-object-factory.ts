import { Logger } from '@tomsoftware/logger';
import { VCTPMainType, VCTPType } from '../vctp-parsing/vctp-types';
import { IObjectFactory, VCTPObjectBase } from '../vctp-parsing/vctp-object-base';
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

type VCTPObjectConstructor = new (
  index: number,
  offset: number,
  length: number,
  flags: number,
  objectType: VCTPType
) => VCTPObjectBase;


export class VCTPObjectFactory implements IObjectFactory {
  private static readonly logging = new Logger('VCTPObjectFactory');
  private nextIndex = 0;
  public objects: VCTPObjectBase[] = [];

  public createObject(offset: number, length: number, flags: number, objectType: number): VCTPObjectBase | null {
    const index = this.nextIndex;
    this.nextIndex++;

    const constr = this.getConstructor(objectType);
    if (constr == null) {
      VCTPObjectFactory.logging.error(`Unknown object type 0x${objectType.toString(16)} [index=${index}] @ ${offset}`);
      return null;
    }

    const newObject = new constr(index, offset, length, flags, objectType);

    this.objects[index] = newObject;

    return newObject;
  }


  private getConstructor(objectType: VCTPType): VCTPObjectConstructor | null {
    const mainType = VCTPObjectBase.mainTypeFromValue(objectType);

    switch (mainType) {
      case VCTPMainType.Number:
        return VCTPObjectNumber;

      case VCTPMainType.NumberPointer:
        return VCTPObjectNumberPtr;

      case VCTPMainType.Blob:
        return VCTPObjectBlob;

      case VCTPMainType.Terminal:
        if (objectType === VCTPType.Terminal) {
          return VCTPObjectTerminal;
        }

        if (objectType === VCTPType.TypeDef) {
          return VCTPObjectTypeDef;
        }
        break;

      case VCTPMainType.Array:
        return VCTPObjectArray;

      case VCTPMainType.Unit:
        return VCTPObjectUnit;

      case VCTPMainType.Ref:
        return VCTPObjectRef;

      case VCTPMainType.Bool:
        return VCTPObjectBool;

      case VCTPMainType.Void:
        return VCTPObjectVoid;

      case VCTPMainType.Cluster:
        if (objectType === VCTPType.Cluster) {
          return VCTPObjectCluster;
        }

        if (objectType === VCTPType.ClusterData) {
          return VCTPObjectClusterData;
        }
        break;
    }

    return VCTPObjectUnknown;
  }
}
