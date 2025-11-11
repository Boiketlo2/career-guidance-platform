import React from 'react';

const CardGrid = ({ children, className = '', style }) => (
  <div className={`cg-card-grid ${className}`.trim()} style={style}>
    {children}
  </div>
);

export default CardGrid;
