import React, { PropsWithChildren } from 'react';

interface AppLayoutProps {
  title?: string;
}

const AppLayout: React.FC<PropsWithChildren<AppLayoutProps>> = ({ children, title = 'Rebulk' }) => (
  <div className="app-shell">
    <header className="app-header">
      <div className="app-header__brand">
        <h1>{title}</h1>
      </div>
    </header>
    <main className="app-main">{children}</main>
  </div>
);

export default AppLayout;

