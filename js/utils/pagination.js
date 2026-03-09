/**
 * SFA02 - ページネーション共通ユーティリティ
 */

const PaginationUtils = {
  defaultPerPage: 20,

  /**
   * ページネーション適用
   */
  paginate(items, page, perPage) {
    perPage = perPage || this.defaultPerPage;
    const start = (page - 1) * perPage;
    return {
      items: items.slice(start, start + perPage),
      total: items.length,
      totalPages: Math.ceil(items.length / perPage),
      currentPage: page,
      perPage,
    };
  },
};
