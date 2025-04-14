import React from 'react';

const IntensityMeter = ({ intensity }) => {
  // Extract numeric value from intensity string (e.g., "7/10" -> 7)
  const intensityValue = parseInt(intensity.split('/')[0]);
  const maxValue = parseInt(intensity.split('/')[1]);

  return (
    <div className="flex items-center">
      <div className="flex-1 flex items-center h-2 bg-gray-200 rounded-full overflow-hidden">
        <div
          className="bg-green-700 h-full"
          style={{ width: `${(intensityValue / maxValue) * 100}%` }}
        />
      </div>
      <span className="ml-2 font-medium">{intensity}</span>
    </div>
  );
};

export default IntensityMeter;
