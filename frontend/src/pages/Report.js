import React, { useState, useEffect, useCallback } from 'react';
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend,
} from 'recharts';
import api from '../utils/api';
import Layout from '../components/Layout';
import MonthPicker from '../components/MonthPicker';

const MONTH_SHORT = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

const Report = () => {
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const res = await api.get('/reports/monthly', { params: { month, year } });
    setReport(res.data);
    setLoading(false);
  }, [month, year]);

  useEffect(() => { load(); }, [load]);

  const handleMonthChange = (m, y) => { setMonth(m); setYear(y); };

  if (loading || !report) {
    return (
      <Layout>
        <div className="page-header">
          <div>
            <div className="page-title">Monthly Report</div>
            <div className="page-subtitle">Loading...</div>
          </div>
        </div>
        <div className="loading">Loading report...</div>
      </Layout>
    );
  }

  const income = parseFloat(report.summary.total_income || 0);
  const expenses = parseFloat(report.summary.total_expenses || 0);
  const balance = income - expenses;
  const monthName = new Date(year, month - 1).toLocaleString('default', { month: 'long' });

  const pieData = report.byCategory.map(c => ({
    name: c.category || 'Uncategorized',
    value: parseFloat(c.total),
    color: c.color || '#6B7280',
  }));

  const trendData = report.trend.map(t => ({
    name: `${MONTH_SHORT[t.month - 1]}`,
    Income: parseFloat(t.income),
    Expenses: parseFloat(t.expenses),
  }));

  return (
    <Layout>
      <div className="page-header">
        <div>
          <div className="page-title">Monthly Report</div>
          <div className="page-subtitle">A summary of your finances for {monthName} {year}</div>
        </div>
        <MonthPicker month={month} year={year} onChange={handleMonthChange} />
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-label">Total income</div>
          <div className="stat-value income">${income.toFixed(2)}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Total expenses</div>
          <div className="stat-value expense">${expenses.toFixed(2)}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Net balance</div>
          <div className={`stat-value balance ${balance >= 0 ? 'positive' : 'negative'}`}>
            ${balance.toFixed(2)}
          </div>
        </div>
      </div>

      <div className="two-col">
        <div className="card">
          <div className="report-section-title">Expenses by category</div>
          {pieData.length === 0 ? (
            <div className="empty-state"><p>No expense data for this month.</p></div>
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} paddingAngle={2}>
                  {pieData.map((entry, idx) => <Cell key={idx} fill={entry.color} />)}
                </Pie>
                <Tooltip formatter={(v) => `$${v.toFixed(2)}`} />
                <Legend wrapperStyle={{ fontSize: '0.78rem' }} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="card">
          <div className="report-section-title">6-month trend</div>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} stroke="#9CA3AF" />
              <YAxis tick={{ fontSize: 12 }} stroke="#9CA3AF" />
              <Tooltip formatter={(v) => `$${v.toFixed(2)}`} />
              <Legend wrapperStyle={{ fontSize: '0.78rem' }} />
              <Bar dataKey="Income" fill="#10B981" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Expenses" fill="#EF4444" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {report.budgetComparison.length > 0 && (
        <div className="card" style={{ marginTop: 20 }}>
          <div className="report-section-title">Budget vs actual</div>
          {report.budgetComparison.map(b => {
            const spent = parseFloat(b.spent);
            const limit = parseFloat(b.budgeted);
            const pct = Math.min((spent / limit) * 100, 100);
            const over = spent > limit;
            return (
              <div className="category-row" key={b.name}>
                <span className="cat-dot" style={{ background: b.color || 'var(--accent)' }} />
                <div className="category-row-info">
                  <div className="category-row-name">
                    <span>{b.name}</span>
                    <span style={{ color: over ? 'var(--red)' : 'var(--text-secondary)' }}>
                      ${spent.toFixed(2)} / ${limit.toFixed(2)}
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

      <div className="card" style={{ marginTop: 20 }}>
        <div className="report-section-title">Category breakdown</div>
        {report.byCategory.length === 0 ? (
          <div className="empty-state"><p>No expenses to break down for this month.</p></div>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Category</th>
                  <th>Transactions</th>
                  <th>Total</th>
                  <th>% of expenses</th>
                </tr>
              </thead>
              <tbody>
                {report.byCategory.map((c, i) => (
                  <tr key={i}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span className="cat-dot" style={{ background: c.color || '#6B7280' }} />
                        {c.category || 'Uncategorized'}
                      </div>
                    </td>
                    <td>{c.count}</td>
                    <td className="amount-expense">${parseFloat(c.total).toFixed(2)}</td>
                    <td>{expenses > 0 ? ((parseFloat(c.total) / expenses) * 100).toFixed(1) : 0}%</td>
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
