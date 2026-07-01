import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import api from '../utils/api';
import Layout from '../components/Layout';
import TransactionModal from '../components/TransactionModal';

const Transactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [filters, setFilters] = useState({ type: '', category_id: '' });

  const load = useCallback(async () => {
    setLoading(true);
    const params = {};
    if (filters.type) params.type = filters.type;
    if (filters.category_id) params.category_id = filters.category_id;
    const [txRes, catRes] = await Promise.all([
      api.get('/transactions', { params: { ...params, limit: 100 } }),
      api.get('/categories'),
    ]);
    setTransactions(txRes.data);
    setCategories(catRes.data);
    setLoading(false);
  }, [filters]);

  useEffect(() => { load(); }, [load]);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this transaction?')) return;
    await api.delete(`/transactions/${id}`);
    load();
  };

  const handleEdit = (t) => {
    setEditing(t);
    setShowModal(true);
  };

  return (
    <Layout>
      <div className="page-header">
        <div>
          <div className="page-title">Transactions</div>
          <div className="page-subtitle">All your income and expenses in one place</div>
        </div>
        <button className="btn btn-primary" onClick={() => { setEditing(null); setShowModal(true); }}>
          <Plus size={16} /> Add transaction
        </button>
      </div>

      <div className="filters-bar">
        <select value={filters.type} onChange={(e) => setFilters({ ...filters, type: e.target.value })}>
          <option value="">All types</option>
          <option value="income">Income</option>
          <option value="expense">Expense</option>
        </select>
        <select value={filters.category_id} onChange={(e) => setFilters({ ...filters, category_id: e.target.value })}>
          <option value="">All categories</option>
          {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      </div>

      <div className="card">
        {loading ? (
          <div className="loading">Loading transactions...</div>
        ) : transactions.length === 0 ? (
          <div className="empty-state"><p>No transactions found. Add your first one to get started.</p></div>
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
                    <td>{new Date(t.date).toLocaleDateString()}</td>
                    <td>{t.description || '—'}</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span className="cat-dot" style={{ background: t.category_color || '#6B7280' }} />
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
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button className="btn btn-secondary btn-icon" onClick={() => handleEdit(t)}>
                          <Pencil size={14} />
                        </button>
                        <button className="btn btn-danger btn-icon" onClick={() => handleDelete(t.id)}>
                          <Trash2 size={14} />
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
          onSaved={() => { setShowModal(false); setEditing(null); load(); }}
        />
      )}
    </Layout>
  );
};

export default Transactions;
