import React, { createContext, useContext, useState, useEffect } from 'react';

interface BrandProfile {
    name: string;
    industry: string;
    colors: {
        primary: string;
        secondary: string;
        accent: string;
    };
    typography: {
        heading: string;
        body: string;
    };
    voice: string;
}

interface BrandContextType {
    brand: BrandProfile;
    updateBrand: (updates: Partial<BrandProfile>) => void;
    isLoading: boolean;
}

const defaultBrand: BrandProfile = {
    name: 'Neural OS',
    industry: 'Technology',
    colors: {
        primary: '#0F172A',
        secondary: '#1E293B',
        accent: '#D4AF37', // Sovereign Gold
    },
    typography: {
        heading: 'Playfair Display',
        body: 'Inter',
    },
    voice: 'Professional, Visionary, Strategic',
};

const BrandContext = createContext<BrandContextType | undefined>(undefined);

export function BrandProvider({ children }: { children: React.ReactNode }) {
    const [brand, setBrand] = useState<BrandProfile>(defaultBrand);
    const [isLoading, setIsLoading] = useState(false);

    // Load from local storage on mount
    useEffect(() => {
        const savedBrand = localStorage.getItem('neural_os_brand_profile');
        if (savedBrand) {
            try {
                setBrand({ ...defaultBrand, ...JSON.parse(savedBrand) });
            } catch (e) {
                console.error('Failed to parse saved brand profile', e);
            }
        }
    }, []);

    const updateBrand = (updates: Partial<BrandProfile>) => {
        const newBrand = { ...brand, ...updates };
        setBrand(newBrand);
        localStorage.setItem('neural_os_brand_profile', JSON.stringify(newBrand));
    };

    return (
        <BrandContext.Provider value={{ brand, updateBrand, isLoading }}>
            {children}
        </BrandContext.Provider>
    );
}

export function useBrand() {
    const context = useContext(BrandContext);
    if (context === undefined) {
        throw new Error('useBrand must be used within a BrandProvider');
    }
    return context;
}
