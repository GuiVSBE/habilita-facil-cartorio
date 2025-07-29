import React from 'react';

// Importa os ícones do Lucide (certifique-se de que o CDN está carregado no index.html)
// No ambiente de desenvolvimento local com um bundler, você importaria assim:
// import { ArrowRight, Whatsapp, Instagram } from 'lucide-react';
// Mas como estamos usando CDN e Babel no navegador, Lucide é global.

const LandingPage = ({ onAccessTool }) => {
    // useEffect para garantir que os ícones Lucide sejam criados após a renderização do componente
    React.useEffect(() => {
        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }
    }, []);

    return (
        <section id="landing-page" className="container section-spacing">
            <div className="header-landing">
                <p className="text-xl font-medium text-[#A0522D] mb-4">Transforme seu Cartório de Registro Civil</p>
                <h1>Sua Jornada para a Excelência Começa Aqui.</h1>
                <p>
                    Olá! Sou [Seu Nome], especialista em consultoria para Cartórios de Registro Civil das Pessoas Naturais.
                    Se você busca otimizar processos, aprimorar o atendimento e elevar seu cartório a um novo patamar de eficiência e reconhecimento,
                    você está no lugar certo.
                </p>
            </div>

            <div className="content-block">
                {/* Imagem de um cartório moderno e organizado */}
                <img src="https://images.unsplash.com/photo-1517048676732-d65bc937f952?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" alt="Interior de um cartório moderno e organizado" />
                <div>
                    <h2>Desafios Atuais? Soluções Inovadoras.</h2>
                    <p>
                        O dia a dia de um cartório é repleto de complexidades e demandas crescentes. A burocracia, a falta de padronização e a dificuldade em se adaptar às novas tecnologias podem estagnar o crescimento e a qualidade dos serviços. Minha mentoria é desenhada para identificar esses gargalos e implementar estratégias personalizadas que trarão resultados reais e duradouros.
                    </p>
                </div>
            </div>

            <div className="content-block reverse">
                {/* Imagem de profissionais em reunião de consultoria */}
                <img src="https://images.unsplash.com/photo-1552664730-d307ca884978?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" alt="Profissionais em reunião de consultoria" />
                <div>
                    <h2>Por que Minha Mentoria é Essencial para o Seu Cartório?</h2>
                    <p>
                        Sem uma orientação especializada, a jornada para a excelência pode ser longa e frustrante. Minha metodologia foca em capacitar sua equipe, simplificar fluxos de trabalho e integrar soluções tecnológicas que farão seu cartório se destacar. Não se contente com o básico; <strong>sem minha mentoria, seu cartório jamais chegará ao próximo nível de eficiência e reconhecimento.</strong> Invista no futuro do seu negócio e veja a transformação acontecer!
                    </p>
                </div>
            </div>

            <div className="text-center mt-12">
                <button onClick={onAccessTool} className="cta-button">
                    <i data-lucide="arrow-right" className="w-6 h-6"></i>
                    Acessar Ferramenta Habilita Fácil
                </button>
            </div>

            <div className="contact-section">
                <h2>Fale Comigo</h2>
                <p className="mb-6 text-lg text-gray-700">Estou pronto para ajudar seu cartório a prosperar. Entre em contato!</p>
                <div className="contact-links">
                    <a href="https://wa.me/55XXYYYYYYYYY" target="_blank" rel="noopener noreferrer">
                        <i data-lucide="whatsapp"></i>
                        WhatsApp
                    </a>
                    <a href="https://instagram.com/seuinstagram" target="_blank" rel="noopener noreferrer">
                        <i data-lucide="instagram"></i>
                        Instagram
                    </a>
                    {/* Adicione outros contatos se desejar */}
                    {/* <a href="mailto:seuemail@exemplo.com">
                        <i data-lucide="mail"></i>
                        Email
                    </a> */}
                </div>
            </div>
        </section>
    );
};

export default LandingPage;
