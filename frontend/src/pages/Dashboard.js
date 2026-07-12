import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, ArrowUpRight, ArrowDownRight, ArrowRight } from 'lucide-react';
import axios from 'axios';
import Layout from '../components/Layout';
import TransactionModal from '../components/TransactionModal';

const API = process.env.REACT_APP_API_URL;

const Dashboard = () => {
  const now = new Date();
  const month = now.getMonth() + 1;
  const year = now.getFullYear();

  const [report, setReport] = useState(null);
  const [recent, setRecent] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  const token = localStorage.getItem('token');
  const monthName = now.toLocaleString('default', { month: 'long' });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);

    try {
      const reportRes = await axios.get(`${API}/reports/monthly?month=${month}&year=${year}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setReport(reportRes.data);
    } catch (err) {
      console.log('report error', err);
    }

    try {
      const txRes = await axios.get(`${API}/transactions?limit=6`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setRecent(txRes.data);
    } catch (err) {
      console.log('transactions error', err);
    }

    setLoading(false);
  };

  if (loading) return <Layout><div className="loading">Loading...</div></Layout>;
  if (!report) return <Layout><div className="loading">Something went wrong.</div></Layout>;

  const income = parseFloat(report.summary.total_income) || 0;
  const expenses = parseFloat(report.summary.total_expenses) || 0;
  const balance = income - expenses;

  return (
    <Layout>
      <div className="page-header">
        <div>
          <div className="page-title">Dashboard</div>
          <div className="page-subtitle">{monthName} {year} — here's where you stand</div>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          <Plus size={15} /> Add transaction
        </button>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-label">Income</div>
          <div className="stat-value income">${income.toFixed(2)}</div>
          <div className="stat-sub" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <ArrowUpRight size={12} color="var(--green)" /> this month
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Expenses</div>
          <div className="stat-value expense">${expenses.toFixed(2)}</div>
          <div className="stat-sub" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <ArrowDownRight size={12} color="var(--red)" /> this month
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Net balance</div>
          <div className={`stat-value balance ${balance >= 0 ? 'positive' : 'negative'}`}>
            ${balance.toFixed(2)}
          </div>
          <div className="stat-sub">income minus expenses</div>
        </div>
      </div>

      <div className="two-col">
        <div className="card">
          <div className="card-title">Spending breakdown</div>
          {report.byCategory.length === 0 ? (
            <div className="empty-state"><p>No expenses recorded yet.</p></div>
          ) : (
            report.byCategory.slice(0, 6).map((c, i) => {
              const pct = expenses > 0 ? (parseFloat(c.total) / expenses) * 100 : 0;
              return (
                <div className="category-row" key={i}>
                  <span className="cat-dot" style={{ background: c.color || '#9B9A94' }} />
                  <div className="category-row-info">
                    <div className="category-row-name">
                      <span>{c.category || 'Uncategorized'}</span>
                      <span>${parseFloat(c.total).toFixed(2)}</span>
                    </div>
                    <div className="progress-bar">
                      <div className="progress-fill" style={{ width: `${pct}%`, background: c.color || '#9B9A94' }} />
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <div className="card-title" style={{ marginBottom: 0 }}>Recent transactions</div>
            <Link to="/transactions" style={{ fontSize: '0.75rem', color: 'var(--accent)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 3, fontWeight: 500 }}>
              All <ArrowRight size={12} />
            </Link>
          </div>
          {recent.length === 0 ? (
            <div className="empty-state"><p>No transactions yet.</p></div>
          ) : (
            recent.map(t => (
              <div key={t.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '9px 0', borderBottom: '1px solid var(--border-light)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                  <div style={{ width: 30, height: 30, borderRadius: 8, background: 'var(--surface-2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <span className="cat-dot" style={{ background: t.category_color || '#9B9A94' }} />
                  </div>
                  <div>
                    <div style={{ fontSize: '0.825rem', fontWeight: 500 }}>
                      {t.description || t.category_name || 'Transaction'}
                    </div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                      {new Date(t.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </div>
                  </div>
                </div>
                <span className={t.type === 'income' ? 'amount-income' : 'amount-expense'}>
                  {t.type === 'income' ? '+' : '-'}${parseFloat(t.amount).toFixed(2)}
                </span>
              </div>
            ))
          )}
        </div>
      </div>

      {report.budgetComparison.length > 0 && (
        <div className="card" style={{ marginTop: 18 }}>
          <div className="card-title">Budget status</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 16 }}>
            {report.budgetComparison.map((b, i) => {
              const pct = Math.min((parseFloat(b.spent) / parseFloat(b.budgeted)) * 100, 100);
              const over = parseFloat(b.spent) > parseFloat(b.budgeted);
              return (
                <div key={i} style={{ padding: '12px 14px', background: 'var(--surface-2)', borderRadius: 9, border: '1px solid var(--border)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                    <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>{b.name}</span>
                    <span style={{ fontSize: '0.75rem', color: over ? 'var(--red)' : 'var(--text-muted)' }}>{pct.toFixed(0)}%</span>
                  </div>
                  <div className="progress-bar">
                    <div className="progress-fill" style={{ width: `${pct}%`, background: over ? 'var(--red)' : 'var(--accent)' }} />
                  </div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: 5 }}>
                    ${parseFloat(b.spent).toFixed(2)} of ${parseFloat(b.budgeted).toFixed(2)}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {showModal && (
        <TransactionModal onClose={() => setShowModal(false)} onSaved={() => { setShowModal(false); loadData(); }} />
      )}
    </Layout>
  );
};

export default Dashboard;