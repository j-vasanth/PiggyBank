import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { Avatar } from '../../components/Avatar';
import { transactionsService } from '../../services/transactions-service';
import { Transaction } from '../../types';
import './ChildDashboard.css';

const ChildDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTransactions();
  }, []);

  const loadTransactions = async () => {
    if (!user?.id) return;
    try {
      setLoading(true);
      const data = await transactionsService.getChildTransactions(user.id, 10, 0);
      setTransactions(data);
    } catch (err) {
      console.error('Failed to load transactions:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return `Today at ${date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}`;
    } else if (diffDays === 1) {
      return `Yesterday`;
    } else if (diffDays < 7) {
      return `${diffDays} days ago`;
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
  };

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to logout?')) {
      logout();
      navigate('/child/login');
    }
  };

  const getTransactionIcon = (type: string, description: string | null) => {
    if (type === 'credit') {
      if (description?.toLowerCase().includes('birthday')) return '🎂';
      if (description?.toLowerCase().includes('allowance')) return '💵';
      if (description?.toLowerCase().includes('chore')) return '⭐';
      return '💰';
    } else {
      if (description?.toLowerCase().includes('toy')) return '🧸';
      if (description?.toLowerCase().includes('game')) return '🎮';
      if (description?.toLowerCase().includes('book')) return '📚';
      if (description?.toLowerCase().includes('snack') || description?.toLowerCase().includes('food')) return '🍕';
      return '🛒';
    }
  };

  return (
    <div className="child-dashboard child-theme">
      {/* Header */}
      <header className="child-dashboard__header">
        <div className="child-dashboard__header-content">
          <div className="child-dashboard__user-info">
            <Avatar avatar={user?.avatar || null} size="lg" className="child-dashboard__avatar" />
            <div className="child-dashboard__greeting">
              <h1>Hi, {user?.name?.split(' ')[0] || 'there'}!</h1>
              <p>Here's your piggy bank</p>
            </div>
          </div>
          <button className="child-dashboard__logout-btn" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="child-dashboard__main">
        {/* Balance Card */}
        <div className="balance-card animate-scale-in">
          <div className="balance-card__decoration">💰</div>
          <span className="balance-card__label">My Balance</span>
          <span className="balance-card__amount">{formatCurrency(user?.balance || 0)}</span>
          <span className="balance-card__subtext">Keep saving for your goals! 🎯</span>
        </div>

        {/* Recent Transactions */}
        <section className="transactions-section animate-slide-up">
          <div className="transactions-section__header">
            <h2 className="transactions-section__title">Recent Transactions</h2>
          </div>

          {loading ? (
            <div className="transactions-loading">
              <div className="transactions-loading__spinner" />
              <span>Loading your transactions...</span>
            </div>
          ) : transactions.length === 0 ? (
            <div className="transactions-empty">
              <span className="transactions-empty__icon">📭</span>
              <h3>No Transactions Yet</h3>
              <p>Your transaction history will appear here once you start earning and spending money.</p>
            </div>
          ) : (
            <div className="transactions-list">
              {transactions.map((transaction) => (
                <div key={transaction.id} className="transaction-item">
                  <div className="transaction-item__info">
                    <div className={`transaction-item__icon transaction-item__icon--${transaction.type}`}>
                      {getTransactionIcon(transaction.type, transaction.description)}
                    </div>
                    <div className="transaction-item__details">
                      <span className="transaction-item__type">
                        {transaction.description || (transaction.type === 'credit' ? 'Deposit' : 'Spent')}
                      </span>
                      <span className="transaction-item__date">
                        {formatDate(transaction.created_at)}
                      </span>
                    </div>
                  </div>
                  <span className={`transaction-item__amount transaction-item__amount--${transaction.type}`}>
                    {transaction.type === 'credit' ? '+' : '-'}{formatCurrency(Number(transaction.amount))}
                  </span>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
};

export default ChildDashboard;
