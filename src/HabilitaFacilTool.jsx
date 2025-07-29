import React from 'react';

// Importa jsPDF (assumindo que o CDN está carregado no index.html)
const jsPDF = window.jspdf.jsPDF;

// Helper function to format date
const formatDate = (dateString) => {
    if (!dateString) return '';
    const [year, month, day] = dateString.split('-');
    return `${day}/${month}/${year}`;
};

// Custom Message Box Component for HabilitaFacilTool
const MessageBox = ({ title, message, onClose }) => {
    return (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-xl max-w-sm w-full text-center">
                <p className={`text-lg font-semibold ${title.includes('Atenção') || title.includes('Erro') ? 'text-red-600' : 'text-[#A0522D]'} mb-4`}>{title}</p>
                <p className="text-gray-700 mb-6">{message}</p>
                <button onClick={onClose} className="btn-primary">OK</button>
            </div>
        </div>
    );
};

// Centralized PDF Generation Function (adapted for React data)
const generatePdf = (dataToPrint, showMessageBox) => {
    const doc = new jsPDF();
    let y = 20;
    const startX = 20;
    const contentWidth = 170; // A4 width (210mm) - 2 * startX
    const cardPadding = 10;
    const cardRadius = 8; // Rounded corners for PDF cards
    const shadowOffset = 2; // Offset for shadow effect
    const shadowColor = '#E0E0E0'; // Light gray for shadow

    const pageHeight = doc.internal.pageSize.getHeight();
    const bottomMargin = 30;
    const lineHeight = 10 / 2.5 + 1.5; // Even tighter line spacing (font size / 2.5 + 1.5)

    const addText = (text, x, fontSize = 10, fontStyle = 'normal') => {
        doc.setFont("helvetica", fontStyle);
        doc.setFontSize(fontSize);
        doc.text(text, x, y);
        y += lineHeight;
    };

    const addSectionTitle = (title, currentY) => {
        doc.setFont("helvetica", "bold");
        doc.setFontSize(14);
        doc.setTextColor('#333333');
        doc.text(title, startX + cardPadding, currentY + cardPadding + 5);
    };

    // Function to draw a card background and content
    // Returns the new Y position after drawing the card
    const drawCard = (doc, currentY, title, contentLines, extraSpaceAfter = 8) => { 
        const cardY = currentY + 5; // Reduced space before the card to 5
        let currentContentY = cardY + cardPadding + 15; // Adjusted starting Y for content inside card (title height + padding)

        const titleHeight = 14 / 2.5 + 5;
        const estimatedContentHeight = contentLines.length * lineHeight;
        const cardHeight = titleHeight + estimatedContentHeight + (2 * cardPadding);

        // Check page break BEFORE drawing the card
        if (cardY + cardHeight + extraSpaceAfter >= pageHeight - bottomMargin) {
            doc.addPage();
            currentY = 20; // Reset Y for new page
            currentContentY = currentY + cardPadding + 15; // Reset for new page
        }

        // Draw shadow
        doc.setFillColor(shadowColor);
        doc.roundedRect(startX + shadowOffset, currentY + shadowOffset, contentWidth, cardHeight, cardRadius, cardRadius, 'F');

        // Draw card background
        doc.setFillColor('#FDFDFD'); // Card background color
        doc.setDrawColor('#F5F5F5'); // Card border color
        doc.setLineWidth(0.5);
        doc.roundedRect(startX, currentY, contentWidth, cardHeight, cardRadius, cardRadius, 'FD'); // Fill and Draw

        // Add title inside the card
        addSectionTitle(title, currentY);

        // Add content lines inside the card
        doc.setFont("helvetica", "normal");
        doc.setFontSize(10);
        doc.setTextColor('#333333');
        contentLines.forEach(line => {
            doc.text(line, startX + cardPadding, currentContentY);
            currentContentY += lineHeight;
        });

        return currentY + cardHeight + extraSpaceAfter; // Return new Y position after card + spacing
    };

    // Function to draw a two-column section within a single card
    // Returns the new Y position after drawing the card
    const drawTwoColumnCard = (doc, currentY, title, leftContentLines, rightContentLines, extraSpaceAfter = 8) => { 
        const innerPadding = 10;
        const columnMargin = 5; // Space between columns
        const columnWidth = (contentWidth / 2) - columnMargin; // Width for each column

        const titleHeight = 14 / 2.5 + 5;
        const maxContentLines = Math.max(leftContentLines.length, rightContentLines.length);
        const estimatedContentHeight = maxContentLines * lineHeight;
        const cardHeight = titleHeight + estimatedContentHeight + (2 * innerPadding);

        // Check page break BEFORE drawing the card
        if (currentY + cardHeight + extraSpaceAfter >= pageHeight - bottomMargin) {
            doc.addPage();
            currentY = 20; // Reset Y for new page
        }

        const cardY = currentY + 5; // Reduced space before the card to 5
        let currentLeftY = cardY + innerPadding + titleHeight + 5;
        let currentRightY = cardY + innerPadding + titleHeight + 5;

        // Draw shadow
        doc.setFillColor(shadowColor);
        doc.roundedRect(startX + shadowOffset, cardY + shadowOffset, contentWidth, cardHeight, cardRadius, cardRadius, 'F');

        // Draw card background
        doc.setFillColor('#FDFDFD');
        doc.setDrawColor('#F5F5F5');
        doc.setLineWidth(0.5);
        doc.roundedRect(startX, cardY, contentWidth, cardHeight, cardRadius, cardRadius, 'FD');

        // Add title
        addSectionTitle(title, cardY);

        // Add content to columns
        doc.setFont("helvetica", "normal");
        doc.setFontSize(10);
        doc.setTextColor('#333333');

        leftContentLines.forEach(line => {
            doc.text(line, startX + innerPadding, currentLeftY);
            currentLeftY += lineHeight;
        });

        rightContentLines.forEach(line => {
            doc.text(line, startX + innerPadding + columnWidth + (columnMargin * 2), currentRightY); // Adjust X for right column
            currentRightY += lineHeight;
        });

        return cardY + cardHeight + extraSpaceAfter; // Return new Y position after card + spacing
    };


    // --- PDF Content Generation ---
    // Title for the entire document
    doc.setFont("helvetica", "bold");
    doc.setFontSize(20);
    doc.setTextColor('#333333');
    doc.text('FICHA DE PRÉ-CADASTRO DE CASAMENTO', doc.internal.pageSize.getWidth() / 2, y, { align: 'center' });
    y += 15; // Space after main title

    // Tipo de Casamento Card
    let tipoCasamentoContent = [`Tipo de Casamento: ${dataToPrint.tipoCasamento || 'Não informado'}`];
    if (dataToPrint.tipoCasamento === 'Religioso com Efeito Civil') {
        tipoCasamentoContent.push(`Local de Celebração: ${dataToPrint.localCelebracao || 'Não informado'}`);
        tipoCasamentoContent.push(`Nome da Autoridade Religiosa: ${dataToPrint.autoridadeReligiosa || 'Não informado'}`);
    }
    y = drawCard(doc, y, 'TIPO DE CASAMENTO', tipoCasamentoContent, 5); // Reduced spacing after this card

    // Dados dos Noivos (Two Columns)
    let noivo1Content = [
        `Nome: ${dataToPrint.noivo1Nome || 'Não informado'}`,
        `CPF: ${dataToPrint.noivo1CPF || 'Não informado'}`,
        `Nasc.: ${formatDate(dataToPrint.noivo1DataNascimento) || 'Não informado'}`,
        `Nac.: ${dataToPrint.noivo1Nacionalidade || 'Não informado'}`,
        `Nat.: ${dataToPrint.noivo1Naturalidade || 'Não informado'}`,
        `Est. Civil: ${dataToPrint.noivo1EstadoCivil || 'Não informado'}`,
        `Prof.: ${dataToPrint.noivo1Profissao || 'Não informado'}`,
        `Mãe: ${dataToPrint.noivo1NomeMae || 'Não informado'}`,
        `Pai: ${dataToPrint.noivo1NomePai || 'Não informado'}`,
        `End.: ${dataToPrint.noivo1Endereco || 'Não informado'}`,
        `Contato: ${dataToPrint.noivo1Contato || 'Não informado'}`
    ];
    let noivo2Content = [
        `Nome: ${dataToPrint.noivo2Nome || 'Não informado'}`,
        `CPF: ${dataToPrint.noivo2CPF || 'Não informado'}`,
        `Nasc.: ${formatDate(dataToPrint.noivo2DataNascimento) || 'Não informado'}`,
        `Nac.: ${dataToPrint.noivo2Nacionalidade || 'Não informado'}`,
        `Nat.: ${dataToPrint.noivo2Naturalidade || 'Não informado'}`,
        `Est. Civil: ${dataToPrint.noivo2EstadoCivil || 'Não informado'}`,
        `Prof.: ${dataToPrint.noivo2Profissao || 'Não informado'}`,
        `Mãe: ${dataToPrint.noivo2NomeMae || 'Não informado'}`,
        `Pai: ${dataToPrint.noivo2NomePai || 'Não informado'}`,
        `End.: ${dataToPrint.noivo2Endereco || 'Não informado'}`,
        `Contato: ${dataToPrint.noivo2Contato || 'Não informado'}`
    ];
    y = drawTwoColumnCard(doc, y, 'DADOS DOS NOIVOS', noivo1Content, noivo2Content, 5); // Reduced spacing after this card

    // Regime de Bens e Alteração de Nome Card (immediately below noivos data)
    let regimeContent = [
        `Regime de bens escolhido: ${dataToPrint.regimeBens || 'Não informado'}`,
        `Haverá alteração de nome? ${dataToPrint.alteracaoNome || 'Não informado'}`
    ];
    if (dataToPrint.alteracaoNome === 'Sim') {
        regimeContent.push(`Novo nome: ${dataToPrint.novoNome || 'Não informado'}`);
    }
    y = drawCard(doc, y, 'REGIME DE BENS E ALTERAÇÃO DE NOME', regimeContent, 8); // Reduced spacing after this card

    // Data e Horário Pretendidos Card
    let dataHorarioContent = [
        `Data pretendida para o casamento: ${formatDate(dataToPrint.dataCasamento) || 'Não informado'}`,
        `Horário pretendido: ${dataToPrint.horarioCasamento || 'Não informado'}`
    ];
    y = drawCard(doc, y, 'DATA E HORÁRIO PRETENDIDOS', dataHorarioContent, 8); // Reduced spacing after this card

    // Testemunhas Card
    let testemunhasContent = [
        `Testemunha 1: ${dataToPrint.testemunha1Nome || 'Não informado'} (CPF: ${dataToPrint.testemunha1CPF || 'Não informado'})`,
        `Testemunha 2: ${dataToPrint.testemunha2Nome || 'Não informado'} (CPF: ${dataToPrint.testemunha2CPF || 'Não informado'})`
    ];
    y = drawCard(doc, y, 'DADOS DAS TESTEMUNHAS', testemunhasContent, 15);

    // Footer - positioned at the bottom of the last content page
    doc.setFontSize(8);
    doc.setFont("helvetica", "italic");
    doc.setTextColor('#555555'); // Slightly lighter color for footer
    doc.text('Cartório de Registro Civil – Jacaraú/PB', doc.internal.pageSize.getWidth() / 2, doc.internal.pageSize.getHeight() - 10, { align: 'center' });

    doc.save(`Pre-Cadastro-Casamento.pdf`);
};

