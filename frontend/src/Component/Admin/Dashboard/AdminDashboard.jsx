import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../../Context/authContext';
import { MdTrendingUp, MdPeopleOutline, MdStore, MdShoppingCart } from 'react-icons/md';
import { useTheme } from '../../../Context/themeContext';

const SERVER_URL = import.meta.env.VITE_SERVER_URL;

const StatCard = ({ title, value, icon, colorClass, theme }) => (
  <div className={`${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'} rounded-2xl p-6 shadow-sm border flex items-center gap-6 hover:shadow-md transition-shadow`}>
    <div className={`w-16 h-16 rounded-xl flex items-center justify-center text-white text-3xl shadow-inner ${colorClass}`}>
      {icon}
    </div>
    <div>
      <p className={`text-sm font-bold uppercase tracking-wider mb-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-400'}`}>{title}</p>
      <h3 className={`text-4xl font-black ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>{value}</h3>
    </div>
  </div>
);

const AdminDashboard = () => {
  const { authToken } = useAuth();
  const { theme } = useTheme();
  const [stats, setStats] = useState({ totalConsumers: 0, totalSellers: 0, totalProducts: 0, totalOrders: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data } = await axios.get(`${SERVER_URL}/api/admin/stats`, {
          headers: { Authorization: `Bearer ${authToken}` }
        });
        if (data.success) {
          setStats(data.stats);
        }
      } catch (err) {
        console.error("Failed to load stats", err);
      } finally {
        setLoading(false);
      }
    };
    if (authToken) fetchStats();
  }, [authToken]);

  if (loading) {
    return (
      <div className="animate-pulse grid grid-cols-1 md:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map(i => <div key={i} className={`h-32 rounded-2xl ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-200'}`}></div>)}
      </div>
    );
  }

  return (
    <div className="animate-fade-in-up">
      <div className="mb-10">
        <h2 className={`text-3xl font-black tracking-tight ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>Platform Overview</h2>
        <p className={`mt-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Real-time statistics covering all marketplace entities.</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        <StatCard title="Active Buyers" value={stats.totalConsumers} icon={<MdPeopleOutline />} colorClass="bg-gradient-to-br from-blue-400 to-blue-600" theme={theme} />
        <StatCard title="Verified Sellers" value={stats.totalSellers} icon={<MdStore />} colorClass="bg-gradient-to-br from-indigo-500 to-indigo-700" theme={theme} />
        <StatCard title="Live Catalog" value={stats.totalProducts} icon={<MdTrendingUp />} colorClass="bg-gradient-to-br from-emerald-400 to-emerald-600" theme={theme} />
        <StatCard title="Total Orders" value={stats.totalOrders} icon={<MdShoppingCart />} colorClass="bg-gradient-to-br from-rose-400 to-rose-600" theme={theme} />
      </div>
    </div>
  );
};

export default AdminDashboard;
