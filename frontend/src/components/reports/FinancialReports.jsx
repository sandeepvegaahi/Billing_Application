// // import { useEffect, useState } from "react";
// // import axios from "../../api/api";

// // const FinancialReports = () => {
// //   const [reportType, setReportType] = useState("day");
// //   const [fees, setFees] = useState([]);
// //   const [selectedFee, setSelectedFee] = useState("");
// //   const [branch, setBranch] = useState("ALL");

// //   // Date states
// //   const [singleDate, setSingleDate] = useState("");
// //   const [month, setMonth] = useState("");
// //   const [fromDate, setFromDate] = useState("");
// //   const [toDate, setToDate] = useState("");

// //   // Report preview
// //   const [showTable, setShowTable] = useState(false);

// //   // Dummy data (replace later with backend response)
// //   const [reportData, setReportData] = useState([]);

// //   useEffect(() => {
// //     fetchFeeCategories();
// //   }, []);

// //   const fetchFeeCategories = async () => {
// //     try {
// //       const res = await axios.get("/fee-structure");
// //       setFees(res.data.data);
// //     } catch (err) {
// //       console.error("Failed to fetch fee categories", err);
// //     }
// //   };

// //   const handleGenerateReport = () => {
// //     // TEMP dummy data (backend later)
// //     const dummyData = [
// //       {
// //         date: "2026-01-10",
// //         student: "Ravi Kumar",
// //         branch: "CSE",
// //         category: "Tuition Fee",
// //         amount: 25000,
// //         mode: "Online",
// //       },
// //       {
// //         date: "2026-01-12",
// //         student: "Anjali Sharma",
// //         branch: "EEE",
// //         category: "Bus Fee",
// //         amount: 8000,
// //         mode: "Cash",
// //       },
// //     ];

// //     setReportData(dummyData);
// //     setShowTable(true);
// //   };

// //   return (
// //     <>
// //       <h3 className="font-medium mb-1">Generate Financial Report</h3>
// //       <p className="text-sm text-gray-500 mb-4">
// //         Create detailed payment reports
// //       </p>

// //       {/* Filters */}
// //       <div className="flex flex-wrap gap-3 items-end mb-3">
// //         {/* Report Type */}
// //         <select
// //           value={reportType}
// //           onChange={(e) => setReportType(e.target.value)}
// //           className="border px-3 py-2 rounded text-sm focus:ring-1 focus:ring-blue-500"
// //         >
// //           <option value="day">Day-wise</option>
// //           <option value="month">Month-wise</option>
// //           <option value="custom">Custom Range</option>
// //         </select>

// //         {/* Branch */}
// //         <select
// //           value={branch}
// //           onChange={(e) => setBranch(e.target.value)}
// //           className="border px-3 py-2 rounded text-sm focus:ring-1 focus:ring-blue-500"
// //         >
// //           <option value="ALL">All Branches</option>
// //           <option value="CSE">CSE</option>
// //           <option value="ECE">ECE</option>
// //           <option value="EEE">EEE</option>
// //         </select>

// //         {/* Fee Category */}
// //         <select
// //           value={selectedFee}
// //           onChange={(e) => setSelectedFee(e.target.value)}
// //           className="border px-3 py-2 rounded text-sm min-w-[180px] focus:ring-1 focus:ring-blue-500"
// //         >
// //           <option value="">All Categories</option>
// //           {fees.map((fee) => (
// //             <option key={fee._id} value={fee._id}>
// //               {fee.category === "CUSTOM"
// //                 ? fee.customCategoryName
// //                 : fee.category}
// //             </option>
// //           ))}
// //         </select>

// //         {/* Generate */}
// //         <button
// //           onClick={handleGenerateReport}
// //           className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm"
// //         >
// //           Generate Report
// //         </button>
// //       </div>

// //       {/* Date Filters */}
// //       <div className="flex flex-wrap gap-3 mb-5">
// //         {reportType === "day" && (
// //           <input
// //             type="date"
// //             value={singleDate}
// //             onChange={(e) => setSingleDate(e.target.value)}
// //             className="border px-3 py-2 rounded text-sm"
// //           />
// //         )}

