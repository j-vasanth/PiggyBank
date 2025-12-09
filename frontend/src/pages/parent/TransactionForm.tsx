import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Layout from '../../components/Layout';
import { childrenService } from '../../services/children-service';
import { transactionsService } from '../../services/transactions-service';
import { Child } from '../../types';
import './TransactionForm.css';

interface TransactionFormProps {
  type: 'deposit' | 'deduct';
}

const TransactionForm: React.FC<TransactionFormProps> = ({ type }) => {
  const navigate = useNavigate();
  const { childId } = useParams<{ childId: string }>();
  const [child, setChild] = useState<Child | null>(null);
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const isDeposit = type === 'deposit';
  const title = isDeposit ? 'Deposit' : 'Deduct';

  useEffect(() => {
    loadChild();
  }, [childId]);

  const loadChild = async () => {
    if (!childId) return;
    try {
      setLoading(true);
      const data = await childrenService.getChild(childId);
      setChild(data);
    } catch (err) {
      setError('Failed to load child information');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(value);
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Allow only numbers and one decimal point
    if (/^\d*\.?\d{0,2}$/.test(value) || value === '') {
      setAmount(value);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!childId || !amount) return;

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    // Check if deduction would result in negative balance
    if (!isDeposit && child && numAmount > child.balance) {
      setError('Insufficient balance for this deduction');
      return;
    }

    try {
      setSubmitting(true);
      setError('');

      await transactionsService.createTransaction({
        child_id: childId,
        type: isDeposit ? 'credit' : 'debit',
        amount: numAmount,
        description: description || undefined,
      });

      navigate('/parent/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to process transaction');
    } finally {
      setSubmitting(false);
    }
  };

  const quickAmounts = [5, 10, 20, 50];

  if (loading) {
    return (
      <Layout title={title} showBack>
        <div className="transaction-form">
          <div className="transaction-form__loading">Loading...</div>
        </div>
      </Layout>
    );
  }

  if (!child) {
    return (
      <Layout title={title} showBack>
        <div className="transaction-form">
          <div className="transaction-form__error">Child not found</div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title={title} showBack>
      <div className="transaction-form">
        {/* Child Info */}
        <div className="transaction-form__child">
          <div className="transaction-form__avatar">{child.avatar || '👤'}</div>
          <div className="transaction-form__child-info">
            <h3>{child.name}</h3>
            <p>Current Balance: {formatCurrency(child.balance)}</p>
          </div>
        </div>

        {error && <div className="transaction-form__error-msg">{error}</div>}

        <form onSubmit={handleSubmit}>
          {/* Amount Input */}
          <div className="transaction-form__amount-section">
            <label className="transaction-form__label">Amount</label>
            <div className="transaction-form__amount-input">
              <span className="transaction-form__currency">$</span>
              <input
                type="text"
                inputMode="decimal"
                value={amount}
                onChange={handleAmountChange}
                placeholder="0.00"
                className="transaction-form__input"
                autoFocus
              />
            </div>
          </div>

          {/* Quick Amount Buttons */}
          <div className="transaction-form__quick-amounts">
            {quickAmounts.map((quickAmount) => (
              <div
                key={quickAmount}
                className={`transaction-form__quick-btn ${amount === String(quickAmount) ? 'transaction-form__quick-btn--active' : ''}`}
                onClick={() => setAmount(String(quickAmount))}
              >
                ${quickAmount}
              </div>
            ))}
          </div>

          {/* Description */}
          <div className="transaction-form__field">
            <label className="transaction-form__label">Description (optional)</label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={isDeposit ? 'e.g., Allowance, Birthday gift' : 'e.g., Toy purchase, Snacks'}
              className="transaction-form__text-input"
              maxLength={100}
            />
          </div>

          {/* Preview */}
          {amount && parseFloat(amount) > 0 && (
            <div className="transaction-form__preview">
              <span>New Balance:</span>
              <span className={`transaction-form__preview-amount ${isDeposit ? 'transaction-form__preview-amount--positive' : 'transaction-form__preview-amount--negative'}`}>
                {formatCurrency(
                  isDeposit
                    ? child.balance + parseFloat(amount)
                    : child.balance - parseFloat(amount)
                )}
              </span>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            className={`transaction-form__submit ${isDeposit ? 'transaction-form__submit--deposit' : 'transaction-form__submit--deduct'}`}
            disabled={submitting || !amount || parseFloat(amount) <= 0}
          >
            {submitting ? 'Processing...' : `${title} ${amount ? formatCurrency(parseFloat(amount)) : ''}`}
          </button>
        </form>
      </div>
    </Layout>
  );
};

export default TransactionForm;
