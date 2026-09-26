import React, { useState, useEffect, useMemo } from 'react';
import {
  Plus,
  Pencil,
  Trash2,
  Search,
  Filter,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
  Wallet,
  Calendar,
  Layers,
  CheckCircle,
  X,
} from 'lucide-react';
import axios from 'axios';
import Layout from '../components/Layout';
import TransactionModal from '../components/TransactionModal';
import { formatCurrency, formatCurrencyWithSign } from '../utils/format';

const API = process.env.REACT_APP_API_URL;

const Transactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [typeFilter, setTypeFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const token = localStorage.getItem('token');

  useEffect(() => {
    loadTransactions();
    loadCategories();
  }, []);

  const loadTransactions = async (overrideType, overrideCategory) => {
    setLoading(true);
    try {
      const activeType = overrideType !== undefined ? overrideType : typeFilter;
      const activeCat = overrideCategory !== undefined ? overrideCategory : categoryFilter;

      let url = `${API}/transactions?limit=250`;
      if (activeType) url += `&type=${activeType}`;
      if (activeCat) url += `&category_id=${activeCat}`;

      const res = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTransactions(res.data);
    } catch (err) {
      console.log('Error loading transactions:', err);
    }
    setLoading(false);
  };

  const loadCategories = async () => {
    try {
      const res = await axios.get(`${API}/categories`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCategories(res.data);
    } catch (err) {
      console.log('Error loading categories:', err);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this transaction permanently?')) return;
    try {
      await axios.delete(`${API}/transactions/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      loadTransactions();
    } catch (err) {
      console.log('Error deleting transaction:', err);
    }
  };

  const handleTypeSelect = (newType) => {
    const next = typeFilter === newType ? '' : newType;
    setTypeFilter(next);
    loadTransactions(next, categoryFilter);
  };

  const handleCategorySelect = (e) => {
    const cat = e.target.value;
    setCategoryFilter(cat);
    loadTransactions(typeFilter, cat);
  };

  const handleClearFilters = () => {
    setTypeFilter('');
    setCategoryFilter('');
    setSearchQuery('');
    loadTransactions('', '');
  };

  // Client-side search filtering
  const filteredTransactions = useMemo(() => {
    if (!searchQuery.trim()) return transactions;
    const q = searchQuery.toLowerCase();
    return transactions.filter(
      (t) =>
        (t.description && t.description.toLowerCase().includes(q)) ||
        (t.category_name && t.category_name.toLowerCase().includes(q)) ||
        t.amount.toString().includes(q)
    );
  }, [transactions, searchQuery]);

  // Telemetry Calculations
  const { totalInflow, totalOutflow } = useMemo(() => {
    let inflow = 0;
    let outflow = 0;
    for (let i = 0; i < filteredTransactions.length; i++) {
      const amt = parseFloat(filteredTransactions[i].amount) || 0;
      if (filteredTransactions[i].type === 'income') {
        inflow += amt;
      } else {
        outflow += amt;
      }
    }
    return { totalInflow: inflow, totalOutflow: outflow };
  }, [filteredTransactions]);

  const netVelocity = totalInflow - totalOutflow;

  return (
    <Layout>
      {/* ── Page Header ── */}
      <div className="page-header">
        <div>
          <div className="page-title">Transaction Ledger</div>
          <div className="page-subtitle">Real-time execution log &amp; multi-category financial audit</div>
        </div>
        <button
          type="button"
          className="btn btn-primary"
          onClick={() => {
            setEditing(null);
            setShowModal(true);
          }}
          style={{ gap: 7, borderRadius: 10 }}
        >
          <Plus size={16} />
          <span>New Transaction</span>
        </button>
      </div>

      {/* ── Telemetry Stats Ribbon ── */}
      <div className="tx-summary-ribbon">
        <div className="tx-summary-card">
          <div className="tx-summary-label">
            <span className="tx-indicator income" /> Total Inflow
          </div>
          <div className="tx-summary-value income">{formatCurrency(totalInflow)}</div>
          <div className="tx-summary-sub">verified capital inflows</div>
        </div>

        <div className="tx-summary-card">
          <div className="tx-summary-label">
            <span className="tx-indicator expense" /> Total Outflow
          </div>
          <div className="tx-summary-value expense">{formatCurrency(totalOutflow)}</div>
          <div className="tx-summary-sub">expenditures &amp; deductions</div>
        </div>

        <div className="tx-summary-card">
          <div className="tx-summary-label">
            <span className="tx-indicator neutral" /> Net Ledger Balance
          </div>
          <div className={`tx-summary-value ${netVelocity >= 0 ? 'positive' : 'negative'}`}>
            {netVelocity < 0 ? '-' : ''}{formatCurrency(Math.abs(netVelocity))}
          </div>
          <div className="tx-summary-sub">inflow minus outflow</div>
        </div>

        <div className="tx-summary-card">
          <div className="tx-summary-label">Record Count</div>
          <div className="tx-summary-value" style={{ color: 'var(--text-primary)' }}>
            {filteredTransactions.length}
          </div>
          <div className="tx-summary-sub">transactions listed</div>
        </div>
      </div>

      {/* ── Interactive Filters Command Bar ── */}
      <div className="tx-command-bar">
        {/* Search Input */}
        <div className="tx-search-box">
          <Search size={15} className="tx-search-icon" />
          <input
            type="text"
            placeholder="Search by description, merchant, or amount..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button type="button" className="tx-search-clear" onClick={() => setSearchQuery('')}>
              <X size={13} />
            </button>
          )}
        </div>

        {/* Type Toggle Tabs */}
        <div className="tx-type-tabs">
          <button
            type="button"
            className={`tx-type-tab ${typeFilter === '' ? 'active' : ''}`}
            onClick={() => handleTypeSelect('')}
          >
            All Types
          </button>
          <button
            type="button"
            className={`tx-type-tab income ${typeFilter === 'income' ? 'active' : ''}`}
            onClick={() => handleTypeSelect('income')}
          >
            <ArrowUpRight size={13} /> Income
          </button>
          <button
            type="button"
            className={`tx-type-tab expense ${typeFilter === 'expense' ? 'active' : ''}`}
            onClick={() => handleTypeSelect('expense')}
          >
            <ArrowDownRight size={13} /> Expense
          </button>
        </div>

        {/* Category Dropdown */}
        <div className="tx-cat-dropdown-wrap">
          <select value={categoryFilter} onChange={handleCategorySelect} className="tx-category-select">
            <option value="">All Categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        {/* Clear Filters */}
        {(typeFilter || categoryFilter || searchQuery) && (
          <button type="button" className="btn btn-secondary btn-sm" onClick={handleClearFilters} style={{ borderRadius: 8 }}>
            Clear Filters
          </button>
        )}
      </div>

      {/* ── Transaction Table Card ── */}
      <div className="card tx-ledger-card">
        {loading ? (
          <div className="dashboard-loading-container" style={{ padding: '40px 0' }}>
            <div className="telemetry-spinner" />
            <div className="telemetry-loading-text">SYNCING LEDGER TELEMETRY...</div>
          </div>
        ) : filteredTransactions.length === 0 ? (
          <div className="empty-state" style={{ padding: '50px 20px' }}>
            <Wallet size={36} color="var(--text-muted)" />
            <h3 style={{ marginTop: 12 }}>No Transactions Found</h3>
            <p style={{ maxWidth: 400, margin: '6px auto 16px' }}>
              {searchQuery || typeFilter || categoryFilter
                ? 'No records match your active search or filter criteria. Try resetting the filters.'
                : 'Your ledger is clean. Record your first income or expense to begin tracking capital flow.'}
            </p>
            {searchQuery || typeFilter || categoryFilter ? (
              <button type="button" className="btn btn-secondary" onClick={handleClearFilters}>
                Reset Filters
              </button>
            ) : (
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => {
                  setEditing(null);
                  setShowModal(true);
                }}
              >
                <Plus size={15} /> Add First Transaction
              </button>
            )}
          </div>
        ) : (
          <div className="table-wrapper">
            <table className="tx-table">
              <thead>
                <tr>
                  <th style={{ width: '13%' }}>Date</th>
                  <th style={{ width: '33%' }}>Description / Merchant</th>
                  <th style={{ width: '20%' }}>Category</th>
                  <th style={{ width: '12%' }}>Type</th>
                  <th style={{ width: '14%', textAlign: 'right' }}>Amount</th>
                  <th style={{ width: '8%', textAlign: 'center' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredTransactions.map((t) => (
                  <tr key={t.id} className="tx-table-row">
                    {/* Date */}
                    <td>
                      <div className="tx-date-cell">
                        <span className="tx-date-main">
                          {new Date(t.date).toLocaleDateString('en-IN', {
                            day: '2-digit',
                            month: 'short',
                          })}
                        </span>
                        <span className="tx-date-year">{new Date(t.date).getFullYear()}</span>
                      </div>
                    </td>

                    {/* Description */}
                    <td>
                      <div className="tx-desc-cell">
                        <div className={`tx-type-avatar ${t.type}`}>
                          {t.type === 'income' ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                        </div>
                        <span className="tx-desc-text">{t.description || 'General Transaction'}</span>
                      </div>
                    </td>

                    {/* Category */}
                    <td>
                      <div className="tx-cat-badge" style={{ borderColor: t.category_color ? `${t.category_color}40` : 'var(--border)' }}>
                        <span className="cat-dot" style={{ background: t.category_color || 'var(--accent)' }} />
                        <span>{t.category_name || 'Uncategorized'}</span>
                      </div>
                    </td>

                    {/* Type Badge */}
                    <td>
                      <span className={`badge ${t.type === 'income' ? 'badge-income' : 'badge-expense'}`}>
                        {t.type === 'income' ? '+ Income' : '- Expense'}
                      </span>
                    </td>

                    {/* Amount */}
                    <td style={{ textAlign: 'right' }}>
                      <span className={`tx-amount-value ${t.type}`}>
                        {formatCurrencyWithSign(t.amount, t.type)}
                      </span>
                    </td>

                    {/* Actions */}
                    <td>
                      <div className="tx-action-buttons">
                        <button
                          type="button"
                          className="btn btn-secondary btn-icon btn-sm"
                          title="Edit transaction"
                          onClick={() => {
                            setEditing(t);
                            setShowModal(true);
                          }}
                        >
                          <Pencil size={13} />
                        </button>
                        <button
                          type="button"
                          className="btn btn-danger btn-icon btn-sm"
                          title="Delete transaction"
                          onClick={() => handleDelete(t.id)}
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── Transaction Modal ── */}
      {showModal && (
        <TransactionModal
          editing={editing}
          onClose={() => {
            setShowModal(false);
            setEditing(null);
          }}
          onSaved={() => {
            setShowModal(false);
            setEditing(null);
            loadTransactions();
          }}
        />
      )}
    </Layout>
  );
};

export default Transactions;