/**
 * Common type definitions used across the application
 */

/**
 * Generic API response type
 * Used for both API endpoints and server actions
 */
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
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
 * Builder for creating ApiResponse objects
 * Provides convenience methods for success/failure responses
 */
export class ApiResponseBuilder {
  static success<T>(data: T): ApiResponse<T> {
    return {
      success: true,
      data,
    };
  }

  static failure<T>(error: string): ApiResponse<T> {
    return {
      success: false,
      error,
    };
  }
}

