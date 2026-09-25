import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import axios from 'axios';

const API = process.env.REACT_APP_API_URL;

const TransactionModal = ({ onClose, onSaved, editing }) => {
  const [type, setType] = useState(editing?.type || 'expense');
  const [categories, setCategories] = useState([]);
  const [amount, setAmount] = useState(editing?.amount || '');
  const [date, setDate] = useState(editing?.date ? editing.date.slice(0, 10) : new Date().toISOString().slice(0, 10));
  const [categoryId, setCategoryId] = useState(editing?.category_id || '');
  const [description, setDescription] = useState(editing?.description || '');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const token = localStorage.getItem('token');

  useEffect(() => {
    loadCategories();
  }, [type]);

  const loadCategories = async () => {
    try {
      const res = await axios.get(`${API}/categories?type=${type}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCategories(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!amount || !date) {
      setError('Amount and date are required');
      return;
    }

    setSaving(true);

    try {
      const payload = {
        type: type,
        amount: amount,
        date: date,
        category_id: categoryId || null,
        description: description
      };

      if (editing) {
        await axios.put(`${API}/transactions/${editing.id}`, payload, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } else {
        await axios.post(`${API}/transactions`, payload, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }

      onSaved();
    } catch (err) {
      console.log(err);
      setError(err.response?.data?.message || 'Failed to save transaction');
    }

    setSaving(false);
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title">{editing ? 'Edit Transaction' : 'Add Transaction'}</div>
          <button className="modal-close" onClick={onClose}><X size={18} /></button>
        </div>

        {error && <div className="error-msg">{error}</div>}

        <div className="type-toggle">
          <button
            type="button"
            className={`type-btn expense ${type === 'expense' ? 'active' : ''}`}
            onClick={() => setType('expense')}
          >
            Expense
          </button>
          <button
            type="button"
            className={`type-btn income ${type === 'income' ? 'active' : ''}`}
            onClick={() => setType('income')}
          >
            Income
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label>Amount</label>
              <input
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label>Date</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label>Category</label>
            <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
              <option value="">Uncategorized</option>
              {categories.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Description</label>
            <input
              type="text"
              placeholder="e.g. Groceries at DMart"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="modal-actions">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? 'Saving...' : editing ? 'Save changes' : 'Add transaction'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TransactionModal;