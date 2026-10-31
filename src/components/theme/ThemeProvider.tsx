'use client';

import {ThemeProvider as Provider} from 'next-themes';
import {ReactNode} from 'react';

type ThemeProviderProps = {
    children: ReactNode;
};

export default function ThemeProvider({children}: ThemeProviderProps) {
    return (
        <Provider enableSystem={true} attribute="class">
            {children}
        </Provider>
    );
}
