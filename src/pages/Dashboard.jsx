import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import IndexCards from "../components/IndexCards";
import config from "../config/api";

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeStrategies: 0,
    totalSpread: 0,
    advancedOptions: 0,
    todayTrades: 0,
    totalPnL: 0,
  });

  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch dashboard data
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);

        // Fetch users count
        const usersResponse = await fetch(
          config.buildUrl(config.ENDPOINTS.USERS)
        );
        const users = await usersResponse.json();

        // Fetch strategies count
        const strategiesResponse = await fetch(
          config.buildUrl(config.ENDPOINTS.STRATEGIES)
        );
        const strategies = await strategiesResponse.json();

        // Fetch advanced options count
        const advancedResponse = await fetch(
          config.buildUrl(config.ENDPOINTS.ADVANCED_OPTIONS)
        );
        const advancedOptions = await advancedResponse.json();

        // Fetch spreads count
        const spreadsResponse = await fetch(
          config.buildUrl(config.ENDPOINTS.SPREADS)
        );
        const spreads = await spreadsResponse.json();

        setStats({
          totalUsers: Array.isArray(users) ? users.length : 0,
          activeStrategies: Array.isArray(strategies)
            ? strategies.filter((s) => s.run_state === 0).length
            : 0,
          totalSpread: Array.isArray(spreads) ? spreads.length : 0,
          advancedOptions: Array.isArray(advancedOptions)
            ? advancedOptions.length
            : 0,
          todayTrades: Math.floor(Math.random() * 50) + 10, // Mock data
          totalPnL: (Math.random() * 20000 - 10000).toFixed(2), // Mock data
        });

        // Mock recent activity
        setRecentActivity([
          {
            id: 1,
            action: "Strategy Created",
            user: "user123",
            time: "2 mins ago",
            status: "success",
          },
          {
            id: 2,
            action: "Order Executed",
            user: "user456",
            time: "5 mins ago",
            status: "success",
          },
          {
            id: 3,
            action: "Position Closed",
            user: "user789",
            time: "8 mins ago",
            status: "warning",
          },
          {
            id: 4,
            action: "New User Added",
            user: "admin",
            time: "15 mins ago",
            status: "info",
          },
          {
            id: 5,
            action: "Advanced Option",
            user: "user101",
            time: "20 mins ago",
            status: "success",
          },
        ]);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();

    // Refresh every 30 seconds
    const interval = setInterval(fetchDashboardData, 30000);
    return () => clearInterval(interval);
  }, []);

  const quickActions = [
    {
      title: "Multi-Leg Spread",
      description: "Create complex option strategies",
      icon: "📊",
      link: "/multilegspread",
      color: "bg-blue-500 dark:bg-blue-600",
    },
    {
      title: "Option Chain",
      description: "View live option data",
      icon: "⛓️",
      link: "/optionchain",
      color: "bg-green-500 dark:bg-green-600",
    },
    {
      title: "Advanced Options",
      description: "Advanced strategy builder",
      icon: "🚀",
      link: "/advanced-options",
      color: "bg-purple-500 dark:bg-purple-600",
    },
    {
      title: "Strategies",
      description: "Manage trading strategies",
      icon: "💼",
      link: "/stratergies",
      color: "bg-orange-500 dark:bg-orange-600",
    },
    {
      title: "Users",
      description: "User management",
      icon: "👥",
      link: "/users",
      color: "bg-indigo-500 dark:bg-indigo-600",
    },
    {
      title: "Custom Spreads",
      description: "Custom option spreads",
      icon: "🎯",
      link: "/optionchaincustom",
      color: "bg-pink-500 dark:bg-pink-600",
    },
  ];

  const StatCard = ({ title, value, icon, trend, color = "text-blue-500" }) => (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-3 border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-all duration-300">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wider">
            {title}
          </p>
          <p className={`text-sm md:text-base font-bold ${color} mt-2`}>
            {loading ? "..." : value}
          </p>
          {trend && (
            <p
              className={`text-xs mt-2 ${
                trend > 0 ? "text-green-500" : "text-red-500"
              }`}
            >
              {trend > 0 ? "↗️" : "↘️"} {Math.abs(trend)}% from last week
            </p>
          )}
        </div>
        <div className="text-4xl opacity-20">{icon}</div>
      </div>
    </div>
  );

  const QuickActionCard = ({ title, description, icon, link, color }) => (
    <Link to={link} className="group">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-3 border border-gray-200 dark:border-gray-700 hover:shadow-xl hover:scale-105 transition-all duration-300">
        <div
          className={`${color} w-12 h-12 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}
        >
          <span className="text-2xl">{icon}</span>
        </div>
        <h3 className="text-sm md:text-base font-semibold text-gray-900 dark:text-white mb-2">
          {title}
        </h3>
        <p className="text-xs text-gray-600 dark:text-gray-400">
          {description}
        </p>
      </div>
    </Link>
  );

  const ActivityItem = ({ action, user, time, status }) => {
    const getStatusColor = (status) => {
      switch (status) {
        case "success":
          return "text-green-500 bg-green-100 dark:bg-green-900";
        case "warning":
          return "text-yellow-500 bg-yellow-100 dark:bg-yellow-900";
        case "error":
          return "text-red-500 bg-red-100 dark:bg-red-900";
        default:
          return "text-blue-500 bg-blue-100 dark:bg-blue-900";
      }
    };

    return (
      <div className="flex items-center justify-between py-3 px-4 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors duration-200">
        <div className="flex items-center space-x-3">
          <div
            className={`w-3 h-3 rounded-full ${getStatusColor(status)}`}
          ></div>
          <div>
            <p className="text-xs font-medium text-gray-900 dark:text-white">
              {action}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              by {user} • {time}
            </p>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 md:p-6">
      <div className="max-w-[100rem] mx-auto space-y-4">
        {/* Header */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-3 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-sm md:text-base font-bold text-gray-900 dark:text-white">
                Trading Dashboard
              </h1>
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">
                Welcome to Nuvama Trading Platform
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Last updated: {new Date().toLocaleTimeString()}
              </p>
              <div className="flex items-center mt-2">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse mr-2"></div>
                <span className="text-xs text-green-500 font-medium">Live</span>
              </div>
            </div>
          </div>
        </div>

        {/* Market Index Cards */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-3 border border-gray-200 dark:border-gray-700">
          <h2 className="text-sm md:text-base font-semibold text-gray-900 dark:text-white mb-2">
            Market Overview
          </h2>
          <IndexCards />
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
          <StatCard
            title="Total Users"
            value={stats.totalUsers}
            icon="👥"
            trend={5}
            color="text-blue-500"
          />
          <StatCard
            title="Active Strategies"
            value={stats.activeStrategies}
            icon="📈"
            trend={12}
            color="text-green-500"
          />
          <StatCard
            title="Total Spreads"
            value={stats.totalSpread}
            icon="📊"
            trend={-3}
            color="text-purple-500"
          />
          <StatCard
            title="Advanced Options"
            value={stats.advancedOptions}
            icon="🚀"
            trend={8}
            color="text-orange-500"
          />
          <StatCard
            title="Today's Trades"
            value={stats.todayTrades}
            icon="💼"
            trend={15}
            color="text-indigo-500"
          />
          <StatCard
            title="Total P&L"
            value={`₹${stats.totalPnL}`}
            icon="💰"
            trend={Number(stats.totalPnL) > 0 ? 7 : -4}
            color={
              Number(stats.totalPnL) > 0 ? "text-green-500" : "text-red-500"
            }
          />
        </div>

        {/* Quick Actions and Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
          {/* Quick Actions */}
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
              <h2 className="text-sm md:text-base font-semibold text-gray-900 dark:text-white mb-6">
                Quick Actions
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {quickActions.map((action, index) => (
                  <QuickActionCard key={index} {...action} />
                ))}
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
              <h2 className="text-sm md:text-base font-semibold text-gray-900 dark:text-white mb-6">
                Recent Activity
              </h2>
              <div className="space-y-2">
                {recentActivity.map((activity) => (
                  <ActivityItem key={activity.id} {...activity} />
                ))}
              </div>
              <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <Link
                  to="/stratergies"
                  className="text-xs text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300 font-medium"
                >
                  View all activity →
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Trading Tools */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
          <h2 className="text-sm md:text-base font-semibold text-gray-900 dark:text-white mb-6">
            Trading Tools & Analytics
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-4 text-white">
              <h3 className="text-sm md:text-base font-semibold mb-2">
                Options Greeks
              </h3>
              <p className="text-xs opacity-90">
                Calculate Delta, Gamma, Theta
              </p>
              <button className="mt-3 px-3 py-1 bg-white bg-opacity-20 rounded text-xs hover:bg-opacity-30 transition-colors">
                Coming Soon
              </button>
            </div>
            <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-4 text-white">
              <h3 className="text-sm md:text-base font-semibold mb-2">
                Risk Calculator
              </h3>
              <p className="text-xs opacity-90">Portfolio risk analysis</p>
              <button className="mt-3 px-3 py-1 bg-white bg-opacity-20 rounded text-xs hover:bg-opacity-30 transition-colors">
                Coming Soon
              </button>
            </div>
            <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg p-4 text-white">
              <h3 className="text-sm md:text-base font-semibold mb-2">
                P&L Tracker
              </h3>
              <p className="text-xs opacity-90">Real-time profit tracking</p>
              <button className="mt-3 px-3 py-1 bg-white bg-opacity-20 rounded text-xs hover:bg-opacity-30 transition-colors">
                Coming Soon
              </button>
            </div>
            <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg p-4 text-white">
              <h3 className="text-sm md:text-base font-semibold mb-2">
                Market Scanner
              </h3>
              <p className="text-xs opacity-90">Find trading opportunities</p>
              <button className="mt-3 px-3 py-1 bg-white bg-opacity-20 rounded text-xs hover:bg-opacity-30 transition-colors">
                Coming Soon
              </button>
            </div>
          </div>
        </div>

        {/* System Status */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
          <h2 className="text-sm md:text-base font-semibold text-gray-900 dark:text-white mb-6">
            System Status
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex items-center justify-between p-4 bg-green-50 dark:bg-green-900 dark:bg-opacity-20 rounded-lg">
              <div>
                <p className="text-xs font-medium text-green-800 dark:text-green-200">
                  API Status
                </p>
                <p className="text-xs text-green-600 dark:text-green-400">
                  All systems operational
                </p>
              </div>
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
            </div>
            <div className="flex items-center justify-between p-4 bg-blue-50 dark:bg-blue-900 dark:bg-opacity-20 rounded-lg">
              <div>
                <p className="text-xs font-medium text-blue-800 dark:text-blue-200">
                  Market Data
                </p>
                <p className="text-xs text-blue-600 dark:text-blue-400">
                  Live feed active
                </p>
              </div>
              <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
            </div>
            <div className="flex items-center justify-between p-4 bg-purple-50 dark:bg-purple-900 dark:bg-opacity-20 rounded-lg">
              <div>
                <p className="text-xs font-medium text-purple-800 dark:text-purple-200">
                  Order Engine
                </p>
                <p className="text-xs text-purple-600 dark:text-purple-400">
                  Processing orders
                </p>
              </div>
              <div className="w-3 h-3 bg-purple-500 rounded-full animate-pulse"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
