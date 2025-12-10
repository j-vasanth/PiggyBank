import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../../components/Layout';
import { Avatar } from '../../components/Avatar';
import { childrenService } from '../../services/children-service';
import { transactionsService } from '../../services/transactions-service';
import { Child, Transaction } from '../../types';
import './Transactions.css';

const Transactions: React.FC = () => {
  const navigate = useNavigate();
  const [children, setChildren] = useState<Child[]>([]);
  const [selectedChild, setSelectedChild] = useState<Child | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState<'all' | 'credit' | 'debit'>('all');

  useEffect(() => {
    loadChildren();
  }, []);

  useEffect(() => {
    if (selectedChild) {
      loadTransactions(selectedChild.id);
    }
  }, [selectedChild]);

  const loadChildren = async () => {
    try {
      setLoading(true);
      const data = await childrenService.getChildren();
      setChildren(data);
      if (data.length > 0) {
        setSelectedChild(data[0]);
      }
    } catch (err) {
      console.error('Failed to load children:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadTransactions = async (childId: string) => {
    try {
      const data = await transactionsService.getChildTransactions(childId, 100, 0);
      setTransactions(data);
    } catch (err) {
      console.error('Failed to load transactions:', err);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    // Append 'Z' if no timezone info to indicate UTC
    const utcString = dateString.includes('Z') || dateString.includes('+') ? dateString : dateString + 'Z';
    const date = new Date(utcString);
    return date.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const filteredTransactions = transactions.filter(t => {
    if (filterType === 'all') return true;
    return t.type === filterType;
  });

  if (loading) {
    return (
      <Layout title="Transactions">
        <div className="transactions-page">
          <div className="transactions-loading">Loading...</div>
        </div>
      </Layout>
    );
  }

  if (children.length === 0) {
    return (
      <Layout title="Transactions">
        <div className="transactions-page">
          <div className="transactions-empty">
            <p>No children added yet. Add a child to see transactions.</p>
            <div className="transactions-empty-btn" onClick={() => navigate('/parent/add-child')}>
              Add Child
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Transactions">
      <div className="transactions-page">
        {/* Child Tabs */}
        <div className="child-tabs">
          {children.map(child => (
            <div
              key={child.id}
              className={`child-tab ${selectedChild?.id === child.id ? 'child-tab--active' : ''}`}
              onClick={() => setSelectedChild(child)}
            >
              <Avatar avatar={child.avatar} size="sm" />
              <span className="child-tab__name">{child.name}</span>
            </div>
          ))}
        </div>

        {selectedChild && (
          <>
            {/* Child Header */}
            <div className="child-header">
              <Avatar avatar={selectedChild.avatar} size="xl" className="child-header__avatar" />
              <div className="child-header__info">
                <h2 className="child-header__name">{selectedChild.name}'s Piggy Bank</h2>
                <span className="child-header__label">Current Balance</span>
                <span className="child-header__balance">{formatCurrency(selectedChild.balance)}</span>
              </div>
              <div className="child-header__actions">
                <div
                  className="child-header__btn child-header__btn--deposit"
                  onClick={() => navigate(`/parent/child/${selectedChild.id}/deposit`)}
                >
                  + Deposit
                </div>
                <div
                  className="child-header__btn child-header__btn--deduct"
                  onClick={() => navigate(`/parent/child/${selectedChild.id}/deduct`)}
                >
                  − Deduct
                </div>
              </div>
            </div>

            {/* Filters */}
            <div className="transactions-filters">
              <div className="filter-group">
                <label className="filter-label">Filter by Type</label>
                <select
                  className="filter-select"
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value as any)}
                >
                  <option value="all">All Transactions</option>
                  <option value="credit">Deposits Only</option>
                  <option value="debit">Deductions Only</option>
                </select>
              </div>
            </div>

            {/* Transaction List */}
            <div className="transaction-list">
              <div className="transaction-list__header">
                <h3 className="transaction-list__title">Transaction History</h3>
                <span className="transaction-list__count">{filteredTransactions.length} transactions</span>
              </div>

              {filteredTransactions.length === 0 ? (
                <div className="transaction-list__empty">
                  No transactions yet
                </div>
              ) : (
                filteredTransactions.map(transaction => (
                  <div key={transaction.id} className="transaction-item">
                    <div className={`transaction-item__icon ${transaction.type === 'credit' ? 'transaction-item__icon--deposit' : 'transaction-item__icon--deduct'}`}>
                      {transaction.type === 'credit' ? '💰' : '📤'}
                    </div>
                    <div className="transaction-item__details">
                      <span className="transaction-item__reason">
                        {transaction.description || (transaction.type === 'credit' ? 'Deposit' : 'Deduction')}
                      </span>
                      <span className="transaction-item__meta">
                        {formatDate(transaction.created_at)}
                      </span>
                    </div>
                    <div className="transaction-item__amount">
                      <span className={`transaction-item__value ${transaction.type === 'credit' ? 'transaction-item__value--deposit' : 'transaction-item__value--deduct'}`}>
                        {transaction.type === 'credit' ? '+' : '-'}{formatCurrency(Number(transaction.amount))}
                      </span>
                      <span className="transaction-item__balance">
                        Balance: {formatCurrency(Number(transaction.balance_after))}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </>
        )}
      </div>
    </Layout>
  );
};

export default Transactions;
