import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../../components/Layout';
import { invitationsService, Invitation } from '../../services/invitations-service';
import './ManageFamily.css';

const ManageFamily: React.FC = () => {
  const navigate = useNavigate();
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const MAX_INVITES = 2;
  const canCreateInvite = invitations.length < MAX_INVITES;

  useEffect(() => {
    loadInvitations();
  }, []);

  const loadInvitations = async () => {
    try {
      setIsLoading(true);
      const data = await invitationsService.getInvitations();
      setInvitations(data);
      setError(null);
    } catch (err) {
      console.error('Failed to load invitations:', err);
      setError('Failed to load invitations');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateInvite = async () => {
    if (!canCreateInvite || isGenerating) return;

    try {
      setIsGenerating(true);
      setError(null);
      const newInvite = await invitationsService.createInvitation();
      setInvitations(prev => [...prev, newInvite]);
    } catch (err: any) {
      console.error('Failed to create invitation:', err);
      setError(err.response?.data?.detail || 'Failed to create invitation');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleRemoveInvite = async (id: string) => {
    try {
      await invitationsService.deleteInvitation(id);
      setInvitations(prev => prev.filter(inv => inv.id !== id));
    } catch (err) {
      console.error('Failed to remove invitation:', err);
      setError('Failed to remove invitation');
    }
  };

  const handleCopyLink = async (invite: Invitation) => {
    const link = `${window.location.origin}/invite/${invite.invite_code}`;
    await navigator.clipboard.writeText(link);
    setCopiedId(invite.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <Layout title="Manage Family">
      <div className="manage-family-page">
        <p className="page-subtitle">
          Add children and invite other parents to co-manage your family account
        </p>

        {error && (
          <div className="error-message">{error}</div>
        )}

        {/* Add Child Card */}
        <div className="family-card family-card--clickable" onClick={() => navigate('/parent/add-child')}>
          <div className="family-card__icon family-card__icon--green">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
              <circle cx="8.5" cy="7" r="4"/>
              <line x1="20" y1="8" x2="20" y2="14"/>
              <line x1="23" y1="11" x2="17" y2="11"/>
            </svg>
          </div>
          <div className="family-card__text">
            <h3>Add Child</h3>
            <p>Create a new piggy bank account for your child</p>
          </div>
          <svg className="family-card__arrow" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="9 18 15 12 9 6"/>
          </svg>
        </div>

        {/* Invite Co-Parent Card */}
        <div className="family-card">
          <div className="family-card__header">
            <div className="family-card__icon family-card__icon--gold">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                <circle cx="9" cy="7" r="4"/>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
              </svg>
            </div>
            <div className="family-card__text">
              <h3>Invite Co-Parent</h3>
              <p>Share family management with another parent or guardian</p>
            </div>
          </div>

          {canCreateInvite && (
            <div className="invite-action">
              <div className="create-invite-btn" onClick={handleCreateInvite}>
                {isGenerating ? 'Creating...' : 'Create Invite'}
              </div>
            </div>
          )}

          {isLoading ? (
            <div className="loading-message">Loading invitations...</div>
          ) : invitations.length > 0 && (
            <div className="pending-invites">
              <div className="pending-invites__header">
                <span>Pending Invitations</span>
                <span className="pending-invites__count">{invitations.length}/{MAX_INVITES}</span>
              </div>

              {invitations.map((invite) => (
                <div key={invite.id} className="invite-row">
                  <div className="invite-row__code">
                    <span className="invite-row__label">Code</span>
                    <span className="invite-row__value">{invite.invite_code}</span>
                  </div>
                  <div className="invite-row__buttons">
                    <div className="invite-btn invite-btn--copy" onClick={() => handleCopyLink(invite)}>
                      {copiedId === invite.id ? 'Copied!' : 'Copy Link'}
                    </div>
                    <div className="invite-btn invite-btn--remove" onClick={() => handleRemoveInvite(invite.id)}>
                      Remove
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {!canCreateInvite && (
            <div className="limit-message">
              Maximum {MAX_INVITES} pending invitations. Remove one to create a new invite.
            </div>
          )}
        </div>

        <div className="info-note">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" y1="16" x2="12" y2="12"/>
            <line x1="12" y1="8" x2="12.01" y2="8"/>
          </svg>
          <span>Co-parents have equal access to manage all children's accounts and transactions.</span>
        </div>
      </div>
    </Layout>
  );
};

export default ManageFamily;