// //         {reportType === "month" && (
// //           <input
// //             type="month"
// //             value={month}
// //             onChange={(e) => setMonth(e.target.value)}
// //             className="border px-3 py-2 rounded text-sm"
// //           />
// //         )}

// //         {reportType === "custom" && (
// //           <>
// //             <input
// //               type="date"
// //               value={fromDate}
// //               onChange={(e) => setFromDate(e.target.value)}
// //               className="border px-3 py-2 rounded text-sm"
// //             />
// //             <input
// //               type="date"
// //               value={toDate}
// //               onChange={(e) => setToDate(e.target.value)}
// //               className="border px-3 py-2 rounded text-sm"
// //             />
// //           </>
// //         )}
// //       </div>

// //       {/* Actions */}
// //       <div className="flex gap-3 mb-6 text-sm">
// //         <button className="border px-4 py-2 rounded hover:bg-gray-50">
// //           Export to Excel
// //         </button>
// //         <button className="border px-4 py-2 rounded hover:bg-gray-50">
// //           Export to PDF
// //         </button>
// //         <button className="border px-4 py-2 rounded hover:bg-gray-50">
// //           Print
// //         </button>
// //       </div>

// //       {/* Preview Table */}
// //       {showTable && (
// //         <div className="overflow-x-auto border rounded">
// //           <table className="w-full text-sm">
// //             <thead className="bg-gray-100">
// //               <tr>
// //                 <th className="p-2 text-left">Date</th>
// //                 <th className="p-2 text-left">Student</th>
// //                 <th className="p-2 text-left">Branch</th>
// //                 <th className="p-2 text-left">Fee Category</th>
// //                 <th className="p-2 text-left">Amount</th>
// //                 <th className="p-2 text-left">Payment Mode</th>
// //               </tr>
// //             </thead>
// //             <tbody>
// //               {reportData.map((row, index) => (
// //                 <tr key={index} className="border-t">
// //                   <td className="p-2">{row.date}</td>
// //                   <td className="p-2">{row.student}</td>
// //                   <td className="p-2">{row.branch}</td>
// //                   <td className="p-2">{row.category}</td>
// //                   <td className="p-2">₹{row.amount}</td>
// //                   <td className="p-2">{row.mode}</td>
// //                 </tr>
// //               ))}
// //             </tbody>
// //           </table>
// //         </div>
// //       )}
// //     </>
// //   );
// // };

// // export default FinancialReports;



// import { useEffect, useState } from "react";
// import axios from "../../api/api";

// const FinancialReports = () => {
//   const [reportType, setReportType] = useState("day");
//   const [fees, setFees] = useState([]);
//   const [selectedFee, setSelectedFee] = useState("");
//   const [branch, setBranch] = useState("ALL");

//   // Date states
//   const [singleDate, setSingleDate] = useState("");
//   const [month, setMonth] = useState("");
//   const [fromDate, setFromDate] = useState("");
//   const [toDate, setToDate] = useState("");

//   // Report preview
//   const [showTable, setShowTable] = useState(false);
//   const [reportData, setReportData] = useState([]);
//   const token = localStorage.getItem("adminToken");

//   useEffect(() => {
//     fetchFeeCategories();
//   }, []);

//   const fetchFeeCategories = async () => {
//     try {
//       const res = await axios.get("/fee-structure", {
//         headers: { Authorization: `Bearer ${token}` },
//       });
//       setFees(res.data.data);
//     } catch (err) {
//       console.error("Failed to fetch fee categories", err);
//     }
//   };

//   const handleGenerateReport = async () => {
//     try {
//       const params = {
//         type: reportType,
//         branch,
//       };

//       if (selectedFee) params.feeCategory = selectedFee;

//       if (reportType === "day") params.date = singleDate;
//       else if (reportType === "month") params.month = month;
//       else if (reportType === "custom") {
//         params.fromDate = fromDate;
//         params.toDate = toDate;
//       }

//       const res = await axios.get("/reports/financial", {
//         headers: { Authorization: `Bearer ${token}` },
//         params,
//       });

//       if (res.data.success) {
//         setReportData(res.data.data);
//         setShowTable(true);
//       }
//     } catch (err) {
//       console.error("Failed to generate report", err);
//       setReportData([]);
//       setShowTable(false);
//     }
//   };

