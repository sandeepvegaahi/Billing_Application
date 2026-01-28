import { useState, useEffect } from "react";
import api from "../../api/api";

const DueReports = () => {
  const [reportType, setReportType] = useState("day");
  const [branch, setBranch] = useState("ALL");
  const [singleDate, setSingleDate] = useState("");
  const [month, setMonth] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const [reportData, setReportData] = useState([]);

  const handleGenerateReport = async () => {
    try {
      const params = { type: reportType, date: singleDate, month, fromDate, toDate, branch };
      const res = await api.get("/reports/due", { params });
      if (res.data.success) setReportData(res.data.data);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <>
      <h3 className="font-medium mb-1">Generate Due Report</h3>
      <p className="text-sm text-gray-500 mb-4">View students with pending dues</p>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-end mb-3">
        <select value={reportType} onChange={(e) => setReportType(e.target.value)} className="border px-3 py-2 rounded text-sm">
          <option value="day">Day-wise</option>
          <option value="month">Month-wise</option>
          <option value="custom">Custom Range</option>
        </select>
        <select value={branch} onChange={(e) => setBranch(e.target.value)} className="border px-3 py-2 rounded text-sm">
          <option value="ALL">All Branches</option>
          <option value="CSE">CSE</option>
          <option value="ECE">ECE</option>
          <option value="EEE">EEE</option>
        </select>
        <button onClick={handleGenerateReport} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm">Generate Report</button>
      </div>

      {/* Date filters */}
      <div className="flex flex-wrap gap-3 mb-5">
        {reportType === "day" && <input type="date" value={singleDate} onChange={(e) => setSingleDate(e.target.value)} className="border px-3 py-2 rounded text-sm"/>}
        {reportType === "month" && <input type="month" value={month} onChange={(e) => setMonth(e.target.value)} className="border px-3 py-2 rounded text-sm"/>}
        {reportType === "custom" && <>
          <input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} className="border px-3 py-2 rounded text-sm"/>
          <input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} className="border px-3 py-2 rounded text-sm"/>
        </>}
      </div>

      {/* Table */}
      <div className="overflow-x-auto border rounded">
        <table className="w-full text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-2 text-left">Hall Ticket</th>
              <th className="p-2 text-left">Name</th>
              <th className="p-2 text-left">Branch</th>
              <th className="p-2 text-left">Year</th>
              <th className="p-2 text-left">Total Due</th>
              <th className="p-2 text-left">Tuition</th>
              <th className="p-2 text-left">Bus</th>
              <th className="p-2 text-left">Exam</th>
            </tr>
          </thead>
          <tbody>
            {reportData.map((row, idx) => (
              <tr key={idx} className="border-t">
                <td className="p-2">{row.htNumber}</td>
                <td className="p-2">{row.studentName}</td>
                <td className="p-2">{row.branch}</td>
                <td className="p-2">{row.year}</td>
                <td className="p-2">{row.totalDue}</td>
                <td className="p-2">{row.TuitionFee || 0}</td>
                <td className="p-2">{row.BusFee || 0}</td>
                <td className="p-2">{row.ExamFee || 0}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
};

export default DueReports;