const HabilitaFacilTool = ({ onBackToLanding }) => {
    const [formData, setFormData] = React.useState({
        tipoCasamento: 'Civil',
        localCelebracao: '',
        autoridadeReligiosa: '',
        noivo1Nome: '',
        noivo1CPF: '',
        noivo1DataNascimento: '',
        noivo1Nacionalidade: '',
        noivo1Naturalidade: '',
        noivo1EstadoCivil: '',
        noivo1Profissao: '',
        noivo1NomeMae: '',
        noivo1NomePai: '',
        noivo1Endereco: '',
        noivo1Contato: '',
        noivo2Nome: '',
        noivo2CPF: '',
        noivo2DataNascimento: '',
        noivo2Nacionalidade: '',
        noivo2Naturalidade: '',
        noivo2EstadoCivil: '',
        noivo2Profissao: '',
        noivo2NomeMae: '',
        noivo2NomePai: '',
        noivo2Endereco: '',
        noivo2Contato: '',
        regimeBens: '',
        alteracaoNome: 'Não',
        novoNome: '',
        dataCasamento: '',
        horarioCasamento: '',
        testemunha1Nome: '',
        testemunha1CPF: '',
        testemunha2Nome: '',
        testemunha2CPF: '',
    });

    const [showReligiousFields, setShowReligiousFields] = React.useState(false);
    const [showNewNameField, setShowNewNameField] = React.useState(false);
    const [messageBox, setMessageBox] = React.useState(null);

    // useEffect to initialize Lucide icons after component mounts and updates
    React.useEffect(() => {
        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }
    }, []); // Empty dependency array means this runs once after initial render

    // Handle form field changes
    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    // Handle radio button changes for marriage type
    const handleMarriageTypeChange = (e) => {
        const { value } = e.target;
        setFormData(prev => ({ ...prev, tipoCasamento: value }));
        setShowReligiousFields(value === 'Religioso com Efeito Civil');
    };

    // Handle name change selection
    const handleAlteracaoNomeChange = (e) => {
        const { value } = e.target;
        setFormData(prev => ({ ...prev, alteracaoNome: value }));
        setShowNewNameField(value === 'Sim');
        if (value === 'Não') {
            setFormData(prev => ({ ...prev, novoNome: '' })); // Clear new name if not altering
        }
    };

    // Form submission handler
    const handleSubmit = (e) => {
        e.preventDefault();

        let requiredFields = [
            'noivo1Nome', 'noivo1CPF', 'noivo1DataNascimento', 'noivo1Nacionalidade', 'noivo1Naturalidade', 'noivo1EstadoCivil', 'noivo1Profissao', 'noivo1NomeMae', 'noivo1Endereco', 'noivo1Contato',
            'noivo2Nome', 'noivo2CPF', 'noivo2DataNascimento', 'noivo2Nacionalidade', 'noivo2Naturalidade', 'noivo2EstadoCivil', 'noivo2Profissao', 'noivo2NomeMae', 'noivo2Endereco', 'noivo2Contato',
            'regimeBens', 'alteracaoNome', 'dataCasamento', 'horarioCasamento',
            'testemunha1Nome', 'testemunha1CPF', 'testemunha2Nome', 'testemunha2CPF'
        ];

        let allFieldsFilled = true;

        if (formData.tipoCasamento === 'Religioso com Efeito Civil') {
            requiredFields.push('localCelebracao', 'autoridadeReligiosa');
        }

        for (const field of requiredFields) {
            const element = document.getElementById(field); // Get element by ID for validation styling
            if (!formData[field] || String(formData[field]).trim() === '') {
                allFieldsFilled = false;
                if (element) element.style.borderColor = 'red';
            } else {
                if (element) element.style.borderColor = '#D8D8D8'; // Reset border color
            }
        }

        if (formData.alteracaoNome === 'Sim' && (!formData.novoNome || String(formData.novoNome).trim() === '')) {
            allFieldsFilled = false;
            const novoNomeElement = document.getElementById('novoNome');
            if (novoNomeElement) novoNomeElement.style.borderColor = 'red';
        } else if (formData.alteracaoNome === 'Não') {
            const novoNomeElement = document.getElementById('novoNome');
            if (novoNomeElement) novoNomeElement.style.borderColor = '#D8D8D8';
        }


        if (!allFieldsFilled) {
            setMessageBox({
                title: 'Atenção!',
                message: 'Por favor, preencha todos os campos obrigatórios antes de gerar o PDF.'
            });
            return;
        }

        generatePdf(formData, showMessageBox); // Pass showMessageBox to PDF function

        // Optionally clear the form after successful submission
        setFormData({
            tipoCasamento: 'Civil',
            localCelebracao: '',
            autoridadeReligiosa: '',
            noivo1Nome: '',
            noivo1CPF: '',
            noivo1DataNascimento: '',
            noivo1Nacionalidade: '',
            noivo1Naturalidade: '',
            noivo1EstadoCivil: '',
            noivo1Profissao: '',
            noivo1NomeMae: '',
            noivo1NomePai: '',
            noivo1Endereco: '',
            noivo1Contato: '',
            noivo2Nome: '',
            noivo2CPF: '',
            noivo2DataNascimento: '',
            noivo2Nacionalidade: '',
            noivo2Naturalidade: '',
            noivo2EstadoCivil: '',
            noivo2Profissao: '',
            noivo2NomeMae: '',
            noivo2NomePai: '',
            noivo2Endereco: '',
            noivo2Contato: '',
            regimeBens: '',
            alteracaoNome: 'Não',
            novoNome: '',
            dataCasamento: '',
            horarioCasamento: '',
            testemunha1Nome: '',
            testemunha1CPF: '',
            testemunha2Nome: '',
            testemunha2CPF: '',
        });
        setShowReligiousFields(false);
        setShowNewNameField(false);
    };

    return (
        <section className="habilita-tool-section container">
            <div className="text-center mb-8">
                <button onClick={onBackToLanding} className="cta-button">
                    <i data-lucide="arrow-left" className="w-6 h-6"></i>
                    Voltar para a Consultoria
                </button>
            </div>
            <header className="header">
                <i data-lucide="heart" className="w-10 h-10 text-[#A0522D]"></i>
                <h1>Habilita Fácil – Cadastro de Casamento</h1>
            </header>

            {/* CHECKLIST INTERATIVO DE DOCUMENTOS */}
            <section className="card-section">
                <h2 className="section-title">
                    <i data-lucide="clipboard-check" className="w-7 h-7 text-[#A0522D]"></i>
                    1. Checklist Interativo de Documentos
                </h2>
                <div className="space-y-3">
                    <div className="checkbox-item">
                        <input type="checkbox" id="doc1" />
                        <label htmlFor="doc1" className="text-gray-700">Identidade e CPF originais de ambos os noivos(as)</label>
                    </div>
                    <div className="checkbox-item">
                        <input type="checkbox" id="doc2" />
                        <label htmlFor="doc2" className="text-gray-700">Certidão de nascimento ou casamento com averbação de divórcio</label>
                    </div>
                    <div className="checkbox-item">
                        <input type="checkbox" id="doc3" />
                        <label htmlFor="doc3" className="text-gray-700">Comprovante de residência de ambos</label>
                    </div>
                    <div className="checkbox-item">
                        <input type="checkbox" id="doc4" />
                        <label htmlFor="doc4" className="text-gray-700">Documentos das testemunhas (nome completo e CPF)</label>
                    </div>
                    <div className="checkbox-item">
                        <input type="checkbox" id="doc5" />
                        <label htmlFor="doc5" className="text-gray-700">Pacto antenupcial (se houver regime diverso do legal)</label>
                    </div>
                </div>
            </section>

            {/* FORMULÁRIO DE DADOS DO CASAL */}
            <section className="card-section">
                <h2 className="section-title">
                    <i data-lucide="users" className="w-7 h-7 text-[#A0522D]"></i>
                    2. Formulário de Dados do Casal
                </h2>
                <form onSubmit={handleSubmit} className="space-y-8">

                    {/* Tipo de Casamento */}
                    <div className="p-5 bg-gray-50 rounded-xl shadow-sm border border-gray-100">
                        <h3 className="sub-section-title">
                            <i data-lucide="heart" className="w-5 h-5 text-[#A0522D]"></i>
                            Tipo de Casamento
                        </h3>
                        <div className="flex flex-col md:flex-row gap-6">
                            <div className="flex items-center">
                                <input type="radio" id="casamentoCivil" name="tipoCasamento" value="Civil" className="form-radio"
                                    checked={formData.tipoCasamento === 'Civil'} onChange={handleMarriageTypeChange} />
                                <label htmlFor="casamentoCivil" className="ml-2 text-gray-700">Civil</label>
                            </div>
                            <div className="flex items-center">
                                <input type="radio" id="casamentoReligioso" name="tipoCasamento" value="Religioso com Efeito Civil" className="form-radio"
                                    checked={formData.tipoCasamento === 'Religioso com Efeito Civil'} onChange={handleMarriageTypeChange} />
                                <label htmlFor="casamentoReligioso" className="ml-2 text-gray-700">Religioso com Efeito Civil</label>
                            </div>
                        </div>
                    </div>

                    {/* Campos Condicionais para Casamento Religioso */}
                    {showReligiousFields && (
                        <div id="camposReligioso" className="p-5 bg-gray-50 rounded-xl shadow-sm border border-gray-100">
                            <h3 className="sub-section-title">
                                <i data-lucide="church" className="w-5 h-5 text-[#A0522D]"></i>
                                Detalhes da Celebração Religiosa
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="form-group">
                                    <label htmlFor="localCelebracao">Local de celebração:</label>
                                    <input type="text" id="localCelebracao" name="localCelebracao" value={formData.localCelebracao} onChange={handleChange} />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="autoridadeReligiosa">Nome da autoridade religiosa:</label>
                                    <input type="text" id="autoridadeReligiosa" name="autoridadeReligiosa" value={formData.autoridadeReligiosa} onChange={handleChange} />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Noivo(a) 1 */}
                    <div className="p-5 bg-gray-50 rounded-xl shadow-sm border border-gray-100">
                        <h3 className="sub-section-title">
                            <i data-lucide="user" className="w-5 h-5 text-[#A0522D]"></i>
                            Dados do(a) Noivo(a) 1
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="form-group">
                                <label htmlFor="noivo1Nome">Nome completo:</label>
                                <input type="text" id="noivo1Nome" name="noivo1Nome" value={formData.noivo1Nome} onChange={handleChange} required />
                            </div>
                            <div className="form-group">
                                <label htmlFor="noivo1CPF">CPF:</label>
                                <input type="text" id="noivo1CPF" name="noivo1CPF" value={formData.noivo1CPF} onChange={handleChange} required />
                            </div>
                            <div className="form-group">
                                <label htmlFor="noivo1DataNascimento">Data de nascimento:</label>
                                <input type="date" id="noivo1DataNascimento" name="noivo1DataNascimento" value={formData.noivo1DataNascimento} onChange={handleChange} required />
                            </div>
                            <div className="form-group">
                                <label htmlFor="noivo1Nacionalidade">Nacionalidade:</label>
                                <input type="text" id="noivo1Nacionalidade" name="noivo1Nacionalidade" value={formData.noivo1Nacionalidade} onChange={handleChange} required />
                            </div>
                            <div className="form-group">
                                <label htmlFor="noivo1Naturalidade">Naturalidade:</label>
                                <input type="text" id="noivo1Naturalidade" name="noivo1Naturalidade" value={formData.noivo1Naturalidade} onChange={handleChange} required />
                            </div>
                            <div className="form-group">
                                <label htmlFor="noivo1EstadoCivil">Estado civil:</label>
                                <select id="noivo1EstadoCivil" name="noivo1EstadoCivil" value={formData.noivo1EstadoCivil} onChange={handleChange} required>
                                    <option value="">Selecione</option>
                                    <option value="Solteiro(a)">Solteiro(a)</option>
                                    <option value="Divorciado(a)">Divorciado(a)</option>
                                    <option value="Viúvo(a)">Viúvo(a)</option>
                                    <option value="União Estável">União Estável</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label htmlFor="noivo1Profissao">Profissão:</label>
                                <input type="text" id="noivo1Profissao" name="noivo1Profissao" value={formData.noivo1Profissao} onChange={handleChange} required />
                            </div>
                            <div className="form-group">
                                <label htmlFor="noivo1NomeMae">Nome da mãe:</label>
                                <input type="text" id="noivo1NomeMae" name="noivo1NomeMae" value={formData.noivo1NomeMae} onChange={handleChange} required />
                            </div>
                            <div className="form-group">
                                <label htmlFor="noivo1NomePai">Nome do pai:</label>
                                <input type="text" id="noivo1NomePai" name="noivo1NomePai" value={formData.noivo1NomePai} onChange={handleChange} />
                            </div>
                            <div className="form-group md:col-span-2">
                                <label htmlFor="noivo1Endereco">Endereço completo:</label>
                                <input type="text" id="noivo1Endereco" name="noivo1Endereco" value={formData.noivo1Endereco} onChange={handleChange} required />
                            </div>
                            <div className="form-group md:col-span-2">
                                <label htmlFor="noivo1Contato">Contato (Telefone/Email):</label>
                                <input type="text" id="noivo1Contato" name="noivo1Contato" value={formData.noivo1Contato} onChange={handleChange} />
                            </div>
                        </div>
                    </div>

                    {/* Noivo(a) 2 */}
                    <div className="p-5 bg-gray-50 rounded-xl shadow-sm border border-gray-100">
                        <h3 className="sub-section-title">
                            <i data-lucide="user" className="w-5 h-5 text-[#A0522D]"></i>
                            Dados do(a) Noivo(a) 2
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="form-group">
                                <label htmlFor="noivo2Nome">Nome completo:</label>
                                <input type="text" id="noivo2Nome" name="noivo2Nome" value={formData.noivo2Nome} onChange={handleChange} required />
                            </div>
                            <div className="form-group">
                                <label htmlFor="noivo2CPF">CPF:</label>
                                <input type="text" id="noivo2CPF" name="noivo2CPF" value={formData.noivo2CPF} onChange={handleChange} required />
                            </div>
                            <div className="form-group">
                                <label htmlFor="noivo2DataNascimento">Data de nascimento:</label>
                                <input type="date" id="noivo2DataNascimento" name="noivo2DataNascimento" value={formData.noivo2DataNascimento} onChange={handleChange} required />
                            </div>
                            <div className="form-group">
                                <label htmlFor="noivo2Nacionalidade">Nacionalidade:</label>
                                <input type="text" id="noivo2Nacionalidade" name="noivo2Nacionalidade" value={formData.noivo2Nacionalidade} onChange={handleChange} required />
                            </div>
                            <div className="form-group">
                                <label htmlFor="noivo2Naturalidade">Naturalidade:</label>
                                <input type="text" id="noivo2Naturalidade" name="noivo2Naturalidade" value={formData.noivo2Naturalidade} onChange={handleChange} required />
                            </div>
                            <div className="form-group">
                                <label htmlFor="noivo2EstadoCivil">Estado civil:</label>
                                <select id="noivo2EstadoCivil" name="noivo2EstadoCivil" value={formData.noivo2EstadoCivil} onChange={handleChange} required>
                                    <option value="">Selecione</option>
                                    <option value="Solteiro(a)">Solteiro(a)</option>
                                    <option value="Divorciado(a)">Divorciado(a)</option>
                                    <option value="Viúvo(a)">Viúvo(a)</option>
                                    <option value="União Estável">União Estável</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label htmlFor="noivo2Profissao">Profissão:</label>
                                <input type="text" id="noivo2Profissao" name="noivo2Profissao" value={formData.noivo2Profissao} onChange={handleChange} required />
                            </div>
                            <div className="form-group">
                                <label htmlFor="noivo2NomeMae">Nome da mãe:</label>
                                <input type="text" id="noivo2NomeMae" name="noivo2NomeMae" value={formData.noivo2NomeMae} onChange={handleChange} required />
                            </div>
                            <div className="form-group">
                                <label htmlFor="noivo2NomePai">Nome do pai:</label>
                                <input type="text" id="noivo2NomePai" name="noivo2NomePai" value={formData.noivo2NomePai} onChange={handleChange} />
                            </div>
                            <div className="form-group md:col-span-2">
                                <label htmlFor="noivo2Endereco">Endereço completo:</label>
                                <input type="text" id="noivo2Endereco" name="noivo2Endereco" value={formData.noivo2Endereco} onChange={handleChange} required />
                            </div>
                            <div className="form-group md:col-span-2">
                                <label htmlFor="noivo2Contato">Contato (Telefone/Email):</label>
                                <input type="text" id="noivo2Contato" name="noivo2Contato" value={formData.noivo2Contato} onChange={handleChange} />
                            </div>
                        </div>
                    </div>

                    {/* Regime de Bens e Alteração de Nome */}
                    <div className="p-5 bg-gray-50 rounded-xl shadow-sm border border-gray-100">
                        <h3 className="sub-section-title">
                            <i data-lucide="wallet" className="w-5 h-5 text-[#A0522D]"></i>
                            Regime de Bens e Alteração de Nome
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="form-group">
                                <label htmlFor="regimeBens">Regime de bens escolhido:</label>
                                <select id="regimeBens" name="regimeBens" value={formData.regimeBens} onChange={handleChange} required>
                                    <option value="">Selecione</option>
                                    <option value="Comunhão parcial">Comunhão parcial</option>
                                    <option value="Comunhão universal">Comunhão universal</option>
                                    <option value="Separação total">Separação total</option>
                                    <option value="Participação final nos aquestos">Participação final nos aquestos</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label htmlFor="alteracaoNome">Haverá alteração de nome?</label>
                                <select id="alteracaoNome" name="alteracaoNome" value={formData.alteracaoNome} onChange={handleAlteracaoNomeChange} required>
                                    <option value="Não">Não</option>
                                    <option value="Sim">Sim</option>
                                </select>
                            </div>
                            {showNewNameField && (
                                <div className="form-group md:col-span-2">
                                    <label htmlFor="novoNome">Novo nome (se houver alteração):</label>
                                    <input type="text" id="novoNome" name="novoNome" value={formData.novoNome} onChange={handleChange} />
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Data e Horário Pretendidos */}
                    <div className="p-5 bg-gray-50 rounded-xl shadow-sm border border-gray-100">
                        <h3 className="sub-section-title">
                            <i data-lucide="calendar" className="w-5 h-5 text-[#A0522D]"></i>
                            Data e Horário Pretendidos
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="form-group">
                                <label htmlFor="dataCasamento">Data pretendida para o casamento:</label>
                                <input type="date" id="dataCasamento" name="dataCasamento" value={formData.dataCasamento} onChange={handleChange} required />
                            </div>
                            <div className="form-group">
                                <label htmlFor="horarioCasamento">Horário pretendido:</label>
                                <input type="time" id="horarioCasamento" name="horarioCasamento" value={formData.horarioCasamento} onChange={handleChange} required />
                            </div>
                        </div>
                    </div>

                    {/* Testemunhas */}
                    <div className="p-5 bg-gray-50 rounded-xl shadow-sm border border-gray-100">
                        <h3 className="sub-section-title">
                            <i data-lucide="users-round" className="w-5 h-5 text-[#A0522D]"></i>
                            Dados das Testemunhas
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="form-group">
                                <label htmlFor="testemunha1Nome">Nome completo Testemunha 1:</label>
                                <input type="text" id="testemunha1Nome" name="testemunha1Nome" value={formData.testemunha1Nome} onChange={handleChange} required />
                            </div>
                            <div className="form-group">
                                <label htmlFor="testemunha1CPF">CPF Testemunha 1:</label>
                                <input type="text" id="testemunha1CPF" name="testemunha1CPF" value={formData.testemunha1CPF} onChange={handleChange} required />
                            </div>
                            <div className="form-group">
                                <label htmlFor="testemunha2Nome">Nome completo Testemunha 2:</label>
                                <input type="text" id="testemunha2Nome" name="testemunha2Nome" value={formData.testemunha2Nome} onChange={handleChange} required />
                            </div>
                            <div className="form-group">
                                <label htmlFor="testemunha2CPF">CPF Testemunha 2:</label>
                                <input type="text" id="testemunha2CPF" name="testemunha2CPF" value={formData.testemunha2CPF} onChange={handleChange} required />
                            </div>
                        </div>
                    </div>

                    <div className="text-center mt-8">
                        <button type="submit" className="btn-primary">
                            <i data-lucide="file-text" className="w-5 h-5"></i>
                            Gerar PDF
                        </button>
                    </div>
                </form>
            </section>

            {messageBox && (
                <MessageBox
                    title={messageBox.title}
                    message={messageBox.message}
                    onClose={() => setMessageBox(null)}
                />
            )}
        </section>
    );
};

export default HabilitaFacilTool;
