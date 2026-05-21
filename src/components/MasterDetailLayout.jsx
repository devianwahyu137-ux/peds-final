import React from "react";

/**
 * strict 30:45:25 master-detail-context responsive flex-collapse container
 */
const MasterDetailLayout = React.memo(function MasterDetailLayout({ left, center, right }) {
  return (
    <div className="flex flex-col xl:flex-row gap-6 w-full items-start">
      {/* Left Column (30%) */}
      <div className="w-full xl:w-[30%] xl:shrink-0 space-y-5">
        {left}
      </div>
      
      {/* Center Column (45%) */}
      <div className="w-full xl:w-[45%] xl:shrink-0 space-y-5">
        {center}
      </div>
      
      {/* Right Column (25%) */}
      <div className="w-full xl:w-[25%] xl:shrink-0 space-y-5">
        {right}
      </div>
    </div>
  );
});

export default MasterDetailLayout;
