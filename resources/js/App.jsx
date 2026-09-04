import React, { useState, useEffect } from 'react';
import { useAuth } from './context/AuthContext';
import { useCart } from './context/CartContext';
import SideNavBar from './components/layout/SideNavBar';
import TopNavBar from './components/layout/TopNavBar';
import Footer from './components/layout/Footer';
import CartDrawer from './components/modals/CartDrawer';
import CheckoutModal from './components/modals/CheckoutModal';
import TopUpModal from './components/modals/TopUpModal';
import CreateStoreModal from './components/modals/CreateStoreModal';

import DashboardPage from './pages/DashboardPage';
import FavoritesPage from './pages/FavoritesPage';
import TransactionsPage from './pages/TransactionsPage';
import ProfilePage from './pages/ProfilePage';
import StoreManagementPage from './pages/StoreManagementPage';
import SignUpPage from './pages/SignUpPage';
import LoginPage from './pages/LoginPage';

// Global Toast Notification
function ToastNotification() {
    const { toastMessage } = useCart();
    if (!toastMessage) return null;

    const isError = toastMessage.type === 'error';

    return (
        <div
            className={`fixed bottom-6 right-6 z-[100] max-w-sm px-5 py-3.5 rounded-2xl shadow-2xl text-xs font-bold flex items-center gap-3 transition-all animate-in slide-in-from-bottom-5 duration-300 ${
                isError
                    ? 'bg-error text-white shadow-error/20'
                    : 'bg-white border border-outline-variant/30 text-on-surface shadow-xl'
            }`}
        >
            <span className="material-symbols-outlined text-[20px]">
                {isError ? 'error' : 'check_circle'}
            </span>
            <span className="leading-snug">{toastMessage.message}</span>
        </div>
    );
}

export default function App() {
    const { user, loading } = useAuth();
    const { isCheckoutOpen } = useCart();

    const [currentRoute, setCurrentRoute] = useState('dashboard');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedGameSlug, setSelectedGameSlug] = useState('all');
    const [isTopUpOpen, setIsTopUpOpen] = useState(false);
    const [isCreateStoreOpen, setIsCreateStoreOpen] = useState(false);
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

    // Route Protection for authenticated routes
    useEffect(() => {
        if (!loading && !user && ['favorites', 'transactions', 'profile', 'store'].includes(currentRoute)) {
            setCurrentRoute('login');
        }
    }, [user, loading, currentRoute]);

    // Store protection: if logged in but has no store, open store modal and don't allow store route
    useEffect(() => {
        if (!loading && user && !user.has_store && currentRoute === 'store') {
            setIsCreateStoreOpen(true);
            setCurrentRoute('dashboard');
        }
    }, [user, loading, currentRoute]);

    const handleSearchChange = (value) => {
        setSearchQuery(value);
        if (currentRoute !== 'dashboard') {
            setCurrentRoute('dashboard');
        }
    };

    const handleSelectGame = (slug) => {
        setSelectedGameSlug(slug);
        setCurrentRoute('dashboard');
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleSelectCategory = () => {
        setCurrentRoute('dashboard');
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // Splash Loading Screen
    if (loading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="text-center space-y-4">
                    <div className="w-14 h-14 rounded-2xl bg-primary flex items-center justify-center mx-auto shadow-xl">
                        <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    </div>
                    <div>
                        <p className="font-extrabold text-primary tracking-widest text-sm uppercase">NEXUS GAMING</p>
                        <p className="text-xs text-on-surface-variant mt-1">Memuat Platform...</p>
                    </div>
                </div>
            </div>
        );
    }

    // Standalone Fullscreen Auth Routes (Sign Up & Log In)
    if (currentRoute === 'signup') {
        return (
            <>
                <SignUpPage setCurrentRoute={setCurrentRoute} />
                <ToastNotification />
            </>
        );
    }

    if (currentRoute === 'login') {
        return (
            <>
                <LoginPage setCurrentRoute={setCurrentRoute} />
                <ToastNotification />
            </>
        );
    }

    // Main Layout: SideNavBar (Desktop Left) + TopNavBar + Scrollable Main Content (Stitch 1:1)
    return (
        <div className="min-h-screen bg-background font-sans antialiased flex flex-col">
            
            {/* Desktop Left Sidebar with Collapse Toggle */}
            <SideNavBar
                currentRoute={currentRoute}
                setCurrentRoute={setCurrentRoute}
                onOpenTopUp={() => setIsTopUpOpen(true)}
                onOpenCreateStore={() => setIsCreateStoreOpen(true)}
                isCollapsed={isSidebarCollapsed}
                setIsCollapsed={setIsSidebarCollapsed}
            />

            {/* Main Content Area — dynamically shifts with sidebar collapse */}
            <div className={`flex-1 flex flex-col min-h-screen transition-all duration-300 ${
                isSidebarCollapsed ? 'md:ml-20' : 'md:ml-64'
            }`}>
                
                {/* Top Header */}
                <TopNavBar
                    currentRoute={currentRoute}
                    setCurrentRoute={setCurrentRoute}
                    searchQuery={searchQuery}
                    onSearchChange={handleSearchChange}
                    onOpenTopUp={() => setIsTopUpOpen(true)}
                    onOpenCreateStore={() => setIsCreateStoreOpen(true)}
                    isSidebarCollapsed={isSidebarCollapsed}
                    setIsSidebarCollapsed={setIsSidebarCollapsed}
                />

                {/* Page View Container */}
                <main className="flex-1 p-4 md:p-8 max-w-[1280px] w-full mx-auto">
                    {currentRoute === 'dashboard' && (
                        <DashboardPage
                            searchQuery={searchQuery}
                            selectedGameSlug={selectedGameSlug}
                            setSelectedGameSlug={setSelectedGameSlug}
                            onOpenTopUp={() => setIsTopUpOpen(true)}
                        />
                    )}
                    {currentRoute === 'favorites' && (
                        <FavoritesPage setCurrentRoute={setCurrentRoute} />
                    )}
                    {currentRoute === 'transactions' && (
                        <TransactionsPage setCurrentRoute={setCurrentRoute} />
                    )}
                    {currentRoute === 'profile' && (
                        <ProfilePage onOpenTopUp={() => setIsTopUpOpen(true)} />
                    )}
                    {currentRoute === 'store' && (
                        <StoreManagementPage />
                    )}
                </main>

                {/* Footer */}
                <Footer
                    onSelectGame={handleSelectGame}
                    onSelectCategory={handleSelectCategory}
                />
            </div>

            {/* Global Slide-over & Modals */}
            <CartDrawer />
            
            {isCheckoutOpen && (
                <CheckoutModal
                    onOrderSuccess={() => setCurrentRoute('transactions')}
                    onOpenTopUp={() => setIsTopUpOpen(true)}
                    onGoToProfile={() => setCurrentRoute('profile')}
                    onGoToLogin={(route) => setCurrentRoute(route || 'login')}
                />
            )}

            <TopUpModal
                isOpen={isTopUpOpen}
                onClose={() => setIsTopUpOpen(false)}
            />

            <CreateStoreModal
                isOpen={isCreateStoreOpen}
                onClose={() => setIsCreateStoreOpen(false)}
                onStoreCreated={() => setCurrentRoute('store')}
            />

            {/* Global Toast */}
            <ToastNotification />
        </div>
    );
}
