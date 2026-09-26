import { LinkObjectFactory } from './link-object-factory';
import { LVIN } from './object-types/lvin';
import { PICT } from './object-types/pict';
import { PTH0 } from './object-types/pth0';
import { VICC } from './object-types/vicc';
import { VILB } from './object-types/vilb';
import { VIPI } from './object-types/vipi';
import { VIVI } from './object-types/vivi';

let parsersRegistered = false;

export function registerParsers(): void {
  if (parsersRegistered) {
    return;
  }
  parsersRegistered = true;

  LinkObjectFactory.registerType(LVIN);
  LinkObjectFactory.registerType(PICT);
  LinkObjectFactory.registerType(PTH0);
  LinkObjectFactory.registerType(VICC);
  LinkObjectFactory.registerType(VILB);
  LinkObjectFactory.registerType(VIVI);
  LinkObjectFactory.registerType(VIPI);
  
}
