import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { TrendingUp, TrendingDown, Wallet, Plus, ArrowRight } from 'lucide-react';
import api from '../utils/api';
import Layout from '../components/Layout';
import TransactionModal from '../components/TransactionModal';

const Dashboard = () => {
  const now = new Date();
  const [month] = useState(now.getMonth() + 1);
  const [year] = useState(now.getFullYear());
  const [report, setReport] = useState(null);
  const [recent, setRecent] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const [reportRes, txRes] = await Promise.all([
      api.get('/reports/monthly', { params: { month, year } }),
      api.get('/transactions', { params: { limit: 5 } }),
    ]);
    setReport(reportRes.data);
    setRecent(txRes.data);
    setLoading(false);
  }, [month, year]);

  useEffect(() => { load(); }, [load]);

  if (loading || !report) return <Layout><div className="loading">Loading dashboard...</div></Layout>;

  const income = parseFloat(report.summary.total_income || 0);
  const expenses = parseFloat(report.summary.total_expenses || 0);
  const balance = income - expenses;
  const monthName = new Date(year, month - 1).toLocaleString('default', { month: 'long' });

  const totalBudgeted = report.budgetComparison.reduce((s, b) => s + parseFloat(b.budgeted), 0);
  const totalSpent = report.budgetComparison.reduce((s, b) => s + parseFloat(b.spent), 0);

  return (
    <Layout>
      <div className="page-header">
        <div>
          <div className="page-title">Dashboard</div>
          <div className="page-subtitle">Your overview for {monthName} {year}</div>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          <Plus size={16} /> Add transaction
        </button>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-label">Income</div>
          <div className="stat-value income">${income.toFixed(2)}</div>
          <div className="stat-sub"><TrendingUp size={12} style={{ verticalAlign: 'middle' }} /> This month</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Expenses</div>
          <div className="stat-value expense">${expenses.toFixed(2)}</div>
          <div className="stat-sub"><TrendingDown size={12} style={{ verticalAlign: 'middle' }} /> This month</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Balance</div>
          <div className={`stat-value balance ${balance >= 0 ? 'positive' : 'negative'}`}>
            ${balance.toFixed(2)}
          </div>
          <div className="stat-sub"><Wallet size={12} style={{ verticalAlign: 'middle' }} /> Net for {monthName}</div>
        </div>
      </div>

      <div className="two-col">
        <div className="card">
          <div className="card-title">Spending by category</div>
          {report.byCategory.length === 0 ? (
            <div className="empty-state"><p>No expenses recorded yet this month.</p></div>
          ) : (
            <div style={{ marginTop: 14 }}>
              {report.byCategory.slice(0, 6).map((c, i) => {
                const pct = expenses > 0 ? (parseFloat(c.total) / expenses) * 100 : 0;
                return (
                  <div className="category-row" key={i}>
                    <span className="cat-dot" style={{ background: c.color || '#6B7280' }} />
                    <div className="category-row-info">
                      <div className="category-row-name">
                        <span>{c.category || 'Uncategorized'}</span>
                        <span>${parseFloat(c.total).toFixed(2)}</span>
                      </div>
                      <div className="progress-bar">
                        <div className="progress-fill" style={{ width: `${pct}%`, background: c.color || '#6B7280' }} />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div className="card-title" style={{ marginBottom: 0 }}>Recent transactions</div>
            <Link to="/transactions" style={{ fontSize: '0.78rem', color: 'var(--accent)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4 }}>
              View all <ArrowRight size={12} />
            </Link>
          </div>
          {recent.length === 0 ? (
            <div className="empty-state"><p>No transactions yet. Add your first one.</p></div>
          ) : (
            <div style={{ marginTop: 14 }}>
              {recent.map(t => (
                <div key={t.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid var(--border-light)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span className="cat-dot" style={{ background: t.category_color || '#6B7280' }} />
                    <div>
                      <div style={{ fontSize: '0.85rem', fontWeight: 500 }}>{t.description || t.category_name || 'Transaction'}</div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{new Date(t.date).toLocaleDateString()}</div>
                    </div>
                  </div>
                  <span className={t.type === 'income' ? 'amount-income' : 'amount-expense'}>
                    {t.type === 'income' ? '+' : '-'}${parseFloat(t.amount).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {report.budgetComparison.length > 0 && (
        <div className="card" style={{ marginTop: 20 }}>
          <div className="card-title">Budget overview</div>
          <div style={{ marginTop: 14 }}>
            {report.budgetComparison.map(b => {
              const pct = Math.min((parseFloat(b.spent) / parseFloat(b.budgeted)) * 100, 100);
              const over = parseFloat(b.spent) > parseFloat(b.budgeted);
              return (
                <div className="category-row" key={b.id}>
                  <span className="cat-dot" style={{ background: b.color || 'var(--accent)' }} />
                  <div className="category-row-info">
                    <div className="category-row-name">
                      <span>{b.name}</span>
                      <span style={{ color: over ? 'var(--red)' : 'var(--text-secondary)' }}>
                        ${parseFloat(b.spent).toFixed(2)} / ${parseFloat(b.budgeted).toFixed(2)}
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
        </div>
      )}

      {showModal && (
        <TransactionModal
          onClose={() => setShowModal(false)}
          onSaved={() => { setShowModal(false); load(); }}
        />
      )}
    </Layout>
  );
};

export default Dashboard;
