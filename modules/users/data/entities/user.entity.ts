/**
 * Database entity for User
 * Represents the structure of the user table in the database
 */
export interface UserEntity {
  id: string;
  email: string;
  name: string | null;
  currency: string | null;
  created_at: string;
  updated_at: string;
}

