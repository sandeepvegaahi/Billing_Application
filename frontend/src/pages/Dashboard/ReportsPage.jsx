

import { useState } from "react";
import FinancialReports from "../../components/reports/FinancialReports";
import DueReports from "../../components/reports/DueReports";
import SummaryReports from "../../components/reports/SummaryReports";

const ReportsPage = () => {
  const [activeTab, setActiveTab] = useState("financial");

  const tabs = [
    { id: "financial", label: "Financial Reports" },
    { id: "due", label: "Due Reports" },
    { id: "summary", label: "Summary Reports" },
  ];

  return (
    <div className="p-4">
      <h2 className="text-xl font-semibold mb-1">Reports</h2>
      <p className="text-gray-500 text-sm mb-6">
        Generate financial, due, and summary reports
      </p>

    
      <div className="flex gap-3 bg-gray-100 rounded-md p-1 mb-6">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 text-center py-2 text-sm font-medium rounded-md transition
              ${
                activeTab === tab.id
                  ? "bg-blue-600 text-white shadow"
                  : "text-gray-600 hover:bg-gray-200"
              }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

     
      <div>
        {activeTab === "financial" && <FinancialReports />}
        {activeTab === "due" && <DueReports />}
        {activeTab === "summary" && <SummaryReports />}
      </div>
    </div>
  );
};

export default ReportsPage;

