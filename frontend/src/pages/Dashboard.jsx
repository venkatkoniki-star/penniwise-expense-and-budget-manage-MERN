import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Plus,
  ArrowUpRight,
  ArrowDownRight,
  ArrowRight,
  Wallet,
  TrendingUp,
  TrendingDown,
  ShieldCheck,
  AlertTriangle,
  Clock,
  Sparkles,
  PieChart,
  PiggyBank,
  CheckCircle2,
  Activity,
  Layers,
  Calendar,
} from 'lucide-react';
import axios from 'axios';
import Layout from '../components/Layout';
import TransactionModal from '../components/TransactionModal';
import BudgetModal from '../components/BudgetModal';
import AppLogo from '../components/AppLogo';
import { formatCurrency, formatCurrencyWithSign } from '../utils/format';
import { useTheme } from '../context/ThemeContext';

const API = process.env.REACT_APP_API_URL;

const Dashboard = () => {
  const now = new Date();
  const month = now.getMonth() + 1;
  const year = now.getFullYear();

  const [report, setReport] = useState(null);
  const [recent, setRecent] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showTxModal, setShowTxModal] = useState(false);
  const [showBudgetModal, setShowBudgetModal] = useState(false);
  const { theme } = useTheme();

  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user')) || {};
  const monthName = now.toLocaleString('default', { month: 'long' });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);

    try {
      const reportRes = await axios.get(`${API}/reports/monthly?month=${month}&year=${year}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setReport(reportRes.data);
    } catch (err) {
      console.log('report error', err);
    }

    try {
      const txRes = await axios.get(`${API}/transactions?limit=6`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setRecent(txRes.data);
    } catch (err) {
      console.log('transactions error', err);
    }

    setLoading(false);
  };

  if (loading) {
    return (
      <Layout>
        <div className="dashboard-loading-container">
          <div className="telemetry-spinner" />
          <div className="telemetry-loading-text">CALIBRATING FINANCIAL TELEMETRY...</div>
        </div>
      </Layout>
    );
  }

  if (!report) {
    return (
      <Layout>
        <div className="empty-state">
          <AlertTriangle size={32} color="var(--accent)" />
          <h3>Telemetry Unavailable</h3>
          <p>Unable to establish connection to report services. Please refresh or check server status.</p>
          <button className="btn btn-primary" onClick={loadData}>
            Retry Connection
          </button>
        </div>
      </Layout>
    );
  }

  const income = parseFloat(report?.summary?.total_income) || 0;
  const expenses = parseFloat(report?.summary?.total_expenses) || 0;
  const balance = income - expenses;
  const savingsRate = income > 0 ? ((balance / income) * 100).toFixed(1) : 0;

  // Total budgeted vs spent
  const totalBudgeted = report.budgetComparison.reduce((acc, b) => acc + (parseFloat(b.budgeted) || 0), 0);
  const totalBudgetSpent = report.budgetComparison.reduce((acc, b) => acc + (parseFloat(b.spent) || 0), 0);
  const budgetUtilization = totalBudgeted > 0 ? Math.min((totalBudgetSpent / totalBudgeted) * 100, 100).toFixed(0) : 0;
  const overBudgetCount = report.budgetComparison.filter((b) => parseFloat(b.spent) > parseFloat(b.budgeted)).length;

  return (
    <Layout>
      {/* ── 1. Tactical Welcome Banner with Dynamic Theme Logo ── */}
      <div className="dash-welcome-banner">
        <div className="dash-welcome-left">
          <div className="dash-badge-row">
            <div className="dash-brand-chip">
              <AppLogo size="sm" showSub={false} />
            </div>
            <span className="dash-system-pill">
              <span className="pulse-dot" />
              INR TELEMETRY ENGINE ACTIVE
            </span>
            <span className="dash-date-pill">
              <Calendar size={11} /> {monthName} {year}
            </span>
          </div>
          <h1 className="dash-title">
            Welcome back, <span className="dash-user-highlight">{user.name ? user.name.split(' ')[0] : 'Operator'}</span>
          </h1>
          <p className="dash-subtitle">
            Here is your live capital telemetry, spending velocity, and category budget health.
          </p>
        </div>

        <div className="dash-header-actions">
          {/* Prominent Theme-adaptive Logo Emblem in Dashboard Header */}
          <div className="dash-theme-emblem-card" title="Current Atmosphere Identity">
            <AppLogo size="md" showSub={true} />
          </div>

          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => setShowBudgetModal(true)}
            style={{ borderRadius: 10, gap: 7 }}
          >
            <PiggyBank size={15} />
            <span>Set Budget</span>
          </button>

          <button
            type="button"
            className="btn btn-primary"
            onClick={() => setShowTxModal(true)}
            style={{ borderRadius: 10, gap: 7 }}
          >
            <Plus size={16} />
            <span>Add Transaction</span>
          </button>
        </div>
      </div>

      {/* ── 2. Bento Stat Cards Grid ── */}
      <div className="dash-bento-grid">
        {/* Card 1: Net Liquid Capital / Balance */}
        <div className="dash-stat-card primary-card">
          <div className="dash-card-header">
            <span className="dash-stat-label">Net Retained Balance</span>
            <div className="dash-stat-icon-wrap neutral">
              <Wallet size={16} />
            </div>
          </div>
          <div className={`dash-stat-number ${balance >= 0 ? 'positive' : 'negative'}`}>
            {balance < 0 ? '-' : ''}{formatCurrency(Math.abs(balance))}
          </div>
          <div className="dash-stat-footer">
            <span className={`dash-trend-pill ${balance >= 0 ? 'up' : 'down'}`}>
              {balance >= 0 ? <ArrowUpRight size={13} /> : <ArrowDownRight size={13} />}
              {savingsRate}% Savings Velocity
            </span>
            <span className="dash-stat-subtext">net retained</span>
          </div>
        </div>

        {/* Card 2: Total Inflow */}
        <div className="dash-stat-card">
          <div className="dash-card-header">
            <span className="dash-stat-label">Gross Inflow (Income)</span>
            <div className="dash-stat-icon-wrap income">
              <ArrowUpRight size={16} />
            </div>
          </div>
          <div className="dash-stat-number income">{formatCurrency(income)}</div>
          <div className="dash-stat-footer">
            <span className="dash-trend-pill up">
              <TrendingUp size={13} /> Active Inflow
            </span>
            <span className="dash-stat-subtext">recorded receipts</span>
          </div>
        </div>

        {/* Card 3: Total Outflow */}
        <div className="dash-stat-card">
          <div className="dash-card-header">
            <span className="dash-stat-label">Gross Outflow (Expenses)</span>
            <div className="dash-stat-icon-wrap expense">
              <ArrowDownRight size={16} />
            </div>
          </div>
          <div className="dash-stat-number expense">{formatCurrency(expenses)}</div>
          <div className="dash-stat-footer">
            <span className="dash-trend-pill down">
              <TrendingDown size={13} /> Deductions
            </span>
            <span className="dash-stat-subtext">
              {income > 0 ? `${((expenses / income) * 100).toFixed(0)}% of income` : 'total spend'}
            </span>
          </div>
        </div>

        {/* Card 4: Budget Guardrail Status */}
        <div className="dash-stat-card">
          <div className="dash-card-header">
            <span className="dash-stat-label">Budget Guardrail Cap</span>
            <div className={`dash-stat-icon-wrap ${overBudgetCount > 0 ? 'alert' : 'guard'}`}>
              {overBudgetCount > 0 ? <AlertTriangle size={16} /> : <ShieldCheck size={16} />}
            </div>
          </div>
          <div className="dash-stat-number" style={{ color: overBudgetCount > 0 ? 'var(--red)' : 'var(--text-primary)' }}>
            {budgetUtilization}%
          </div>
          <div className="dash-stat-footer">
            <span className={`dash-trend-pill ${overBudgetCount > 0 ? 'down' : 'up'}`}>
              {overBudgetCount > 0 ? `${overBudgetCount} over budget` : 'Guarded & Normal'}
            </span>
            <span className="dash-stat-subtext">{formatCurrency(totalBudgetSpent)} utilized</span>
          </div>
        </div>
      </div>

      {/* ── 3. Two-Column Deep Telemetry ── */}
      <div className="dash-split-section">
        {/* Left Column: Spending Breakdown by Category */}
        <div className="card dash-panel-card">
          <div className="dash-panel-header">
            <div>
              <h2 className="dash-panel-title">Spending Breakdown</h2>
              <p className="dash-panel-subtitle">Category velocity and allocation distribution</p>
            </div>
            <Link to="/reports" className="dash-panel-link">
              <span>Full Analytics</span>
              <ArrowRight size={13} />
            </Link>
          </div>

          {report.byCategory.length === 0 ? (
            <div className="empty-state" style={{ padding: '36px 20px' }}>
              <PieChart size={32} color="var(--text-muted)" />
              <p style={{ marginTop: 8 }}>No expenses recorded for this month yet.</p>
              <button
                type="button"
                className="btn btn-primary btn-sm"
                onClick={() => setShowTxModal(true)}
                style={{ marginTop: 12 }}
              >
                <Plus size={14} /> Record First Expense
              </button>
            </div>
          ) : (
            <div className="dash-category-list">
              {report.byCategory.slice(0, 6).map((c, i) => {
                const pct = expenses > 0 ? ((parseFloat(c.total) / expenses) * 100).toFixed(1) : 0;
                return (
                  <div className="dash-category-item" key={i}>
                    <div className="dash-cat-top">
                      <div className="dash-cat-title-wrap">
                        <span className="cat-dot" style={{ background: c.color || 'var(--accent)' }} />
                        <span className="dash-cat-name">{c.category || 'Uncategorized'}</span>
                        <span className="dash-cat-count-chip">{c.count} txns</span>
                      </div>
                      <div className="dash-cat-amount-wrap">
                        <span className="dash-cat-amount">{formatCurrency(c.total)}</span>
                        <span className="dash-cat-pct">{pct}%</span>
                      </div>
                    </div>
                    <div className="progress-bar" style={{ height: 6 }}>
                      <div
                        className="progress-fill"
                        style={{
                          width: `${pct}%`,
                          background: c.color || 'var(--accent)',
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Column: Recent Transactions Stream */}
        <div className="card dash-panel-card">
          <div className="dash-panel-header">
            <div>
              <h2 className="dash-panel-title">Recent Transactions</h2>
              <p className="dash-panel-subtitle">Live execution ledger</p>
            </div>
            <Link to="/transactions" className="dash-panel-link">
              <span>View All</span>
              <ArrowRight size={13} />
            </Link>
          </div>

          {recent.length === 0 ? (
            <div className="empty-state" style={{ padding: '36px 20px' }}>
              <Clock size={32} color="var(--text-muted)" />
              <p style={{ marginTop: 8 }}>No transactions executed yet.</p>
              <button
                type="button"
                className="btn btn-primary btn-sm"
                onClick={() => setShowTxModal(true)}
                style={{ marginTop: 12 }}
              >
                <Plus size={14} /> Add Transaction
              </button>
            </div>
          ) : (
            <div className="dash-tx-stream">
              {recent.map((t) => (
                <div key={t.id} className="dash-tx-item">
                  <div className="dash-tx-left">
                    <div className={`dash-tx-icon ${t.type}`}>
                      {t.type === 'income' ? <ArrowUpRight size={15} /> : <ArrowDownRight size={15} />}
                    </div>
                    <div className="dash-tx-meta">
                      <div className="dash-tx-desc">
                        {t.description || t.category_name || 'Transaction'}
                      </div>
                      <div className="dash-tx-sub">
                        <span className="dash-tx-cat-chip" style={{ borderColor: t.category_color || 'var(--border)' }}>
                          <span className="cat-dot" style={{ background: t.category_color || 'var(--accent)', width: 5, height: 5 }} />
                          {t.category_name || 'General'}
                        </span>
                        <span>•</span>
                        <span>{new Date(t.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}</span>
                      </div>
                    </div>
                  </div>

                  <div className={`dash-tx-amount ${t.type}`}>
                    {formatCurrencyWithSign(t.amount, t.type)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── 4. Budget Guardrail Matrix ── */}
      {report.budgetComparison.length > 0 && (
        <div className="card dash-budget-matrix-card">
          <div className="dash-panel-header">
            <div>
              <h2 className="dash-panel-title">Active Category Budget Guardrails</h2>
              <p className="dash-panel-subtitle">Threshold monitoring and burn prevention</p>
            </div>
            <Link to="/budgets" className="dash-panel-link">
              <span>Manage Budgets</span>
              <ArrowRight size={13} />
            </Link>
          </div>

          <div className="dash-budget-grid">
            {report.budgetComparison.map((b, i) => {
              const spent = parseFloat(b.spent) || 0;
              const budgeted = parseFloat(b.budgeted) || 0;
              const pct = budgeted > 0 ? Math.min((spent / budgeted) * 100, 100) : 0;
              const isOver = spent > budgeted;
              const remaining = budgeted - spent;

              return (
                <div key={i} className={`dash-budget-box ${isOver ? 'over-budget' : ''}`}>
                  <div className="dash-budget-box-top">
                    <div className="dash-budget-name-row">
                      <span className="cat-dot" style={{ background: b.color || 'var(--accent)' }} />
                      <span className="dash-budget-name">{b.name}</span>
                    </div>
                    <span className={`dash-budget-pct-badge ${isOver ? 'danger' : ''}`}>
                      {pct.toFixed(0)}%
                    </span>
                  </div>

                  <div className="progress-bar" style={{ height: 7, margin: '12px 0 10px' }}>
                    <div
                      className="progress-fill"
                      style={{
                        width: `${pct}%`,
                        background: isOver ? 'var(--red)' : b.color || 'var(--accent)',
                      }}
                    />
                  </div>

                  <div className="dash-budget-box-footer">
                    <span className="spent-val">{formatCurrency(spent)}</span>
                    <span className="budget-val">cap {formatCurrency(budgeted)}</span>
                  </div>

                  <div className={`dash-budget-subline ${isOver ? 'alert' : ''}`}>
                    {isOver ? (
                      <>⚠️ Exceeded limit by {formatCurrency(Math.abs(remaining))}</>
                    ) : (
                      <>{formatCurrency(remaining)} headroom remaining</>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Modals ── */}
      {showTxModal && (
        <TransactionModal
          onClose={() => setShowTxModal(false)}
          onSaved={() => {
            setShowTxModal(false);
            loadData();
          }}
        />
      )}

      {showBudgetModal && (
        <BudgetModal
          month={month}
          year={year}
          onClose={() => setShowBudgetModal(false)}
          onSaved={() => {
            setShowBudgetModal(false);
            loadData();
          }}
        />
      )}
    </Layout>
  );
};

export default Dashboard;