import React, { useState, useEffect, useCallback } from 'react';
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend,
} from 'recharts';
import api from '../utils/api';
import Layout from '../components/Layout';
import MonthPicker from '../components/MonthPicker';

const MONTH_SHORT = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8, padding: '10px 14px', fontSize: '0.8rem', boxShadow: 'var(--shadow)' }}>
      <div style={{ fontWeight: 600, marginBottom: 6, color: 'var(--text-primary)' }}>{label}</div>
      {payload.map((p, i) => (
        <div key={i} style={{ color: p.color, fontWeight: 500 }}>{p.name}: ${p.value?.toFixed(2)}</div>
      ))}
    </div>
  );
};

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

  if (loading || !report) return <Layout><div className="loading">Loading report...</div></Layout>;

  const income = parseFloat(report.summary.total_income || 0);
  const expenses = parseFloat(report.summary.total_expenses || 0);
  const balance = income - expenses;
  const savingsRate = income > 0 ? ((balance / income) * 100).toFixed(1) : 0;
  const monthName = new Date(year, month - 1).toLocaleString('default', { month: 'long' });

  const pieData = report.byCategory.map(c => ({
    name: c.category || 'Uncategorized',
    value: parseFloat(c.total),
    color: c.color || '#9B9A94',
  }));

  const trendData = report.trend.map(t => ({
    name: MONTH_SHORT[t.month - 1],
    Income: parseFloat(t.income),
    Expenses: parseFloat(t.expenses),
  }));

  return (
    <Layout>
      <div className="page-header">
        <div>
          <div className="page-title">Monthly Report</div>
          <div className="page-subtitle">{monthName} {year} — full summary</div>
        </div>
        <MonthPicker month={month} year={year} onChange={(m, y) => { setMonth(m); setYear(y); }} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 22 }}>
        <div className="stat-card">
          <div className="stat-label">Income</div>
          <div className="stat-value income">${income.toFixed(2)}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Expenses</div>
          <div className="stat-value expense">${expenses.toFixed(2)}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Net</div>
          <div className={`stat-value balance ${balance >= 0 ? 'positive' : 'negative'}`}>${balance.toFixed(2)}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Savings rate</div>
          <div className="stat-value" style={{ color: parseFloat(savingsRate) >= 20 ? 'var(--green)' : 'var(--text-primary)' }}>{savingsRate}%</div>
        </div>
      </div>

      <div className="two-col" style={{ marginBottom: 18 }}>
        <div className="card">
          <div className="card-title">Expense breakdown</div>
          {pieData.length === 0 ? (
            <div className="empty-state"><p>No expenses this month.</p></div>
          ) : (
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={55} outerRadius={90} paddingAngle={2}>
                  {pieData.map((entry, idx) => <Cell key={idx} fill={entry.color} />)}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize: '0.75rem' }} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="card">
          <div className="card-title">6-month trend</div>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={trendData} barSize={16}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: '0.75rem' }} />
              <Bar dataKey="Income" fill="var(--green)" radius={[3, 3, 0, 0]} />
              <Bar dataKey="Expenses" fill="var(--red)" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {report.budgetComparison.length > 0 && (
        <div className="card" style={{ marginBottom: 18 }}>
          <div className="card-title">Budget vs actual</div>
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
                    <span style={{ color: over ? 'var(--red)' : undefined }}>
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
                        <span className="cat-dot" style={{ background: c.color || '#9B9A94' }} />
                        <span style={{ fontWeight: 500 }}>{c.category || 'Uncategorized'}</span>
                      </div>
                    </td>
                    <td style={{ color: 'var(--text-muted)' }}>{c.count}</td>
                    <td className="amount-expense">${parseFloat(c.total).toFixed(2)}</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{ flex: 1, height: 5, background: 'var(--border)', borderRadius: 10, maxWidth: 80 }}>
                          <div style={{ height: '100%', borderRadius: 10, background: c.color || 'var(--accent)', width: `${expenses > 0 ? (parseFloat(c.total) / expenses) * 100 : 0}%` }} />
                        </div>
                        <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
                          {expenses > 0 ? ((parseFloat(c.total) / expenses) * 100).toFixed(1) : 0}%
                        </span>
                      </div>
                    </td>
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