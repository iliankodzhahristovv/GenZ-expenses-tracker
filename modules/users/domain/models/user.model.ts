/**
 * Domain model for User
 * This represents the core business entity
 */
export interface User {
  id: string;
  email: string;
  name: string | null;
  createdAt: Date;
  updatedAt: Date;
}

