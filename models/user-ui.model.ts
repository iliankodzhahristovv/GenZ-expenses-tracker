/**
 * UI Model for User
 * This is the format used by the presentation layer (components)
 */
export interface UserUI {
  id: string;
  email: string;
  displayName: string;
  currency: string;
  createdAt: string;
  updatedAt: string;
}

