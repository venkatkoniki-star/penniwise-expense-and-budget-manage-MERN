import React, { useState, useEffect } from 'react';
import { Plus, Trash2, AlertTriangle, CheckCircle } from 'lucide-react';
import axios from 'axios';
import Layout from '../components/Layout';
import BudgetModal from '../components/BudgetModal';
import MonthPicker from '../components/MonthPicker';
import { formatCurrency } from '../utils/format';

const API = process.env.REACT_APP_API_URL;

const Budgets = () => {
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());
  const [budgets, setBudgets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  const token = localStorage.getItem('token');

  useEffect(() => {
    loadBudgets();
  }, [month, year]);

  const loadBudgets = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API}/budgets?month=${month}&year=${year}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setBudgets(res.data);
    } catch (err) {
      console.log(err);
    }
    setLoading(false);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this budget?')) return;
    try {
      await axios.delete(`${API}/budgets/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      loadBudgets();
    } catch (err) {
      console.log(err);
    }
  };

  const handleMonthChange = (m, y) => {
    setMonth(m);
    setYear(y);
  };

  let totalBudgeted = 0;
  let totalSpent = 0;
  let overCount = 0;

  for (let i = 0; i < budgets.length; i++) {
    totalBudgeted += parseFloat(budgets[i].amount) || 0;
    totalSpent += parseFloat(budgets[i].spent) || 0;
    if (parseFloat(budgets[i].spent) > parseFloat(budgets[i].amount)) {
      overCount += 1;
    }
  }

  return (
    <Layout>
      <div className="page-header">
        <div>
          <div className="page-title">Budgets</div>
          <div className="page-subtitle">Tactical allocation limits &amp; threshold guard</div>
        </div>
        <div className="header-actions">
          <MonthPicker month={month} year={year} onChange={handleMonthChange} />
          <button className="btn btn-primary" onClick={() => setShowModal(true)}>
            <Plus size={15} /> Set budget
          </button>
        </div>
      </div>

      {budgets.length > 0 && (
        <div className="budget-stats-grid">
          <div style={{ flex: 1, padding: '14px 18px', background: 'var(--surface)', borderRadius: 10, border: '1px solid var(--border)' }}>
            <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', fontFamily: 'var(--font-mono)', letterSpacing: '0.08em', marginBottom: 4 }}>Total Allocated</div>
            <div style={{ fontSize: '1.35rem', fontWeight: 800, fontFamily: 'var(--font-mono)' }}>{formatCurrency(totalBudgeted)}</div>
          </div>
          <div style={{ flex: 1, padding: '14px 18px', background: 'var(--surface)', borderRadius: 10, border: '1px solid var(--border)' }}>
            <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', fontFamily: 'var(--font-mono)', letterSpacing: '0.08em', marginBottom: 4 }}>Total Utilized</div>
            <div style={{ fontSize: '1.35rem', fontWeight: 800, fontFamily: 'var(--font-mono)', color: totalSpent > totalBudgeted ? 'var(--red)' : 'var(--text-primary)' }}>{formatCurrency(totalSpent)}</div>
          </div>
          <div style={{ flex: 1, padding: '14px 18px', background: overCount > 0 ? 'var(--red-light)' : 'var(--green-light)', borderRadius: 10, border: `1px solid ${overCount > 0 ? 'var(--red-border)' : 'var(--green-border)'}` }}>
            <div style={{ fontSize: '0.68rem', fontWeight: 600, textTransform: 'uppercase', fontFamily: 'var(--font-mono)', letterSpacing: '0.08em', marginBottom: 4, color: overCount > 0 ? 'var(--red)' : 'var(--green)' }}>Status Guard</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.95rem', fontWeight: 700, color: overCount > 0 ? 'var(--red)' : 'var(--green)' }}>
              {overCount > 0 ? <><AlertTriangle size={16} /> {overCount} over budget</> : <><CheckCircle size={16} /> All systems on track</>}
            </div>
          </div>
        </div>
      )}

      <div className="card">
        {loading ? (
          <div className="loading">Loading budgets...</div>
        ) : budgets.length === 0 ? (
          <div className="empty-state"><p>No budget limits configured for this month.</p></div>
        ) : (
          <div>
            {budgets.map(b => {
              const spent = parseFloat(b.spent) || 0;
              const limit = parseFloat(b.amount) || 0;
              const pct = limit > 0 ? Math.min((spent / limit) * 100, 100) : 0;
              const over = spent > limit;
              const remaining = limit - spent;

              return (
                <div key={b.id} style={{ padding: '16px 0', borderBottom: '1px solid var(--border-light)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                      <div style={{ width: 32, height: 32, borderRadius: 8, background: 'var(--surface-2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <span className="cat-dot" style={{ background: b.category_color || 'var(--accent)' }} />
                      </div>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{b.name}</div>
                        <div style={{ fontSize: '0.72rem', color: over ? 'var(--red)' : 'var(--text-muted)', fontFamily: 'var(--font-mono)', marginTop: 2 }}>
                          {over ? `⚠️ Over limit by ${formatCurrency(Math.abs(remaining))}` : `${formatCurrency(remaining)} remaining`}
                        </div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '0.92rem', fontWeight: 700, fontFamily: 'var(--font-mono)', color: over ? 'var(--red)' : 'var(--text-primary)' }}>{formatCurrency(spent)}</div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>of {formatCurrency(limit)} ({pct.toFixed(0)}%)</div>
                      </div>
                      <button className="btn btn-danger btn-icon btn-sm" title="Delete budget" onClick={() => handleDelete(b.id)}>
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                  <div className="progress-bar" style={{ height: 7 }}>
                    <div className="progress-fill" style={{ width: `${pct}%`, background: over ? 'var(--red)' : 'var(--accent)' }} />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {showModal && (
        <BudgetModal month={month} year={year} onClose={() => setShowModal(false)} onSaved={() => { setShowModal(false); loadBudgets(); }} />
      )}
    </Layout>
  );
};

export default Budgets;