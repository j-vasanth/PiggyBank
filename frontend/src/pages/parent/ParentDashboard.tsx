import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { childrenService } from '../../services/children-service';
import { transactionsService } from '../../services/transactions-service';
import { Child, Transaction } from '../../types';
import Layout from '../../components/Layout';
import { Avatar } from '../../components/Avatar';
import './ParentDashboard.css';

interface ChildStats {
  earned: number;
  transactionCount: number;
}

const ParentDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [children, setChildren] = useState<Child[]>([]);
  const [childStats, setChildStats] = useState<Record<string, ChildStats>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [childrenData, transactions] = await Promise.all([
        childrenService.getChildren(),
        transactionsService.getFamilyTransactions(100, 0)
      ]);
      setChildren(childrenData);

      // Calculate stats per child
      const stats: Record<string, ChildStats> = {};
      childrenData.forEach(child => {
        const childTransactions = transactions.filter(t => t.child_id === child.id);
        const earned = childTransactions
          .filter(t => t.type === 'credit')
          .reduce((sum, t) => sum + Number(t.amount), 0);
        stats[child.id] = {
          earned,
          transactionCount: childTransactions.length
        };
      });
      setChildStats(stats);
    } catch (err: any) {
      setError('Failed to load children');
      console.error(err);
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

  return (
    <Layout title="Dashboard">
      <div className="dashboard">
        {error && (
          <div className="alert alert-danger animate-scale-in">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" y1="8" x2="12" y2="12"/>
              <line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
            {error}
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="dashboard__loading">
            <div className="dashboard__loading-grid">
              {[1, 2, 3].map((i) => (
                <div key={i} className="child-card child-card--skeleton">
                  <div className="skeleton skeleton--avatar" />
                  <div className="skeleton skeleton--text skeleton--text-lg" />
                  <div className="skeleton skeleton--text" />
                  <div className="skeleton skeleton--text skeleton--text-sm" />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {!loading && children.length === 0 && (
          <div className="dashboard__empty animate-scale-in">
            <div className="dashboard__empty-icon">
              <span>👶</span>
            </div>
            <h3 className="dashboard__empty-title">No Children Added Yet</h3>
            <p className="dashboard__empty-text">
              Get started by adding your first child's account to begin tracking their savings
            </p>
            <button
              className="btn btn-primary btn-lg"
              onClick={() => navigate('/parent/add-child')}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="12" y1="5" x2="12" y2="19"/>
                <line x1="5" y1="12" x2="19" y2="12"/>
              </svg>
              Add Your First Child
            </button>
          </div>
        )}

        {/* Children Grid */}
        {!loading && children.length > 0 && (
          <section className="dashboard__children">
            <div className="dashboard__section-header">
              <h3 className="dashboard__section-title">Your Children</h3>
              <span className="dashboard__section-count">{children.length} account{children.length !== 1 ? 's' : ''}</span>
            </div>

            <div className="children-grid">
              {children.map((child, index) => (
                <article
                  key={child.id}
                  className={`child-card animate-slide-up delay-${index + 1}`}
                  onClick={() => navigate(`/parent/child/${child.id}`)}
                >
                  <div className="child-card__header">
                    <Avatar avatar={child.avatar} size="xl" className="child-card__avatar" />
                    <div className="child-card__info">
                      <h4 className="child-card__name">{child.name}</h4>
                      {child.age && (
                        <span className="child-card__age">Age {child.age}</span>
                      )}
                    </div>
                  </div>

                  <div className="child-card__balance">
                    <span className="child-card__balance-label">Current Balance</span>
                    <span className="child-card__balance-amount">
                      {formatCurrency(child.balance)}
                    </span>
                  </div>

                  <div className="child-card__stats">
                    <div className="child-card__stat">
                      <span className="child-card__stat-value">
                        {formatCurrency(childStats[child.id]?.earned || 0)}
                      </span>
                      <span className="child-card__stat-label">Earned</span>
                    </div>
                    <div className="child-card__stat-divider" />
                    <div className="child-card__stat">
                      <span className="child-card__stat-value">
                        {childStats[child.id]?.transactionCount || 0}
                      </span>
                      <span className="child-card__stat-label">Transactions</span>
                    </div>
                  </div>

                  <div className="child-card__actions">
                    <button
                      className="btn btn-success btn-sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/parent/child/${child.id}/deposit`);
                      }}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <line x1="12" y1="5" x2="12" y2="19"/>
                        <line x1="5" y1="12" x2="19" y2="12"/>
                      </svg>
                      Deposit
                    </button>
                    <button
                      className="btn btn-danger btn-sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/parent/child/${child.id}/deduct`);
                      }}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <line x1="5" y1="12" x2="19" y2="12"/>
                      </svg>
                      Deduct
                    </button>
                  </div>
                </article>
              ))}

            </div>
          </section>
        )}
      </div>
    </Layout>
  );
};

export default ParentDashboard;
