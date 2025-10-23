/**
 * Value object for User ID
 * Ensures type safety and validation
 */
export class UserId {
  private constructor(private readonly value: string) {
    if (!this.isValidUUID(value)) {
      throw new Error(`Invalid user ID: ${value}`);
    }
  }

  static create(value: string): UserId {
    return new UserId(value);
  }

  getValue(): string {
    return this.value;
  }

  equals(other: UserId): boolean {
    return this.value === other.value;
  }

  toString(): string {
    return this.value;
  }

  private isValidUUID(uuid: string): boolean {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(uuid);
  }
}

