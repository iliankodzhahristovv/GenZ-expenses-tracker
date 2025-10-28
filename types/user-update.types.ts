/**
 * DTO for updating user data
 * Only includes fields that are allowed to be updated
 */
export interface UpdateUserDTO {
  name?: string | null;
  currency?: string | null;
}


