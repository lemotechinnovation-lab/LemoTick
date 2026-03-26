import { AdminLayout } from '@/layouts/AdminLayout';
import {
    AdminDashboard,
    InvestorsPage,
    PortfoliosPage,
    SettingsPage,
    TransactionsPage,
} from '@/pages/admin';
import { RouteObject } from 'react-router-dom';

export const adminRoutes: RouteObject = {
    path: '/admin',
    element: <AdminLayout />,
    children: [
        {
            index: true,
            element: <AdminDashboard />,
        },
        {
            path: 'investors',
            element: <InvestorsPage />,
        },
        {
            path: 'portfolios',
            element: <PortfoliosPage />,
        },
        {
            path: 'transactions',
            element: <TransactionsPage />,
        },
        {
            path: 'settings',
            element: <SettingsPage />,
        },
    ],
};