//   return (
//     <>
//       <h3 className="font-medium mb-1">Generate Financial Report</h3>
//       <p className="text-sm text-gray-500 mb-4">Create detailed payment reports</p>

//       {/* Filters */}
//       <div className="flex flex-wrap gap-3 items-end mb-3">
//         {/* Report Type */}
//         <select
//           value={reportType}
//           onChange={(e) => setReportType(e.target.value)}
//           className="border px-3 py-2 rounded text-sm focus:ring-1 focus:ring-blue-500"
//         >
//           <option value="day">Day-wise</option>
//           <option value="month">Month-wise</option>
//           <option value="custom">Custom Range</option>
//         </select>

//         {/* Branch */}
//         <select
//           value={branch}
//           onChange={(e) => setBranch(e.target.value)}
//           className="border px-3 py-2 rounded text-sm focus:ring-1 focus:ring-blue-500"
//         >
//           <option value="ALL">All Branches</option>
//           <option value="CSE">CSE</option>
//           <option value="ECE">ECE</option>
//           <option value="EEE">EEE</option>
//         </select>

//         {/* Fee Category */}
//         <select
//           value={selectedFee}
//           onChange={(e) => setSelectedFee(e.target.value)}
//           className="border px-3 py-2 rounded text-sm min-w-[180px] focus:ring-1 focus:ring-blue-500"
//         >
//           <option value="">All Categories</option>
//           {fees.map((fee) => (
//             <option key={fee._id} value={fee.category === "CUSTOM" ? fee.customCategoryName : fee.category}>
//               {fee.category === "CUSTOM" ? fee.customCategoryName : fee.category}
//             </option>
//           ))}
//         </select>

//         <button
//           onClick={handleGenerateReport}
//           className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm"
//         >
//           Generate Report
//         </button>
//       </div>

//       {/* Date Filters */}
//       <div className="flex flex-wrap gap-3 mb-5">
//         {reportType === "day" && (
//           <input
//             type="date"
//             value={singleDate}
//             onChange={(e) => setSingleDate(e.target.value)}
//             className="border px-3 py-2 rounded text-sm"
//           />
//         )}
//         {reportType === "month" && (
//           <input
//             type="month"
//             value={month}
//             onChange={(e) => setMonth(e.target.value)}
//             className="border px-3 py-2 rounded text-sm"
//           />
//         )}
//         {reportType === "custom" && (
//           <>
//             <input
//               type="date"
//               value={fromDate}
//               onChange={(e) => setFromDate(e.target.value)}
//               className="border px-3 py-2 rounded text-sm"
//             />
//             <input
//               type="date"
//               value={toDate}
//               onChange={(e) => setToDate(e.target.value)}
//               className="border px-3 py-2 rounded text-sm"
//             />
//           </>
//         )}
//       </div>

//       {/* Actions */}
//       <div className="flex gap-3 mb-6 text-sm">
//         <button className="border px-4 py-2 rounded hover:bg-gray-50">
//           Export to Excel
//         </button>
//         <button className="border px-4 py-2 rounded hover:bg-gray-50">
//           Export to PDF
//         </button>
//         <button className="border px-4 py-2 rounded hover:bg-gray-50">
//           Print
//         </button>
//       </div>

//       {/* Preview Table */}
//       {showTable && (
//         <div className="overflow-x-auto border rounded">
//           <table className="w-full text-sm">
//             <thead className="bg-gray-100">
//               <tr>
//                 <th className="p-2 text-left">Date</th>
//                 <th className="p-2 text-left">HT Number</th>
//                 <th className="p-2 text-left">Student</th>
//                 <th className="p-2 text-left">Branch</th>
//                 <th className="p-2 text-left">Fee Category</th>
//                 <th className="p-2 text-left">Amount</th>
//                 <th className="p-2 text-left">Payment Mode</th>
//               </tr>
//             </thead>
//             <tbody>
//               {reportData.map((row, idx) => (
//                 <tr key={idx} className="border-t">
//                   <td className="p-2">{row.date}</td>
//                   <td className="p-2">{row.htNumber}</td>
//                   <td className="p-2">{row.studentName}</td>
//                   <td className="p-2">{row.branch}</td>
//                   <td className="p-2">{row.feeCategory}</td>
//                   <td className="p-2">₹{row.amount}</td>
//                   <td className="p-2">{row.paymentMode}</td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </div>
//       )}
//     </>
//   );
// };

