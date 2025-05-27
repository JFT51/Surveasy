import React from 'react';
import { AppProvider } from './context/AppContext';
import { NotificationProvider } from './context/NotificationContext';
import Layout from './components/Layout';
import StepManager from './components/StepManager';

function App() {
  return (
    <AppProvider>
      <NotificationProvider>
        <Layout>
          <StepManager />
        </Layout>
      </NotificationProvider>
    </AppProvider>
  );
}

export default App;
