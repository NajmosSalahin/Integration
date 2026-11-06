import { ORDER_STATUSES } from './orderStatus.js';

export { ORDER_STATUSES };

export function parseOrderQuery(query = {}) {
  const { status, page = '1', limit = '20', search, sort } = query;

  if (status !== undefined && (typeof status !== 'string' || !ORDER_STATUSES.includes(status))) {
    return { error: 'Invalid status filter' };
  }
  if (search !== undefined && typeof search !== 'string') {
    return { error: 'Invalid search query' };
  }
  if (sort !== undefined && typeof sort !== 'string') {
    return { error: 'Invalid sort value' };
  }

  const pageNumber = Number(page);
  const limitNumber = Number(limit);
  if (!Number.isInteger(pageNumber) || pageNumber < 1) {
    return { error: 'Page must be a positive integer' };
  }
  if (!Number.isInteger(limitNumber) || limitNumber < 1 || limitNumber > 100) {
    return { error: 'Limit must be between 1 and 100' };
  }

  return { status, search, sort, page: pageNumber, limit: limitNumber };
}
