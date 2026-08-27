import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import AppRoutes from './routes/AppRoutes.jsx';
import { AuthProvider } from './context/AuthContext.jsx';
import { ThemeProvider } from './context/ThemeContext.jsx';
import './styles/globals.css';
import './styles/variables.css';

function App() {
    return (
        <BrowserRouter>
            <ThemeProvider>
                <AuthProvider>
                    <Toaster
                        position="top-right"
                        toastOptions={{
                            duration: 4000,
                            style: {
                                background: '#363636',
                                color: '#fff',
                                borderRadius: '8px',
                                padding: '16px',
                            },
                            success: {
                                duration: 3000,
                                iconTheme: {
                                    primary: '#22C55E',
                                    secondary: '#FFFFFF',
                                },
                            },
                            error: {
                                duration: 4000,
                                iconTheme: {
                                    primary: '#EF4444',
                                    secondary: '#FFFFFF',
                                },
                            },
                        }}
                    />
                    <AppRoutes />
                </AuthProvider>
            </ThemeProvider>
        </BrowserRouter>
    );
}

export default App;