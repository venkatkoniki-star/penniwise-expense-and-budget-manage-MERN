import React, { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend } from 'recharts';
import axios from 'axios';
import Layout from '../components/Layout';
import MonthPicker from '../components/MonthPicker';
import { formatCurrency } from '../utils/format';

const API = process.env.REACT_APP_API_URL;
const MONTH_SHORT = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

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
        headers: { Authorization: `Bearer ${token}` }
      });
      setReport(res.data);
    } catch (err) {
      console.log(err);
    }
    setLoading(false);
  };

  const handleMonthChange = (m, y) => {
    setMonth(m);
    setYear(y);
  };

  if (loading) return <Layout><div className="loading">Loading report telemetry...</div></Layout>;
  if (!report) return <Layout><div className="loading">Report unavailable.</div></Layout>;

  const income = parseFloat(report?.summary?.total_income) || 0;
  const expenses = parseFloat(report?.summary?.total_expenses) || 0;
  const balance = income - expenses;
  const savingsRate = income > 0 ? ((balance / income) * 100).toFixed(1) : 0;
  const monthName = new Date(year, month - 1).toLocaleString('default', { month: 'long' });

  const pieData = report.byCategory.map((item, idx) => ({
    name: item.category || 'Uncategorized',
    value: parseFloat(item.total),
    color: item.color || TACTICAL_PALETTE[idx % TACTICAL_PALETTE.length]
  }));

  const trendData = report.trend.map(t => ({
    name: MONTH_SHORT[t.month - 1],
    Income: parseFloat(t.income) || 0,
    Expenses: parseFloat(t.expenses) || 0
  }));

  const customTooltipStyle = {
    backgroundColor: 'var(--surface)',
    border: '1px solid var(--border)',
    borderRadius: '8px',
    boxShadow: 'var(--shadow-lg)',
    padding: '10px 14px',
    color: 'var(--text-primary)',
    fontFamily: 'var(--font-mono)',
    fontSize: '0.8rem',
  };

  const customItemStyle = {
    color: 'var(--text-primary)',
    fontFamily: 'var(--font-mono)',
  };

  const customLabelStyle = {
    color: 'var(--text-muted)',
    fontFamily: 'var(--font-mono)',
    fontWeight: 600,
    marginBottom: '4px',
  };

  return (
    <Layout>
      <div className="page-header">
        <div>
          <div className="page-title">Monthly Report</div>
          <div className="page-subtitle">{monthName} {year} — financial telemetry &amp; diagnostics</div>
        </div>
        <MonthPicker month={month} year={year} onChange={handleMonthChange} />
      </div>

      <div className="report-stats-grid">
        <div className="stat-card">
          <div className="stat-label">Inflow · Income</div>
          <div className="stat-value income">{formatCurrency(income)}</div>
          <div className="stat-sub">recorded receipts</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Outflow · Expenses</div>
          <div className="stat-value expense">{formatCurrency(expenses)}</div>
          <div className="stat-sub">total deductions</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Net Capital</div>
          <div className={`stat-value balance ${balance >= 0 ? 'positive' : 'negative'}`}>
            {balance < 0 ? '-' : ''}{formatCurrency(Math.abs(balance))}
          </div>
          <div className="stat-sub">{balance >= 0 ? 'surplus retained' : 'capital deficit'}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Savings Rate</div>
          <div className="stat-value" style={{ color: savingsRate >= 20 ? 'var(--green)' : savingsRate > 0 ? 'var(--accent)' : 'var(--red)' }}>
            {savingsRate}%
          </div>
          <div className="stat-sub">of gross income saved</div>
        </div>
      </div>

      <div className="two-col" style={{ marginBottom: 18 }}>
        <div className="card">
          <div className="card-title">Expense breakdown by category</div>
          {pieData.length === 0 ? (
            <div className="empty-state"><p>No expenses recorded for this month.</p></div>
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie
                  data={pieData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={95}
                  paddingAngle={3}
                  stroke="var(--surface)"
                  strokeWidth={2}
                >
                  {pieData.map((entry, idx) => (
                    <Cell key={idx} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value) => [formatCurrency(value), 'Amount']}
                  contentStyle={customTooltipStyle}
                  itemStyle={customItemStyle}
                  labelStyle={customLabelStyle}
                />
                <Legend wrapperStyle={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)' }} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="card">
          <div className="card-title">6-Month Trend Telemetry</div>
          <ResponsiveContainer width="100%" height={260}>
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
              <Legend wrapperStyle={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)' }} />
              <Bar dataKey="Income" fill="var(--green)" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Expenses" fill="var(--accent)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {report.budgetComparison.length > 0 && (
        <div className="card" style={{ marginBottom: 18 }}>
          <div className="card-title">Budget vs actual telemetry</div>
          {report.budgetComparison.map((b, i) => {
            const spent = parseFloat(b.spent);
            const limit = parseFloat(b.budgeted);
            const pct = Math.min((spent / limit) * 100, 100);
            const over = spent > limit;
            return (
              <div className="category-row" key={i}>
                <span className="cat-dot" style={{ background: b.color || 'var(--accent)' }} />
                <div className="category-row-info">
                  <div className="category-row-name">
                    <span style={{ fontWeight: 600 }}>{b.name}</span>
                    <span style={{ color: over ? 'var(--red)' : undefined }}>
                      {formatCurrency(spent)} / {formatCurrency(limit)}
                    </span>
                  </div>
                  <div className="progress-bar">
                    <div className="progress-fill" style={{ width: `${pct}%`, background: over ? 'var(--red)' : 'var(--accent)' }} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className="card">
        <div className="card-title">Category breakdown</div>
        {report.byCategory.length === 0 ? (
          <div className="empty-state"><p>No expenses to break down.</p></div>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Category</th>
                  <th>Transactions</th>
                  <th>Amount</th>
                  <th>% of total</th>
                </tr>
              </thead>
              <tbody>
                {report.byCategory.map((c, i) => (
                  <tr key={i}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span className="cat-dot" style={{ background: c.color || TACTICAL_PALETTE[i % TACTICAL_PALETTE.length] }} />
                        <span style={{ fontWeight: 600 }}>{c.category || 'Uncategorized'}</span>
                      </div>
                    </td>
                    <td style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>{c.count}</td>
                    <td className="amount-expense">{formatCurrency(c.total)}</td>
                    <td style={{ fontFamily: 'var(--font-mono)' }}>{expenses > 0 ? ((parseFloat(c.total) / expenses) * 100).toFixed(1) : 0}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Report;