import React, { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import axios from 'axios';
import Layout from '../components/Layout';
import TransactionModal from '../components/TransactionModal';

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

  const loadTransactions = async () => {
    setLoading(true);
    try {
      let url = `${API}/transactions?limit=100`;
      if (typeFilter) url = url + '&type=' + typeFilter;
      if (categoryFilter) url = url + '&category_id=' + categoryFilter;

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
    loadTransactions();
  };

  let totalIncome = 0;
  let totalExpense = 0;

  for (let i = 0; i < transactions.length; i++) {
    if (transactions[i].type === 'income') {
      totalIncome = totalIncome + parseFloat(transactions[i].amount);
    } else {
      totalExpense = totalExpense + parseFloat(transactions[i].amount);
    }
  }

  return (
    <Layout>
      <div className="page-header">
        <div>
          <div className="page-title">Transactions</div>
          <div className="page-subtitle">Every entry, all in one place</div>
        </div>
        <button className="btn btn-primary" onClick={() => { setEditing(null); setShowModal(true); }}>
          <Plus size={15} /> Add transaction
        </button>
      </div>

      {transactions.length > 0 && (
        <div style={{ display: 'flex', gap: 10, marginBottom: 18 }}>
          <div style={{ padding: '10px 16px', background: 'var(--green-light)', borderRadius: 8, border: '1px solid #b7e4cc' }}>
            <div style={{ fontSize: '0.7rem', color: 'var(--green)', fontWeight: 600, textTransform: 'uppercase' }}>Total income</div>
            <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--green)' }}>${totalIncome.toFixed(2)}</div>
          </div>
          <div style={{ padding: '10px 16px', background: 'var(--red-light)', borderRadius: 8, border: '1px solid #fca5a5' }}>
            <div style={{ fontSize: '0.7rem', color: 'var(--red)', fontWeight: 600, textTransform: 'uppercase' }}>Total expenses</div>
            <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--red)' }}>${totalExpense.toFixed(2)}</div>
          </div>
        </div>
      )}

      <div className="filters-bar">
        <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)}>
          <option value="">All types</option>
          <option value="income">Income</option>
          <option value="expense">Expense</option>
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
          <div className="loading">Loading...</div>
        ) : transactions.length === 0 ? (
          <div className="empty-state"><p>No transactions found.</p></div>
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
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {transactions.map(t => (
                  <tr key={t.id}>
                    <td style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                      {new Date(t.date).toLocaleDateString()}
                    </td>
                    <td style={{ fontWeight: 500 }}>{t.description || '—'}</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                        <span className="cat-dot" style={{ background: t.category_color || '#9B9A94' }} />
                        {t.category_name || 'Uncategorized'}
                      </div>
                    </td>
                    <td>
                      <span className={`badge ${t.type === 'income' ? 'badge-income' : 'badge-expense'}`}>
                        {t.type}
                      </span>
                    </td>
                    <td className={t.type === 'income' ? 'amount-income' : 'amount-expense'}>
                      {t.type === 'income' ? '+' : '-'}${parseFloat(t.amount).toFixed(2)}
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: 4 }}>
                        <button className="btn btn-secondary btn-icon btn-sm" onClick={() => { setEditing(t); setShowModal(true); }}>
                          <Pencil size={13} />
                        </button>
                        <button className="btn btn-danger btn-icon btn-sm" onClick={() => handleDelete(t.id)}>
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