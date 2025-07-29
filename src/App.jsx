import React from 'react';
import LandingPage from './LandingPage.jsx';
import HabilitaFacilTool from './HabilitaFacilTool.jsx';

const App = () => {
    const [currentPage, setCurrentPage] = React.useState('landing'); // 'landing' or 'tool'

    // Função para alternar para a ferramenta Habilita Fácil
    const handleAccessTool = () => {
        setCurrentPage('tool');
    };

    // Função para voltar para a landing page
    const handleBackToLanding = () => {
        setCurrentPage('landing');
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center py-8">
            {currentPage === 'landing' ? (
                <LandingPage onAccessTool={handleAccessTool} />
            ) : (
                <HabilitaFacilTool onBackToLanding={handleBackToLanding} />
            )}
        </div>
    );
};

export default App;
