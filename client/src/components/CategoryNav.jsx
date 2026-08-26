import React from 'react';

const CategoryNav = ({ categories = [], activeSubcategory, onSubcategoryChange }) => {
  const subcategories = [
    'All Items',
    ...categories.map(c => c.name)
  ];

  return (
    <div>
      {/* Sub-Category Filter Bar */}
      <div className="subcategory-bar">
        <ul className="subcategory-list">
          {subcategories.map((sub) => (
            <li key={sub}>
              <a
                href={`#${sub.toLowerCase().replace(/\s+/g, '-')}`}
                className={`subcategory-link ${activeSubcategory === sub ? 'active' : ''}`}
                onClick={(e) => {
                  e.preventDefault();
                  onSubcategoryChange(sub);
                }}
              >
                {sub}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default CategoryNav;
