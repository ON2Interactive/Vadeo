import React from 'react';

type SettingsModalProps = {
  isOpen: boolean;
  onClose: () => void;
  accountName: string;
  currentPlanLabel: string;
  currentPlanStatus: string;
  usageCopy: string;
  canManageBilling: boolean;
  onManageBilling: () => void;
  onUpgradeStarter: () => void;
  onUpgradeStandard: () => void;
  onUpgradePremium: () => void;
  onLogout: () => void;
  busyAction?: string | null;
  error?: string | null;
};

const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  accountName,
  currentPlanLabel,
  currentPlanStatus,
  usageCopy,
  canManageBilling,
  onManageBilling,
  onUpgradeStarter,
  onUpgradeStandard,
  onUpgradePremium,
  onLogout,
  busyAction = null,
  error = null,
}) => {
  if (!isOpen) return null;

  return (
    <div className="workspace-settings-modal" role="dialog" aria-modal="true" aria-label="Settings">
      <div className="workspace-settings-media">
        <img alt="" className="workspace-settings-image" src="/Hero-Dark.png" />
        <div className="workspace-settings-image-overlay" />
        <div className="workspace-settings-badge">
          <strong>{accountName || 'Vadeo User'}</strong>
        </div>
      </div>

      <div className="workspace-settings-content">
        <button
          aria-label="Close settings"
          className="workspace-settings-close"
          type="button"
          onClick={onClose}
        >
          <CloseIcon />
        </button>

        <img alt="Vadeo" className="workspace-settings-logo" src="/vadeo-logo-white.png" />

        <div className="workspace-settings-sections">
          <section className="workspace-settings-section">
            <h2>Current Plan</h2>
            <div className="workspace-settings-line">
              <strong>{currentPlanLabel}</strong>
              <span>{currentPlanStatus}</span>
            </div>
            <div className="workspace-settings-actions">
              <button
                className="workspace-settings-link workspace-settings-link-muted"
                type="button"
                disabled={!canManageBilling || busyAction !== null}
                onClick={onManageBilling}
              >
                Manage
              </button>
              <button className="workspace-settings-link" type="button" disabled={busyAction !== null} onClick={onUpgradeStarter}>
                Starter
              </button>
              <button className="workspace-settings-link" type="button" disabled={busyAction !== null} onClick={onUpgradeStandard}>
                Standard
              </button>
              <button className="workspace-settings-link" type="button" disabled={busyAction !== null} onClick={onUpgradePremium}>
                Premium
              </button>
            </div>
          </section>

          <section className="workspace-settings-section">
            <h2>Usage</h2>
            <p>{usageCopy}</p>
          </section>

          <section className="workspace-settings-section">
            <h2>Help</h2>
            <div className="workspace-settings-actions">
              <a className="workspace-settings-link" href="/pricing">
                Pricing
              </a>
              <a className="workspace-settings-link workspace-settings-link-muted" href="mailto:hello@vadeo.cloud">
                Contact Support
              </a>
            </div>
          </section>

          <section className="workspace-settings-section">
            <button className="workspace-settings-link workspace-settings-link-danger" type="button" disabled={busyAction !== null} onClick={onLogout}>
              Logout
            </button>
          </section>

          {error ? <p className="workspace-settings-error">{error}</p> : null}
        </div>
      </div>
    </div>
  );
};

function CloseIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M6 6L18 18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M18 6L6 18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

export default SettingsModal;
