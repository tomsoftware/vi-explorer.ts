import { ViDataReader } from '../vi-data-reader';
import { IObjectFactory, TypeGroup, VCTPObjectBase } from './vctp-object-base';
import { ViVersion } from '../vi-version';
import { VCTPClientRef } from './vctp-client-ref';
import { VCTPType } from './vctp-types';

export class VCTPObjectCluster extends VCTPObjectBase {
  public parse(reader: ViDataReader, version: ViVersion, factory: IObjectFactory) {
    const count = reader.readUInt16('vctp-cluster.count');
    if (count > 500) {
      VCTPObjectBase.logging.error(`Cluster Item count (${count}) is > 124 @ ${this.offset}`);
      return false;
    }

    for (let i = 0; i < count; i++) {
      const index = reader.readUInt16('vctp-cluster.index');
      this.children.push(new VCTPClientRef(index, factory.resolveObjectByIndex(index), 0));
    }

    this.paresLabel(reader);
  }

  public get typeGroup(): TypeGroup {
    return this.type == VCTPType.ClusterNumFixPoint ? TypeGroup.Number : TypeGroup.Container;
  }

  public override get connectorColor(): string {
    return 'rgb(255, 11, 255)';
  }
}
