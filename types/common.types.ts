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

/**
 * Data response type for server actions
 */
export interface DataResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

/**
 * Builder for creating DataResponse objects
 */
export class DataResponseBuilder {
  static success<T>(data: T): DataResponse<T> {
    return {
      success: true,
      data,
    };
  }

  static failure<T>(error: string): DataResponse<T> {
    return {
      success: false,
      error,
    };
  }
}

