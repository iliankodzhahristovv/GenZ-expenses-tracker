/**
 * Common type definitions used across the application
 */

/**
 * Generic API response type
 */
export interface ApiResponse<T> {
  data?: T;
  error?: string;
  success: boolean;
}

/**
 * Pagination parameters
 */
export interface PaginationParams {
  page: number;
  limit: number;
}

/**
 * Paginated response
 */
export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/**
 * Sort order
 */
export type SortOrder = "asc" | "desc";

/**
 * Base entity with timestamps
 */
export interface BaseEntity {
  id: string;
  createdAt: Date;
  updatedAt: Date;
}

