import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Bar, Line, Pie } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

export default function AdminAnalytics() {
  const [chartType, setChartType] = useState('bar');
  const [range, setRange] = useState(7);
  const [dailyData, setDailyData] = useState([]);
  const [summary, setSummary] = useState({ totalSales: 0, totalOrders: 0 });
  const [categoryRevenue, setCategoryRevenue] = useState([]);
  const [peakHours, setPeakHours] = useState([]);

  useEffect(() => {
    fetchData();
  }, [range]);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.error("Token not found");
        return;
      }

      const headers = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };

      const baseURL = 'http://localhost:5000';

      const [salesRes, categoryRes, peakRes] = await Promise.all([
        axios.get(`${baseURL}/api/orders/analytics/daily-sales?days=${range}`, headers),
        axios.get(`${baseURL}/api/orders/analytics/category-revenue`, headers),
        axios.get(`${baseURL}/api/orders/analytics/peak-hours`, headers),
      ]);

      // Daily sales
      setDailyData(salesRes.data);
      const totalSales = salesRes.data.reduce((acc, curr) => acc + curr.totalSales, 0);
      const totalOrders = salesRes.data.reduce((acc, curr) => acc + curr.orderCount, 0);
      setSummary({ totalSales, totalOrders });

      // Category revenue
      setCategoryRevenue(categoryRes.data);

      // Peak hours
      setPeakHours(peakRes.data);
    } catch (err) {
      console.error('Failed to fetch analytics:', err);
    }
  };

  const chartData = {
    labels: dailyData.map(d => `${d._id.day}/${d._id.month}`),
    datasets: [
      {
        label: 'Total Sales',
        data: dailyData.map(d => d.totalSales),
        backgroundColor: 'rgba(54, 162, 235, 0.6)',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 2,
        fill: false,
      },
    ],
  };

  const peakChart = {
    labels: peakHours.map(h => `${h._id}:00`),
    datasets: [
      {
        label: 'Orders',
        data: peakHours.map(h => h.orderCount),
        backgroundColor: 'rgba(255, 99, 132, 0.6)',
      },
    ],
  };

  const pieChart = {
    labels: categoryRevenue.map(c => c._id),
    datasets: [
      {
        label: 'Revenue',
        data: categoryRevenue.map(c => c.totalRevenue),
        backgroundColor: [
          '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40'
        ],
      },
    ],
  };

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex items-center gap-4">
        <select
          value={chartType}
          onChange={e => setChartType(e.target.value)}
          className="p-2 border rounded"
        >
          <option value="bar">Bar</option>
          <option value="line">Line</option>
        </select>
        <select
          value={range}
          onChange={e => setRange(Number(e.target.value))}
          className="p-2 border rounded"
        >
          <option value={7}>Last 7 days</option>
          <option value={14}>Last 14 days</option>
          <option value={30}>Last 30 days</option>
        </select>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-6">
        <div className="bg-white p-4 shadow rounded">
          <h3 className="font-semibold text-lg mb-1">💰 Total Sales</h3>
          <p className="text-2xl font-bold">₹{summary.totalSales.toFixed(2)}</p>
        </div>
        <div className="bg-white p-4 shadow rounded">
          <h3 className="font-semibold text-lg mb-1">📦 Total Orders</h3>
          <p className="text-2xl font-bold">{summary.totalOrders}</p>
        </div>
      </div>

      {/* Daily Sales */}
      <div className="bg-white p-4 shadow rounded">
        <h3 className="font-semibold text-lg mb-2">📊 Daily Sales ({chartType})</h3>
        {chartType === 'bar' ? <Bar data={chartData} /> : <Line data={chartData} />}
      </div>

      {/* Category-wise Revenue */}
      <div className="bg-white p-4 shadow rounded">
        <h3 className="font-semibold text-lg mb-2">📦 Category-wise Revenue</h3>
        {categoryRevenue.length > 0 ? (
          <Pie data={pieChart} />
        ) : (
          <p className="text-gray-500 italic">No category revenue data available.</p>
        )}
      </div>

      {/* Peak Hour Analysis */}
      <div className="bg-white p-4 shadow rounded">
        <h3 className="font-semibold text-lg mb-2">⏰ Peak Hour Analysis</h3>
        <Bar data={peakChart} />
      </div>
    </div>
  );
}
