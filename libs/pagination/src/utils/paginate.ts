import type { PaginatedResponse } from "../interfaces/paginated-response.interface";

export interface PaginationParameters {
  page: number;
  limit: number;
}

export function getPaginationParameters(
  page = 1,
  limit = 10,
): { skip: number; take: number } {
  const skip = (page - 1) * limit;
  const take = limit;
  return { skip, take };
}

export function createPaginatedResponse<T>(
  data: T[],
  total: number,
  page: number,
  limit: number,
): PaginatedResponse<T> {
  const totalPages = Math.ceil(total / limit);
  return {
    data,
    meta: {
      total,
      page,
      limit,
      totalPages,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1,
    },
  };
}
