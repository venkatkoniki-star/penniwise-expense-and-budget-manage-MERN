import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import api from '../utils/api';
import Layout from '../components/Layout';
import BudgetModal from '../components/BudgetModal';
import MonthPicker from '../components/MonthPicker';

const Budgets = () => {
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());
  const [budgets, setBudgets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const res = await api.get('/budgets', { params: { month, year } });
    setBudgets(res.data);
    setLoading(false);
  }, [month, year]);

  useEffect(() => { load(); }, [load]);

  const handleMonthChange = (m, y) => { setMonth(m); setYear(y); };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this budget?')) return;
    await api.delete(`/budgets/${id}`);
    load();
  };

  const totalBudgeted = budgets.reduce((s, b) => s + parseFloat(b.amount), 0);
  const totalSpent = budgets.reduce((s, b) => s + parseFloat(b.spent), 0);

  return (
    <Layout>
      <div className="page-header">
        <div>
          <div className="page-title">Budgets</div>
          <div className="page-subtitle">Set monthly limits and track your progress</div>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          <Plus size={16} /> Set budget
        </button>
      </div>

      <div className="filters-bar">
        <MonthPicker month={month} year={year} onChange={handleMonthChange} />
      </div>

      {!loading && budgets.length > 0 && (
        <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(2, 1fr)' }}>
          <div className="stat-card">
            <div className="stat-label">Total budgeted</div>
            <div className="stat-value">${totalBudgeted.toFixed(2)}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Total spent</div>
            <div className={`stat-value ${totalSpent > totalBudgeted ? 'expense' : ''}`}>
              ${totalSpent.toFixed(2)}
            </div>
          </div>
        </div>
      )}

      <div className="card">
        {loading ? (
          <div className="loading">Loading budgets...</div>
        ) : budgets.length === 0 ? (
          <div className="empty-state"><p>No budgets set for this month yet.</p></div>
        ) : (
          <div>
            {budgets.map(b => {
              const spent = parseFloat(b.spent);
              const limit = parseFloat(b.amount);
              const pct = Math.min((spent / limit) * 100, 100);
              const over = spent > limit;
              return (
                <div key={b.id} style={{ padding: '14px 0', borderBottom: '1px solid var(--border-light)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span className="cat-dot" style={{ background: b.category_color || 'var(--accent)' }} />
                      <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>{b.name}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <span style={{ fontSize: '0.85rem', color: over ? 'var(--red)' : 'var(--text-secondary)' }}>
                        ${spent.toFixed(2)} of ${limit.toFixed(2)}
                      </span>
                      <button className="btn btn-danger btn-icon" onClick={() => handleDelete(b.id)}>
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                  <div className="progress-bar">
                    <div className="progress-fill" style={{ width: `${pct}%`, background: over ? 'var(--red)' : 'var(--accent)' }} />
                  </div>
                  {over && (
                    <div style={{ fontSize: '0.75rem', color: 'var(--red)', marginTop: 4 }}>
                      Over budget by ${(spent - limit).toFixed(2)}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {showModal && (
        <BudgetModal
          month={month}
          year={year}
          onClose={() => setShowModal(false)}
          onSaved={() => { setShowModal(false); load(); }}
        />
      )}
    </Layout>
  );
};

export default Budgets;
