import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import api from '../utils/api';

const BudgetModal = ({ onClose, onSaved, month, year }) => {
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState({ category_id: '', name: '', amount: '' });
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.get('/categories', { params: { type: 'expense' } }).then(res => setCategories(res.data));
  }, []);

  const handleCategoryChange = (id) => {
    const cat = categories.find(c => c.id === parseInt(id));
    setForm({ ...form, category_id: id, name: cat ? cat.name : form.name });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!form.name || !form.amount) {
      setError('Name and amount are required');
      return;
    }

    setSaving(true);
    try {
      await api.post('/budgets', {
        ...form,
        category_id: form.category_id || null,
        month,
        year,
      });
      onSaved();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save budget');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title">Set Budget</div>
          <button className="modal-close" onClick={onClose}><X size={18} /></button>
        </div>

        {error && <div className="error-msg">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Category</label>
            <select value={form.category_id} onChange={(e) => handleCategoryChange(e.target.value)}>
              <option value="">Overall (no category)</option>
              {categories.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Budget name</label>
            <input
              type="text"
              placeholder="e.g. Groceries budget"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label>Monthly limit</label>
            <input
              type="number"
              step="0.01"
              min="0"
              placeholder="0.00"
              value={form.amount}
              onChange={(e) => setForm({ ...form, amount: e.target.value })}
              required
            />
          </div>

          <div className="modal-actions">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? 'Saving...' : 'Save budget'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BudgetModal;
