import Link from 'next/link';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  basePath: string;
}

export function Pagination({ currentPage, totalPages, basePath }: PaginationProps) {
  if (totalPages <= 1) {
    return null;
  }

  const getPageUrl = (page: number) => {
    return page === 1 ? basePath : basePath + "?page=" + page;
  };

  return (
    <nav className="axil-pagination text-center mt--60" aria-label="Pagination">
      <ul className="pagination-list justify-center">
        {/* Previous Button */}
        {currentPage > 1 && (
          <li className="pagination-item prev">
            <Link
              href={getPageUrl(currentPage - 1)}
              className="axil-button btn-outline-primary"
              aria-label="Previous page"
            >
              <i className="fas fa-arrow-left" /> Previous
            </Link>
          </li>
        )}

        {/* Page Numbers */}
        {Array.from({ length: totalPages }, (_, i) => i + 1)
          .filter(
            (page) =>
              page === 1 ||
              page === totalPages ||
              (page >= currentPage - 1 && page <= currentPage + 1)
          )
          .map((page, index, filtered) => {
            const showEllipsisBefore =
              index > 0 && filtered[index - 1] !== page - 1;
            const showEllipsisAfter =
              index < filtered.length - 1 && filtered[index + 1] !== page + 1;

            return (
              <div key={page} className="inline-flex items-center">
                {showEllipsisBefore && (
                  <li className="pagination-item dots">
                    <span>...</span>
                  </li>
                )}
                <li className={"pagination-item " + (page === currentPage ? "active" : "")}>
                  {page === currentPage ? (
                    <span className="axil-button btn-fill-primary">{page}</span>
                  ) : (
                    <Link
                      href={getPageUrl(page)}
                      className="axil-button btn-outline-primary"
                    >
                      {page}
                    </Link>
                  )}
                </li>
                {showEllipsisAfter && (
                  <li className="pagination-item dots">
                    <span>...</span>
                  </li>
                )}
              </div>
            );
          })}

        {/* Next Button */}
        {currentPage < totalPages && (
          <li className="pagination-item next">
            <Link
              href={getPageUrl(currentPage + 1)}
              className="axil-button btn-outline-primary"
              aria-label="Next page"
            >
              Next <i className="fas fa-arrow-right" />
            </Link>
          </li>
        )}
      </ul>
    </nav>
  );
}
