import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import axios from 'axios';

const API = process.env.REACT_APP_API_URL;

const BudgetModal = ({ onClose, onSaved, month, year }) => {
  const [categories, setCategories] = useState([]);
  const [categoryId, setCategoryId] = useState('');
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const token = localStorage.getItem('token');

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const res = await axios.get(`${API}/categories?type=expense`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCategories(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  const handleCategoryChange = (id) => {
    setCategoryId(id);
    const cat = categories.find(c => String(c.id) === String(id));
    if (cat) {
      setName(cat.name);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!name || !amount) {
      setError('Name and amount are required');
      return;
    }

    setSaving(true);

    try {
      await axios.post(`${API}/budgets`, {
        category_id: categoryId || null,
        name: name,
        amount: amount,
        month: month,
        year: year
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      onSaved();
    } catch (err) {
      console.log(err);
      setError(err.response?.data?.message || 'Failed to save budget');
    }

    setSaving(false);
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
            <select value={categoryId} onChange={(e) => handleCategoryChange(e.target.value)}>
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
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label>Monthly limit (₹)</label>
            <input
              type="number"
              step="0.01"
              min="0"
              placeholder="₹ 0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
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