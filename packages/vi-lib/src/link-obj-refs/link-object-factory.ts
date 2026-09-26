import { Logger } from "@tomsoftware/logger";
import { LinkObjectBase } from "./link-object-base";

export interface LinkObjConstructor {
  readonly type?: string;
  new(ident: string): LinkObjectBase;
}

/**
 * Provides a registry for LinkObjBase types and allows
 * creating instances based on a registered string key.
 */
export class LinkObjectFactory {
  private static logging = new Logger('LinkObjectFactory');
  private static register: Map<string, LinkObjConstructor> = new Map();

  /** Registers a LinkObjBase constructor under the specified key. */
  public static registerType(constructor: LinkObjConstructor, ...aliases: string[]): void {
    if (constructor.type) {
      this.addRegistration(constructor.type, constructor);
    }

    for (const alias of aliases) {
      this.addRegistration(alias, constructor);
    }
  }

  private static addRegistration(key: string, constructor: LinkObjConstructor) {
    if (this.register.get(key)) {
      LinkObjectFactory.logging.warn('Already registered parser: ' + key);
      return;
    }

    this.register.set(key, constructor);
  }

  /** Creates a new LinkObjBase instance for the specified key. */
  public static create(key: string): LinkObjectBase | null {
    const Constructor = this.register.get(key);

    if (!Constructor) {
      this.logging.error('Unknown LinkObjectType: "' + key + '"');
      return null;
    }

    return new Constructor(key);
  }
}
