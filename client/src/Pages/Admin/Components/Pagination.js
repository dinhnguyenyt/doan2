function Pagination({ page, totalPages, onPageChange }) {
    if (totalPages <= 1) return null;

    const pages = Array.from({ length: totalPages }, (_, i) => i + 1)
        .filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 2)
        .reduce((acc, p, idx, arr) => {
            if (idx > 0 && p - arr[idx - 1] > 1) acc.push('...');
            acc.push(p);
            return acc;
        }, []);

    return (
        <div style={{ display: 'flex', justifyContent: 'center', gap: '6px', marginTop: '12px', flexWrap: 'wrap' }}>
            <button className="btn btn-outline-secondary btn-sm" disabled={page === 1} onClick={() => onPageChange(page - 1)}>&laquo;</button>
            {pages.map((p, i) =>
                p === '...' ? (
                    <span key={`d${i}`} style={{ padding: '4px 8px' }}>…</span>
                ) : (
                    <button
                        key={p}
                        className={`btn btn-sm ${page === p ? 'btn-primary' : 'btn-outline-secondary'}`}
                        onClick={() => onPageChange(p)}
                    >
                        {p}
                    </button>
                ),
            )}
            <button className="btn btn-outline-secondary btn-sm" disabled={page === totalPages} onClick={() => onPageChange(page + 1)}>&raquo;</button>
        </div>
    );
}

export default Pagination;
