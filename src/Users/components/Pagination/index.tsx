import React from 'react';
import classNames from 'classnames';

interface PaginationProps {
  page: number,
  pagesCount: number,
  loadPage: (page: number) => void,
}

function Pagination ({ loadPage, page, pagesCount }: PaginationProps) {
  const endReached = page + 1 >= pagesCount;
  const loadFirst = () => page > 0 && loadPage(0);
  const loadPrev = () => page > 0 && loadPage(page - 1);
  const loadNext = () => !endReached && loadPage(page + 1);
  const loadLast = () => !endReached && loadPage(pagesCount - 1);
  const pages = [];
  for (let i = 0; i < pagesCount; i++) {
  	const active = i === page;
  	pages.push((
      <div
        key={i}
        className={classNames('page', { active })}
        onClick={() => !active && loadPage(i)}>{i + 1}</div>
    ))
  }
  return (
    <div className='pagination'>
      { page > 0 && <div className='page' onClick={loadFirst}>{'<<'}</div> }
      { page > 0 && <div className='page' onClick={loadPrev}>{'<'}</div> }
      {pages}
      { !endReached && <div className='page' onClick={loadNext}>{'>'}</div> }
      { !endReached && <div className='page' onClick={loadLast}>{'>>'}</div> }
    </div>
  )
}

export default Pagination;
