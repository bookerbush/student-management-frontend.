import React from "react";

export const LeaveSection = () => {
  const newRequests = [1, 2, 3];
  const onLeave = [4, 5];

  return (
    <div className="bg-white p-4 shadow rounded flex justify-around mt-4">
      <div>
        <h4 className="text-md font-semibold mb-2">New Leave Requests</h4>
        <div className="flex gap-2">
          {newRequests.map((_, i) => (
            <div key={i} className="w-10 h-10 bg-gray-300 rounded-full"></div>
          ))}
        </div>
      </div>
      <div>
        <h4 className="text-md font-semibold mb-2">On Leave Employees</h4>
        <div className="flex gap-2">
          {onLeave.map((_, i) => (
            <div key={i} className="w-10 h-10 bg-gray-400 rounded-full"></div>
          ))}
        </div>
      </div>
    </div>
  );
};
