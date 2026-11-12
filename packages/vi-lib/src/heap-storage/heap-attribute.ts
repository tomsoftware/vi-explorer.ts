import { HeapNodeConstants } from "./heap-node-constants";

enum SL_SYSTEM_ATTRIB_TAGS {
  SL__class = -2,
  SL__uid = -3,
  SL__stockObj = -4,
  SL__elements = -5,
  SL__index = -6,
  SL__stockSource = -7
}

export class HeapAttribute {
  public attributeTypeId: number;
  public value: number;

  /** return true if this is the class attribute */
  public get isClass() {
    return this.attributeTypeId === SL_SYSTEM_ATTRIB_TAGS.SL__class  /* SL__class */
  }

  /** if this is a class attribute this will return the name of the class */
  public get className() {
    return HeapNodeConstants.getClassNameById(this.value);
  }

  /** returns the name of the attribute if known */
  public get attributeTypeName(): string {
   const name = SL_SYSTEM_ATTRIB_TAGS[this.attributeTypeId];
   if (name == null) {
    // unknown name - return value
    return '' + this.attributeTypeId;
   }

   /** remove 'SL__' prefix */
   return name.substring(4);
  }

  constructor(attributeTypeId: number, value: number) {
    this.attributeTypeId = attributeTypeId;
    this.value = value;
  }

  public toJSON() {
    if (this.isClass) {
      return {
        class: this.className
      }
    }

    return {
      [this.attributeTypeName]: this.value
    }
  }
}