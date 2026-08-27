import React from 'react';
import { Outlet } from 'react-router-dom';
import LandingNavbar from './LandingNavbar.jsx';

const PublicLayout = () => {
    return (
        <>
            <LandingNavbar />
            <main>
                <Outlet />
            </main>
        </>
    );
};

export default PublicLayout;