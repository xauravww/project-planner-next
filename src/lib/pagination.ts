/**
 * Pagination utilities for database queries
 * Prevents memory issues with large datasets
 */

export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface PaginatedResult<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 50;
const MAX_LIMIT = 100;

/**
 * Parse and validate pagination parameters from request
 */
export function parsePaginationParams(
  searchParams: URLSearchParams | Record<string, string>
): Required<PaginationParams> {
  let page = DEFAULT_PAGE;
  let limit = DEFAULT_LIMIT;
  let sortBy = "createdAt";
  let sortOrder: "asc" | "desc" = "desc";

  if (searchParams instanceof URLSearchParams) {
    const pageParam = searchParams.get("page");
    const limitParam = searchParams.get("limit");
    const sortByParam = searchParams.get("sortBy");
    const sortOrderParam = searchParams.get("sortOrder");

    if (pageParam) {
      const parsed = parseInt(pageParam, 10);
      if (!isNaN(parsed) && parsed > 0) page = parsed;
    }

    if (limitParam) {
      const parsed = parseInt(limitParam, 10);
      if (!isNaN(parsed) && parsed > 0) {
        limit = Math.min(parsed, MAX_LIMIT);
      }
    }

    if (sortByParam) sortBy = sortByParam;
    if (sortOrderParam === "asc" || sortOrderParam === "desc") {
      sortOrder = sortOrderParam;
    }
  } else {
    // Handle Record<string, string>
    if (searchParams.page) {
      const parsed = parseInt(searchParams.page, 10);
      if (!isNaN(parsed) && parsed > 0) page = parsed;
    }

    if (searchParams.limit) {
      const parsed = parseInt(searchParams.limit, 10);
      if (!isNaN(parsed) && parsed > 0) {
        limit = Math.min(parsed, MAX_LIMIT);
      }
    }

    if (searchParams.sortBy) sortBy = searchParams.sortBy;
    if (searchParams.sortOrder === "asc" || searchParams.sortOrder === "desc") {
      sortOrder = searchParams.sortOrder;
    }
  }

  return { page, limit, sortBy, sortOrder };
}

/**
 * Calculate skip value for Prisma queries
 */
export function calculateSkip(page: number, limit: number): number {
  return (page - 1) * limit;
}

/**
 * Create paginated response
 */
export function createPaginatedResponse<T>(
  data: T[],
  total: number,
  page: number,
  limit: number
): PaginatedResult<T> {
  const totalPages = Math.ceil(total / limit);
  
  return {
    data,
    pagination: {
      page,
      limit,
      total,
      totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    },
  };
}

/**
 * Prisma query options for pagination
 */
export function getPrismaPaginationOptions(params: PaginationParams) {
  const { page = DEFAULT_PAGE, limit = DEFAULT_LIMIT, sortBy = "createdAt", sortOrder = "desc" } = params;
  
  return {
    skip: calculateSkip(page, limit),
    take: limit,
    orderBy: { [sortBy]: sortOrder },
  };
}
