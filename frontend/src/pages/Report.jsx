import React, { useState, useEffect } from 'react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
} from 'recharts';
import {
  ArrowUpRight,
  ArrowDownRight,
  TrendingUp,
  PieChart as PieIcon,
  BarChart3,
  Calendar,
  Layers,
  ShieldCheck,
  AlertTriangle,
  Download,
} from 'lucide-react';
import axios from 'axios';
import Layout from '../components/Layout';
import MonthPicker from '../components/MonthPicker';
import { formatCurrency } from '../utils/format';

const API = process.env.REACT_APP_API_URL;
const MONTH_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const TACTICAL_PALETTE = ['#ff4d00', '#00ed64', '#00d4ff', '#a855f7', '#f59e0b', '#ec4899', '#06b6d4', '#64748b'];

const Report = () => {
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem('token');

  useEffect(() => {
    loadReport();
  }, [month, year]);

  const loadReport = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API}/reports/monthly?month=${month}&year=${year}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setReport(res.data);
    } catch (err) {
      console.log('Error loading report:', err);
    }
    setLoading(false);
  };

  const handleMonthChange = (m, y) => {
    setMonth(m);
    setYear(y);
  };

  if (loading) {
    return (
      <Layout>
        <div className="dashboard-loading-container" style={{ padding: '80px 0' }}>
          <div className="telemetry-spinner" />
          <div className="telemetry-loading-text">GENERATING FINANCIAL DIAGNOSTICS...</div>
        </div>
      </Layout>
    );
  }

  if (!report) {
    return (
      <Layout>
        <div className="empty-state">
          <AlertTriangle size={32} color="var(--accent)" />
          <h3>Report Unavailable</h3>
          <p>Could not retrieve diagnostic telemetry for the selected month.</p>
          <button className="btn btn-primary" onClick={loadReport} style={{ marginTop: 12 }}>
            Retry
          </button>
        </div>
      </Layout>
    );
  }

  const income = parseFloat(report?.summary?.total_income) || 0;
  const expenses = parseFloat(report?.summary?.total_expenses) || 0;
  const balance = income - expenses;
  const savingsRate = income > 0 ? ((balance / income) * 100).toFixed(1) : 0;
  const monthName = new Date(year, month - 1).toLocaleString('default', { month: 'long' });

  const pieData = report.byCategory.map((item, idx) => ({
    name: item.category || 'Uncategorized',
    value: parseFloat(item.total),
    color: item.color || TACTICAL_PALETTE[idx % TACTICAL_PALETTE.length],
  }));

  const trendData = report.trend.map((t) => ({
    name: MONTH_SHORT[t.month - 1],
    Income: parseFloat(t.income) || 0,
    Expenses: parseFloat(t.expenses) || 0,
  }));

  const customTooltipStyle = {
    backgroundColor: 'var(--surface)',
    border: '1px solid var(--border)',
    borderRadius: '10px',
    boxShadow: 'var(--shadow-lg)',
    padding: '12px 16px',
    color: 'var(--text-primary)',
    fontFamily: 'var(--font-mono)',
    fontSize: '0.82rem',
  };

  const customItemStyle = {
    color: 'var(--text-primary)',
    fontFamily: 'var(--font-mono)',
  };

  const customLabelStyle = {
    color: 'var(--text-muted)',
    fontFamily: 'var(--font-mono)',
    fontWeight: 600,
    marginBottom: '6px',
  };

  return (
    <Layout>
      {/* ── Page Header ── */}
      <div className="page-header">
        <div>
          <div className="page-title">Monthly Diagnostics</div>
          <div className="page-subtitle">
            {monthName} {year} — executive capital diagnostics, trend velocities &amp; category breakdowns
          </div>
        </div>
        <div className="header-actions">
          <MonthPicker month={month} year={year} onChange={handleMonthChange} />
        </div>
      </div>

      {/* ── Executive Stats Grid ── */}
      <div className="dash-bento-grid" style={{ marginBottom: 24 }}>
        <div className="dash-stat-card">
          <div className="dash-card-header">
            <span className="dash-stat-label">Inflow Receipts</span>
            <div className="dash-stat-icon-wrap income">
              <ArrowUpRight size={16} />
            </div>
          </div>
          <div className="dash-stat-number income">{formatCurrency(income)}</div>
          <div className="dash-stat-footer">
            <span className="dash-trend-pill up">
              <TrendingUp size={13} /> Gross Revenue
            </span>
            <span className="dash-stat-subtext">all streams</span>
          </div>
        </div>

        <div className="dash-stat-card">
          <div className="dash-card-header">
            <span className="dash-stat-label">Outflow Expenditures</span>
            <div className="dash-stat-icon-wrap expense">
              <ArrowDownRight size={16} />
            </div>
          </div>
          <div className="dash-stat-number expense">{formatCurrency(expenses)}</div>
          <div className="dash-stat-footer">
            <span className="dash-trend-pill down">Total Deductions</span>
            <span className="dash-stat-subtext">capital burned</span>
          </div>
        </div>

        <div className="dash-stat-card primary-card">
          <div className="dash-card-header">
            <span className="dash-stat-label">Net Retained Capital</span>
            <div className="dash-stat-icon-wrap neutral">
              <ShieldCheck size={16} />
            </div>
          </div>
          <div className={`dash-stat-number ${balance >= 0 ? 'positive' : 'negative'}`}>
            {balance < 0 ? '-' : ''}{formatCurrency(Math.abs(balance))}
          </div>
          <div className="dash-stat-footer">
            <span className={`dash-trend-pill ${balance >= 0 ? 'up' : 'down'}`}>
              {balance >= 0 ? 'Surplus Retained' : 'Capital Deficit'}
            </span>
            <span className="dash-stat-subtext">net velocity</span>
          </div>
        </div>

        <div className="dash-stat-card">
          <div className="dash-card-header">
            <span className="dash-stat-label">Net Savings Rate</span>
            <div className="dash-stat-icon-wrap guard">
              <PieIcon size={16} />
            </div>
          </div>
          <div
            className="dash-stat-number"
            style={{
              color: savingsRate >= 20 ? 'var(--green)' : savingsRate > 0 ? 'var(--accent)' : 'var(--red)',
            }}
          >
            {savingsRate}%
          </div>
          <div className="dash-stat-footer">
            <span className="dash-trend-pill up">
              {savingsRate >= 20 ? 'High Savings Rate' : 'Moderate Savings'}
            </span>
            <span className="dash-stat-subtext">of gross income</span>
          </div>
        </div>
      </div>

      {/* ── Two-Col Analytics Charts ── */}
      <div className="dash-split-section" style={{ marginBottom: 24 }}>
        {/* Category Donut Chart Card */}
        <div className="card dash-panel-card">
          <div className="dash-panel-header">
            <div>
              <h2 className="dash-panel-title">Expense Allocation Distribution</h2>
              <p className="dash-panel-subtitle">Category volume breakdown</p>
            </div>
          </div>

          {pieData.length === 0 ? (
            <div className="empty-state" style={{ padding: '60px 20px' }}>
              <PieIcon size={36} color="var(--text-muted)" />
              <p style={{ marginTop: 8 }}>No expenses recorded for this month.</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={290}>
              <PieChart>
                <Pie
                  data={pieData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={65}
                  outerRadius={105}
                  paddingAngle={4}
                  stroke="var(--surface)"
                  strokeWidth={2}
                >
                  {pieData.map((entry, idx) => (
                    <Cell key={idx} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value) => [formatCurrency(value), 'Total Amount']}
                  contentStyle={customTooltipStyle}
                  itemStyle={customItemStyle}
                  labelStyle={customLabelStyle}
                />
                <Legend wrapperStyle={{ fontSize: '0.78rem', fontFamily: 'var(--font-mono)' }} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* 6-Month Trend Velocity Chart */}
        <div className="card dash-panel-card">
          <div className="dash-panel-header">
            <div>
              <h2 className="dash-panel-title">6-Month Inflow vs Outflow Trend</h2>
              <p className="dash-panel-subtitle">Velocity comparison over time</p>
            </div>
          </div>

          <ResponsiveContainer width="100%" height={290}>
            <BarChart data={trendData} barSize={16}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis
                dataKey="name"
                tick={{ fill: 'var(--text-muted)', fontSize: 11, fontFamily: 'var(--font-mono)' }}
                axisLine={{ stroke: 'var(--border)' }}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: 'var(--text-muted)', fontSize: 11, fontFamily: 'var(--font-mono)' }}
                axisLine={{ stroke: 'var(--border)' }}
                tickLine={false}
                tickFormatter={(v) => `₹${v >= 1000 ? (v / 1000).toFixed(0) + 'k' : v}`}
              />
              <Tooltip
                formatter={(value, name) => [formatCurrency(value), name]}
                contentStyle={customTooltipStyle}
                itemStyle={customItemStyle}
                labelStyle={customLabelStyle}
              />
              <Legend wrapperStyle={{ fontSize: '0.78rem', fontFamily: 'var(--font-mono)' }} />
              <Bar dataKey="Income" fill="var(--green)" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Expenses" fill="var(--accent)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ── Budget vs Actual Telemetry ── */}
      {report.budgetComparison.length > 0 && (
        <div className="card dash-panel-card" style={{ marginBottom: 24 }}>
          <div className="dash-panel-header">
            <div>
              <h2 className="dash-panel-title">Budget vs Actual Performance</h2>
              <p className="dash-panel-subtitle">Evaluating spend against targeted allocations</p>
            </div>
          </div>

          <div className="dash-category-list">
            {report.budgetComparison.map((b, i) => {
              const spent = parseFloat(b.spent) || 0;
              const limit = parseFloat(b.budgeted) || 0;
              const pct = limit > 0 ? Math.min((spent / limit) * 100, 100) : 0;
              const isOver = spent > limit;

              return (
                <div className="dash-category-item" key={i}>
                  <div className="dash-cat-top">
                    <div className="dash-cat-title-wrap">
                      <span className="cat-dot" style={{ background: b.color || 'var(--accent)' }} />
                      <span className="dash-cat-name">{b.name}</span>
                    </div>
                    <div className="dash-cat-amount-wrap">
                      <span className="dash-cat-amount" style={{ color: isOver ? 'var(--red)' : 'var(--text-primary)' }}>
                        {formatCurrency(spent)} / {formatCurrency(limit)}
                      </span>
                      <span className={`dash-budget-pct-badge ${isOver ? 'danger' : ''}`}>
                        {pct.toFixed(0)}%
                      </span>
                    </div>
                  </div>
                  <div className="progress-bar" style={{ height: 6 }}>
                    <div
                      className="progress-fill"
                      style={{
                        width: `${pct}%`,
                        background: isOver ? 'var(--red)' : b.color || 'var(--accent)',
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Category Breakdown Table ── */}
      <div className="card dash-panel-card">
        <div className="dash-panel-header">
          <div>
            <h2 className="dash-panel-title">Category Audit Breakdown</h2>
            <p className="dash-panel-subtitle">Itemized expense distribution</p>
          </div>
        </div>

        {report.byCategory.length === 0 ? (
          <div className="empty-state" style={{ padding: '40px 20px' }}>
            <p>No category expenses recorded for this month.</p>
          </div>
        ) : (
          <div className="table-wrapper">
            <table className="tx-table">
              <thead>
                <tr>
                  <th>Category</th>
                  <th>Transactions</th>
                  <th>Total Spent</th>
                  <th>Share of Monthly Expenses</th>
                </tr>
              </thead>
              <tbody>
                {report.byCategory.map((c, i) => {
                  const share = expenses > 0 ? ((parseFloat(c.total) / expenses) * 100).toFixed(1) : 0;
                  return (
                    <tr key={i} className="tx-table-row">
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                          <span
                            className="cat-dot"
                            style={{
                              background: c.color || TACTICAL_PALETTE[i % TACTICAL_PALETTE.length],
                              width: 8,
                              height: 8,
                            }}
                          />
                          <span style={{ fontWeight: 600 }}>{c.category || 'Uncategorized'}</span>
                        </div>
                      </td>
                      <td style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>{c.count}</td>
                      <td className="amount-expense">{formatCurrency(c.total)}</td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                          <div className="progress-bar" style={{ flex: 1, height: 6 }}>
                            <div
                              className="progress-fill"
                              style={{
                                width: `${share}%`,
                                background: c.color || TACTICAL_PALETTE[i % TACTICAL_PALETTE.length],
                              }}
                            />
                          </div>
                          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.78rem', width: 45, textAlign: 'right' }}>
                            {share}%
                          </span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Report;