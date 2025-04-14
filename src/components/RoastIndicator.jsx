import React from 'react';

const RoastIndicator = ({ level }) => {
  const levels = ['LIGHT', 'MEDIUM', 'DARK'];
  const levelIndex = levels.indexOf(level);

  return (
    <div className="flex items-center">
      <div className="flex-1 flex items-center gap-1">
        {levels.map((roastType, index) => (
          <div
            key={roastType}
            className={`h-2 rounded-full flex-1 ${
              index <= levelIndex
                ? index === 0
                  ? 'bg-yellow-400'
                  : index === 1
                  ? 'bg-amber-600'
                  : 'bg-brown-800'
                : 'bg-gray-200'
            }`}
          />
        ))}
      </div>
      <span className="ml-2 font-medium">
        {level.charAt(0) + level.slice(1).toLowerCase()}
      </span>
    </div>
  );
};

export default RoastIndicator;
