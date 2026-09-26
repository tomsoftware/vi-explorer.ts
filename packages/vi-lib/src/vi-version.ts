export enum LabViewVersionStage {
  Unknown = 0,
  Development = 1,
  Alpha = 2,
  Beta = 3,
  Release = 4,
}

export class ViVersion {
  private readonly versionNumber: number;

  constructor(versionNumber: number) {
    this.versionNumber = versionNumber;
  }

  public get version(): number {
    return this.versionNumber;
  }

  public get major(): number {
    return (this.versionNumber & 0x0f) + (((this.versionNumber >>> 4) & 0x0f) * 10);
  }

  public get minor(): number {
    return (this.versionNumber >>> 12) & 0x0f;
  }

  public get bugfix(): number {
    return (this.versionNumber >>> 16) & 0x0f;
  }

  public get stage(): LabViewVersionStage {
    return (this.versionNumber >>> 21) & 0x07;
  }

  public get stageText(): string {
    const texts = ['unknown', 'development', 'alpha', 'beta', 'release'];
    return texts[this.stage] ?? texts[0];
  }

  public get flags(): number {
    return (this.versionNumber >>> 24) & 0x1f;
  }

  public get build(): number {
    return ((this.versionNumber >>> 28) & 0x0f) * 10 +
           ((this.versionNumber >>> 24) & 0x0f);
  }

  /**
   * Compares this version with the specified major and optional minor version.
   * Returns:
   *  1 if this version is greater,
   * -1 if it is smaller,
   *  or 0 if the compared versions are equal
  */
  public compareTo(major: number, minor?: number): number {
    if (this.major > major) {
      return 1;
    }
    if (this.major < major) {
      return -1;
    }

    // this.major == major
    if (minor == null) {
      return 0;
    }

    if (this.minor > minor) {
      return 1;
    }
    if (this.minor < minor) {
      return -1;
    }
    return 0;
  }

  public toString(): string {
    return `${this.major}.${this.minor}.${this.bugfix} (${this.stageText} ${this.build})`;
  }
}
