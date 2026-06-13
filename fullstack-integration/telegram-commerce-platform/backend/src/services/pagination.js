export function getPagination(query, defaultLimit = 10) {
  const page = Math.max(1, Number(query.page) || 1);
  const limit = Math.min(50, Math.max(1, Number(query.limit) || defaultLimit));

  return {
    page,
    limit,
    skip: (page - 1) * limit,
  };
}

export function pagedResponse(items, total, page, limit) {
  return {
    items,
    page,
    total,
    totalPages: Math.ceil(total / limit) || 1,
  };
}
