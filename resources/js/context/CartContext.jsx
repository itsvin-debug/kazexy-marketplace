import React, { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
    const [cartItems, setCartItems] = useState(() => {
        const saved = localStorage.getItem('nexus_cart');
        return saved ? JSON.parse(saved) : [];
    });

    const [isCartOpen, setIsCartOpen] = useState(false);
    const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
    const [checkoutItems, setCheckoutItems] = useState([]);
    const [toastMessage, setToastMessage] = useState(null);

    useEffect(() => {
        localStorage.setItem('nexus_cart', JSON.stringify(cartItems));
    }, [cartItems]);

    const showToast = (message, type = 'success') => {
        setToastMessage({ message, type });
        setTimeout(() => {
            setToastMessage(null);
        }, 3500);
    };

    const addToCart = (product, quantity = 1) => {
        setCartItems((prev) => {
            const existingIndex = prev.findIndex((item) => item.id === product.id);
            if (existingIndex > -1) {
                const updated = [...prev];
                const newQty = updated[existingIndex].quantity + quantity;
                if (newQty > product.stock) {
                    showToast(`Maksimal stok tersedia adalah ${product.stock}`, 'error');
                    return prev;
                }
                updated[existingIndex].quantity = newQty;
                showToast(`Jumlah '${product.title}' berhasil ditambah.`);
                return updated;
            } else {
                showToast(`'${product.title}' berhasil ditambahkan ke keranjang!`);
                return [...prev, { ...product, quantity }];
            }
        });
    };

    const removeFromCart = (productId) => {
        setCartItems((prev) => prev.filter((item) => item.id !== productId));
        showToast('Item berhasil dihapus dari keranjang.');
    };

    const updateQuantity = (productId, quantity) => {
        if (quantity <= 0) {
            removeFromCart(productId);
            return;
        }
        setCartItems((prev) =>
            prev.map((item) => {
                if (item.id === productId) {
                    if (quantity > item.stock) {
                        showToast(`Maksimal stok tersedia adalah ${item.stock}`, 'error');
                        return item;
                    }
                    return { ...item, quantity };
                }
                return item;
            })
        );
    };

    const clearCart = () => {
        setCartItems([]);
    };

    const startCheckout = (items = null) => {
        if (items && items.length > 0) {
            setCheckoutItems(items);
        } else {
            setCheckoutItems(cartItems);
        }
        setIsCartOpen(false);
        setIsCheckoutOpen(true);
    };

    const cartTotal = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
    const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

    return (
        <CartContext.Provider
            value={{
                cartItems,
                addToCart,
                removeFromCart,
                updateQuantity,
                clearCart,
                cartTotal,
                cartCount,
                isCartOpen,
                setIsCartOpen,
                isCheckoutOpen,
                setIsCheckoutOpen,
                checkoutItems,
                startCheckout,
                toastMessage,
                showToast,
            }}
        >
            {children}
        </CartContext.Provider>
    );
};

export const useCart = () => useContext(CartContext);
