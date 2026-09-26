import React, { useState, useEffect } from 'react';
import {
  Plus,
  Trash2,
  AlertTriangle,
  CheckCircle2,
  ShieldCheck,
  PiggyBank,
  TrendingDown,
  Activity,
  Layers,
  Sparkles,
} from 'lucide-react';
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
  const monthName = new Date(year, month - 1).toLocaleString('default', { month: 'long' });

  useEffect(() => {
    loadBudgets();
  }, [month, year]);

  const loadBudgets = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API}/budgets?month=${month}&year=${year}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setBudgets(res.data);
    } catch (err) {
      console.log('Error loading budgets:', err);
    }
    setLoading(false);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this budget cap?')) return;
    try {
      await axios.delete(`${API}/budgets/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      loadBudgets();
    } catch (err) {
      console.log('Error deleting budget:', err);
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

  const remainingTotal = totalBudgeted - totalSpent;
  const overallUtilization = totalBudgeted > 0 ? Math.min((totalSpent / totalBudgeted) * 100, 100).toFixed(0) : 0;

  return (
    <Layout>
      {/* ── Page Header ── */}
      <div className="page-header">
        <div>
          <div className="page-title">Budget Guardrails</div>
          <div className="page-subtitle">
            {monthName} {year} — monthly spending limits &amp; threshold burn protection
          </div>
        </div>
        <div className="header-actions">
          <MonthPicker month={month} year={year} onChange={handleMonthChange} />
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => setShowModal(true)}
            style={{ gap: 7, borderRadius: 10 }}
          >
            <Plus size={16} />
            <span>Set New Budget</span>
          </button>
        </div>
      </div>

      {/* ── Budget Summary Telemetry Ribbon ── */}
      <div className="budget-summary-ribbon">
        <div className="budget-summary-card">
          <div className="budget-summary-label">
            <span className="budget-indicator allocated" /> Total Cap Allocated
          </div>
          <div className="budget-summary-value">{formatCurrency(totalBudgeted)}</div>
          <div className="budget-summary-sub">Across {budgets.length} category caps</div>
        </div>

        <div className="budget-summary-card">
          <div className="budget-summary-label">
            <span className="budget-indicator spent" /> Total Utilized Spend
          </div>
          <div className="budget-summary-value" style={{ color: totalSpent > totalBudgeted ? 'var(--red)' : 'var(--text-primary)' }}>
            {formatCurrency(totalSpent)}
          </div>
          <div className="budget-summary-sub">{overallUtilization}% of total capacity</div>
        </div>

        <div className="budget-summary-card">
          <div className="budget-summary-label">
            <span className="budget-indicator remaining" /> Remaining Headroom
          </div>
          <div className={`budget-summary-value ${remainingTotal >= 0 ? 'positive' : 'negative'}`}>
            {remainingTotal < 0 ? '-' : ''}{formatCurrency(Math.abs(remainingTotal))}
          </div>
          <div className="budget-summary-sub">
            {remainingTotal >= 0 ? 'unspent capital margin' : 'cashflow deficit'}
          </div>
        </div>

        <div className="budget-summary-card">
          <div className="budget-summary-label">System Guard Status</div>
          <div className={`budget-status-pill ${overCount > 0 ? 'alert' : 'healthy'}`}>
            {overCount > 0 ? (
              <>
                <AlertTriangle size={15} />
                <span>{overCount} Limits Exceeded</span>
              </>
            ) : (
              <>
                <CheckCircle2 size={15} />
                <span>All Caps Normal</span>
              </>
            )}
          </div>
          <div className="budget-summary-sub">automated threshold scan</div>
        </div>
      </div>

      {/* ── Main Budget Cards Section ── */}
      <div className="budget-cards-section">
        {loading ? (
          <div className="dashboard-loading-container" style={{ padding: '60px 0' }}>
            <div className="telemetry-spinner" />
            <div className="telemetry-loading-text">EVALUATING BUDGET THRESHOLDS...</div>
          </div>
        ) : budgets.length === 0 ? (
          <div className="card empty-state" style={{ padding: '60px 20px', textAlign: 'center' }}>
            <PiggyBank size={42} color="var(--text-muted)" />
            <h3 style={{ marginTop: 14 }}>No Budget Guardrails Configured</h3>
            <p style={{ maxWidth: 440, margin: '8px auto 20px', color: 'var(--text-secondary)' }}>
              Setting category limits keeps your capital safe. Define monthly caps for dining, rent, cloud
              infrastructure, and shopping to track real-time utilization.
            </p>
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => setShowModal(true)}
              style={{ gap: 7 }}
            >
              <Plus size={16} />
              <span>Create First Budget Cap</span>
            </button>
          </div>
        ) : (
          <div className="budget-cards-grid">
            {budgets.map((b) => {
              const spent = parseFloat(b.spent) || 0;
              const limit = parseFloat(b.amount) || 0;
              const pct = limit > 0 ? Math.min((spent / limit) * 100, 100) : 0;
              const over = spent > limit;
              const remaining = limit - spent;

              return (
                <div key={b.id} className={`budget-item-card ${over ? 'is-over' : ''}`}>
                  {/* Card Top Row */}
                  <div className="budget-item-top">
                    <div className="budget-item-meta">
                      <div className="budget-item-icon-box" style={{ background: `${b.category_color || 'var(--accent)'}18` }}>
                        <span className="cat-dot" style={{ background: b.category_color || 'var(--accent)', width: 10, height: 10 }} />
                      </div>
                      <div>
                        <h3 className="budget-item-name">{b.name}</h3>
                        <span className="budget-item-sub">Category Guardrail</span>
                      </div>
                    </div>

                    <div className="budget-item-actions">
                      <span className={`budget-pct-chip ${over ? 'alert' : pct > 80 ? 'warn' : 'safe'}`}>
                        {pct.toFixed(0)}%
                      </span>
                      <button
                        type="button"
                        className="btn btn-danger btn-icon btn-sm"
                        title="Delete budget limit"
                        onClick={() => handleDelete(b.id)}
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>

                  {/* Numbers Line */}
                  <div className="budget-item-numbers">
                    <div>
                      <div className="budget-num-label">Current Spend</div>
                      <div className="budget-num-val spent" style={{ color: over ? 'var(--red)' : 'var(--text-primary)' }}>
                        {formatCurrency(spent)}
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div className="budget-num-label">Monthly Limit</div>
                      <div className="budget-num-val limit">{formatCurrency(limit)}</div>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="progress-bar" style={{ height: 8, margin: '14px 0 10px' }}>
                    <div
                      className="progress-fill"
                      style={{
                        width: `${pct}%`,
                        background: over
                          ? 'linear-gradient(90deg, #ff453a, #ff1a2b)'
                          : pct > 80
                          ? 'linear-gradient(90deg, #ff8a00, #ffbd2e)'
                          : 'linear-gradient(90deg, #00ed64, #00d4ff)',
                      }}
                    />
                  </div>

                  {/* Card Footer status note */}
                  <div className={`budget-item-foot ${over ? 'danger' : ''}`}>
                    {over ? (
                      <span>⚠️ Exceeded budget cap by {formatCurrency(Math.abs(remaining))}</span>
                    ) : (
                      <span>✓ {formatCurrency(remaining)} remaining headroom</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Set Budget Modal ── */}
      {showModal && (
        <BudgetModal
          month={month}
          year={year}
          onClose={() => setShowModal(false)}
          onSaved={() => {
            setShowModal(false);
            loadBudgets();
          }}
        />
      )}
    </Layout>
  );
};

export default Budgets;