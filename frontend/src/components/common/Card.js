import React from 'react';

const Card = ({ children, className = '', onClick, style, header, footer }) => {
  return (
    <div
      className={`cg-card ${className}`.trim()}
      onClick={onClick}
      style={style}
    >
      {header && <div className="cg-card-header">{header}</div>}
      <div className="cg-card-body">{children}</div>
      {footer && <div className="cg-card-footer">{footer}</div>}
    </div>
  );
};

export default Card;
