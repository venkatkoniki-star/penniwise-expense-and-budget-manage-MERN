import React, { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2 } from 'lucide-react';
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

      let url = `${API}/transactions?limit=100`;
      if (activeType) url += `&type=${activeType}`;
      if (activeCat) url += `&category_id=${activeCat}`;

      const res = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTransactions(res.data);
    } catch (err) {
      console.log(err);
    }
    setLoading(false);
  };

  const loadCategories = async () => {
    try {
      const res = await axios.get(`${API}/categories`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCategories(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this transaction?')) return;
    try {
      await axios.delete(`${API}/transactions/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      loadTransactions();
    } catch (err) {
      console.log(err);
    }
  };

  const handleFilter = () => {
    loadTransactions();
  };

  const handleClear = () => {
    setTypeFilter('');
    setCategoryFilter('');
    loadTransactions('', '');
  };

  let totalIncome = 0;
  let totalExpense = 0;

  for (let i = 0; i < transactions.length; i++) {
    if (transactions[i].type === 'income') {
      totalIncome += parseFloat(transactions[i].amount) || 0;
    } else {
      totalExpense += parseFloat(transactions[i].amount) || 0;
    }
  }

  return (
    <Layout>
      <div className="page-header">
        <div>
          <div className="page-title">Transactions</div>
          <div className="page-subtitle">Tactical ledger &amp; execution history</div>
        </div>
        <button className="btn btn-primary" onClick={() => { setEditing(null); setShowModal(true); }}>
          <Plus size={15} /> Add transaction
        </button>
      </div>

      {transactions.length > 0 && (
        <div className="tx-stats-grid">
          <div style={{ padding: '12px 18px', background: 'var(--green-light)', borderRadius: 10, border: '1px solid var(--green-border)' }}>
            <div style={{ fontSize: '0.68rem', color: 'var(--green)', fontWeight: 600, textTransform: 'uppercase', fontFamily: 'var(--font-mono)', letterSpacing: '0.08em' }}>Total Inflow</div>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--green)', fontFamily: 'var(--font-mono)', marginTop: 2 }}>{formatCurrency(totalIncome)}</div>
          </div>
          <div style={{ padding: '12px 18px', background: 'var(--red-light)', borderRadius: 10, border: '1px solid var(--red-border)' }}>
            <div style={{ fontSize: '0.68rem', color: 'var(--red)', fontWeight: 600, textTransform: 'uppercase', fontFamily: 'var(--font-mono)', letterSpacing: '0.08em' }}>Total Outflow</div>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--red)', fontFamily: 'var(--font-mono)', marginTop: 2 }}>{formatCurrency(totalExpense)}</div>
          </div>
        </div>
      )}

      <div className="filters-bar">
        <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)}>
          <option value="">All transaction types</option>
          <option value="income">Income (+)</option>
          <option value="expense">Expense (-)</option>
        </select>
        <select value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)}>
          <option value="">All categories</option>
          {categories.map(c => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
        <button className="btn btn-primary btn-sm" onClick={handleFilter}>Filter</button>
        <button className="btn btn-secondary btn-sm" onClick={handleClear}>Clear</button>
      </div>

      <div className="card">
        {loading ? (
          <div className="loading">Loading transactions...</div>
        ) : transactions.length === 0 ? (
          <div className="empty-state"><p>No transactions match your criteria.</p></div>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Description</th>
                  <th>Category</th>
                  <th>Type</th>
                  <th>Amount</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map(t => (
                  <tr key={t.id}>
                    <td style={{ color: 'var(--text-muted)', fontSize: '0.8rem', fontFamily: 'var(--font-mono)' }}>
                      {new Date(t.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </td>
                    <td style={{ fontWeight: 500 }}>{t.description || '—'}</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                        <span className="cat-dot" style={{ background: t.category_color || '#9B9A94' }} />
                        <span>{t.category_name || 'Uncategorized'}</span>
                      </div>
                    </td>
                    <td>
                      <span className={`badge ${t.type === 'income' ? 'badge-income' : 'badge-expense'}`}>
                        {t.type}
                      </span>
                    </td>
                    <td className={t.type === 'income' ? 'amount-income' : 'amount-expense'}>
                      {formatCurrencyWithSign(t.amount, t.type)}
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button className="btn btn-secondary btn-icon btn-sm" title="Edit" onClick={() => { setEditing(t); setShowModal(true); }}>
                          <Pencil size={13} />
                        </button>
                        <button className="btn btn-danger btn-icon btn-sm" title="Delete" onClick={() => handleDelete(t.id)}>
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

      {showModal && (
        <TransactionModal
          editing={editing}
          onClose={() => { setShowModal(false); setEditing(null); }}
          onSaved={() => { setShowModal(false); setEditing(null); loadTransactions(); }}
        />
      )}
    </Layout>
  );
};

export default Transactions;