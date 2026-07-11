import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Trash2, AlertTriangle, CheckCircle } from 'lucide-react';
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

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this budget?')) return;
    await api.delete(`/budgets/${id}`);
    load();
  };

  const totalBudgeted = budgets.reduce((s, b) => s + parseFloat(b.amount), 0);
  const totalSpent = budgets.reduce((s, b) => s + parseFloat(b.spent), 0);
  const overCount = budgets.filter(b => parseFloat(b.spent) > parseFloat(b.amount)).length;

  return (
    <Layout>
      <div className="page-header">
        <div>
          <div className="page-title">Budgets</div>
          <div className="page-subtitle">Set limits, track where you're at</div>
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <MonthPicker month={month} year={year} onChange={(m, y) => { setMonth(m); setYear(y); }} />
          <button className="btn btn-primary" onClick={() => setShowModal(true)}>
            <Plus size={15} /> Set budget
          </button>
        </div>
      </div>

      {budgets.length > 0 && (
        <div style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
          <div style={{ flex: 1, padding: '14px 18px', background: 'var(--surface)', borderRadius: 10, border: '1px solid var(--border)' }}>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>Total budgeted</div>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>${totalBudgeted.toFixed(2)}</div>
          </div>
          <div style={{ flex: 1, padding: '14px 18px', background: 'var(--surface)', borderRadius: 10, border: '1px solid var(--border)' }}>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>Total spent</div>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: totalSpent > totalBudgeted ? 'var(--red)' : 'var(--text-primary)', letterSpacing: '-0.02em' }}>${totalSpent.toFixed(2)}</div>
          </div>
          <div style={{ flex: 1, padding: '14px 18px', background: overCount > 0 ? 'var(--red-light)' : 'var(--green-light)', borderRadius: 10, border: `1px solid ${overCount > 0 ? '#fca5a5' : '#b7e4cc'}` }}>
            <div style={{ fontSize: '0.7rem', color: overCount > 0 ? 'var(--red)' : 'var(--green)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>Status</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.9rem', fontWeight: 700, color: overCount > 0 ? 'var(--red)' : 'var(--green)' }}>
              {overCount > 0 ? <><AlertTriangle size={16} /> {overCount} over budget</> : <><CheckCircle size={16} /> On track</>}
            </div>
          </div>
        </div>
      )}

      <div className="card">
        {loading ? (
          <div className="loading">Loading...</div>
        ) : budgets.length === 0 ? (
          <div className="empty-state"><p>No budgets set for this month yet. Create your first one.</p></div>
        ) : (
          <div>
            {budgets.map(b => {
              const spent = parseFloat(b.spent);
              const limit = parseFloat(b.amount);
              const pct = Math.min((spent / limit) * 100, 100);
              const over = spent > limit;
              const remaining = limit - spent;
              return (
                <div key={b.id} style={{ padding: '16px 0', borderBottom: '1px solid var(--border-light)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                      <div style={{ width: 32, height: 32, borderRadius: 8, background: b.category_color ? `${b.category_color}18` : 'var(--surface-2)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: `1.5px solid ${b.category_color || 'var(--border)'}30` }}>
                        <span className="cat-dot" style={{ background: b.category_color || 'var(--accent)' }} />
                      </div>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--text-primary)' }}>{b.name}</div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                          {over ? `over by $${Math.abs(remaining).toFixed(2)}` : `$${remaining.toFixed(2)} remaining`}
                        </div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '0.9rem', fontWeight: 700, color: over ? 'var(--red)' : 'var(--text-primary)' }}>${spent.toFixed(2)}</div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>of ${limit.toFixed(2)}</div>
                      </div>
                      <button className="btn btn-danger btn-icon btn-sm" onClick={() => handleDelete(b.id)}>
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                  <div className="progress-bar" style={{ height: 7 }}>
                    <div className="progress-fill" style={{ width: `${pct}%`, background: over ? 'var(--red)' : pct > 80 ? '#F59E0B' : 'var(--accent)' }} />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {showModal && (
        <BudgetModal month={month} year={year} onClose={() => setShowModal(false)} onSaved={() => { setShowModal(false); load(); }} />
      )}
    </Layout>
  );
};

export default Budgets;