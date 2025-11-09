import React, { PropsWithChildren } from 'react';

interface AppLayoutProps {
  title?: string;
}

const AppLayout: React.FC<PropsWithChildren<AppLayoutProps>> = ({ children }) => (
  <div className="app-shell">
    <main className="app-main">{children}</main>
  </div>
);

export default AppLayout;