// export default FinancialReports;

import { useEffect, useState } from "react";
import api from "../../api/api";

const FinancialReports = () => {
  const [reportType, setReportType] = useState("day");
  const [branch, setBranch] = useState("ALL");
  const [fees, setFees] = useState([]);
  const [selectedFee, setSelectedFee] = useState("");

  const [singleDate, setSingleDate] = useState("");
  const [month, setMonth] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const [reportData, setReportData] = useState([]);

  useEffect(() => {
    fetchFeeCategories();
  }, []);

  const fetchFeeCategories = async () => {
    try {
      const res = await api.get("/fee-structure");
      setFees(res.data.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleGenerateReport = async () => {
    try {
      const params = {
        type: reportType,
        date: singleDate,
        month,
        fromDate,
        toDate,
        branch,
      };
      const res = await api.get("/reports/financial", { params });
      if (res.data.success) setReportData(res.data.data);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <>
      <h3 className="font-medium mb-1">Generate Financial Report</h3>
      <p className="text-sm text-gray-500 mb-4">Create detailed payment reports</p>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-end mb-3">
        <select
          value={reportType}
          onChange={(e) => setReportType(e.target.value)}
          className="border px-3 py-2 rounded text-sm focus:ring-1 focus:ring-blue-500"
        >
          <option value="day">Day-wise</option>
          <option value="month">Month-wise</option>
          <option value="custom">Custom Range</option>
        </select>

        <select
          value={branch}
          onChange={(e) => setBranch(e.target.value)}
          className="border px-3 py-2 rounded text-sm focus:ring-1 focus:ring-blue-500"
        >
          <option value="ALL">All Branches</option>
          <option value="CSE">CSE</option>
          <option value="ECE">ECE</option>
          <option value="EEE">EEE</option>
        </select>

        <select
          value={selectedFee}
          onChange={(e) => setSelectedFee(e.target.value)}
          className="border px-3 py-2 rounded text-sm min-w-[180px] focus:ring-1 focus:ring-blue-500"
        >
          <option value="">All Categories</option>
          {fees.map((fee) => (
            <option key={fee._id} value={fee._id}>
              {fee.category === "CUSTOM" ? fee.customCategoryName : fee.category}
            </option>
          ))}
        </select>

        <button
          onClick={handleGenerateReport}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm"
        >
          Generate Report
        </button>
      </div>

      {/* Date filters */}
      <div className="flex flex-wrap gap-3 mb-5">
        {reportType === "day" && (
          <input type="date" value={singleDate} onChange={(e) => setSingleDate(e.target.value)} className="border px-3 py-2 rounded text-sm"/>
        )}
        {reportType === "month" && (
          <input type="month" value={month} onChange={(e) => setMonth(e.target.value)} className="border px-3 py-2 rounded text-sm"/>
        )}
        {reportType === "custom" && (
          <>
            <input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} className="border px-3 py-2 rounded text-sm"/>
            <input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} className="border px-3 py-2 rounded text-sm"/>
          </>
        )}
      </div>

      {/* Table */}
      <div className="overflow-x-auto border rounded">
        <table className="w-full text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-2 text-left">Date</th>
              <th className="p-2 text-left">Hall Ticket</th>
              <th className="p-2 text-left">Student Name</th>
              <th className="p-2 text-left">Branch</th>
              <th className="p-2 text-left">Fee Category</th>
              <th className="p-2 text-left">Amount</th>
              <th className="p-2 text-left">Payment Mode</th>
            </tr>
          </thead>
          <tbody>
            {reportData.map((row, idx) => (
              <tr key={idx} className="border-t">
                <td className="p-2">{row.date}</td>
                <td className="p-2">{row.htNumber}</td>
                <td className="p-2">{row.studentName}</td>
                <td className="p-2">{row.branch}</td>
                <td className="p-2">{row.category}</td>
                <td className="p-2">₹{row.amount}</td>
                <td className="p-2">{row.mode}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
};

export default FinancialReports;
