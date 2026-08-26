import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QuestionsInbox, getResponseTimerInfo, generateAiResponse } from '../components/QuestionsInbox';
import type { Question } from '../data/mockData';

const mockQuestions: Question[] = [
  {
    id: 'q-test-1',
    buyerName: 'Carlos Silva',
    productTitle: 'Teclado Gamer RGB',
    productMlId: 'MLB-999',
    productImage: 'https://example.com/keyboard.jpg',
    questionText: 'É compatível com macOS nativamente e vem com nota fiscal?',
    createdAt: new Date(Date.now() - 5 * 60 * 1000).toISOString(), // 5 mins ago
    status: 'unanswered',
    category: 'Compatibilidade',
    productDetails: {
      brand: 'Apex',
      model: 'RGB 100',
      warranty: '12 meses',
      inStock: true,
      fullShipping: true,
      invoiceProvided: true,
      compatibility: 'Windows e macOS',
    },
  },
  {
    id: 'q-test-2',
    buyerName: 'Maria Oliveira',
    productTitle: 'Monitor 27 Polegadas',
    productMlId: 'MLB-888',
    productImage: 'https://example.com/monitor.jpg',
    questionText: 'Qual a voltagem do produto?',
    createdAt: new Date(Date.now() - 90 * 60 * 1000).toISOString(), // 90 mins ago
    status: 'unanswered',
    category: 'Especificações',
    productDetails: {
      voltage: 'Bivolt 110V/220V',
      warranty: '6 meses',
    },
  },
  {
    id: 'q-test-3',
    buyerName: 'Joana Prado',
    productTitle: 'Teclado Gamer RGB',
    productMlId: 'MLB-999',
    productImage: 'https://example.com/keyboard.jpg',
    questionText: 'Tem pronta entrega no envio Full?',
    createdAt: '2026-08-20T10:00:00Z',
    status: 'answered',
    answerText: 'Olá Joana! Sim, temos em estoque no envio Full!',
    answeredAt: '2026-08-20T10:15:00Z',
    category: 'Envio',
  },
];

describe('getResponseTimerInfo', () => {
  it('identifies fast response times (<15 min)', () => {
    const dateStr = new Date(Date.now() - 10 * 60 * 1000).toISOString();
    const info = getResponseTimerInfo(dateStr);
    expect(info.urgency).toBe('fast');
    expect(info.timeAgo).toContain('10 min');
  });

  it('identifies warning response times (15-60 min)', () => {
    const dateStr = new Date(Date.now() - 30 * 60 * 1000).toISOString();
    const info = getResponseTimerInfo(dateStr);
    expect(info.urgency).toBe('warning');
  });

  it('identifies critical delayed response times (>60 min)', () => {
    const dateStr = new Date(Date.now() - 120 * 60 * 1000).toISOString();
    const info = getResponseTimerInfo(dateStr);
    expect(info.urgency).toBe('critical');
    expect(info.reputationText).toContain('Impacto na reputação');
  });
});

describe('generateAiResponse', () => {
  it('generates tailored response using question context and product attributes', () => {
    const response = generateAiResponse(mockQuestions[0]);
    expect(response).toContain('Carlos');
    expect(response).toContain('Windows e macOS');
    expect(response).toContain('Nota Fiscal');
  });
});

describe('QuestionsInbox Component', () => {
  it('renders question inbox and displays initial list of questions', () => {
    render(<QuestionsInbox questions={mockQuestions} />);

    expect(screen.getByText('Pre-Sales Buyer Questions Inbox')).toBeInTheDocument();
    expect(screen.getAllByText('Teclado Gamer RGB').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Monitor 27 Polegadas').length).toBeGreaterThan(0);
  });

  it('filters questions by status tabs', () => {
    render(<QuestionsInbox questions={mockQuestions} />);

    // Filter "Respondidas"
    const answeredFilterBtn = screen.getByRole('button', { name: /^Respondidas/i });
    fireEvent.click(answeredFilterBtn);

    expect(screen.getByText('Joana Prado')).toBeInTheDocument();
  });

  it('filters questions by search query', () => {
    render(<QuestionsInbox questions={mockQuestions} />);

    const searchInput = screen.getByPlaceholderText(/Buscar pergunta, produto, comprador/i);
    fireEvent.change(searchInput, { target: { value: 'Maria' } });

    expect(screen.getByText('Maria Oliveira')).toBeInTheDocument();
  });

  it('generates response when clicking "Gerar Resposta com IA"', async () => {
    render(<QuestionsInbox questions={mockQuestions} />);

    const aiButton = screen.getByRole('button', { name: /Gerar Resposta com IA/i });
    fireEvent.click(aiButton);

    await waitFor(() => {
      const textarea = screen.getByPlaceholderText(/Sua resposta editável aparecerá aqui/i) as HTMLTextAreaElement;
      expect(textarea.value).toContain('Carlos');
      expect(textarea.value).toContain('Windows e macOS');
    });
  });

  it('applies template chips into textarea', () => {
    render(<QuestionsInbox questions={mockQuestions} />);

    const templateBtn = screen.getByRole('button', { name: /Tem pronta entrega\?/i });
    fireEvent.click(templateBtn);

    const textarea = screen.getByPlaceholderText(/Sua resposta editável aparecerá aqui/i) as HTMLTextAreaElement;
    expect(textarea.value).toContain('pronta entrega');
    expect(textarea.value).toContain('Mercado Livre Full');
  });

  it('submits an answer and updates question status to answered', () => {
    render(<QuestionsInbox questions={mockQuestions} />);

    const templateBtn = screen.getByRole('button', { name: /Tem pronta entrega\?/i });
    fireEvent.click(templateBtn);

    const submitBtn = screen.getByRole('button', { name: /Enviar Resposta ao Comprador/i });
    fireEvent.click(submitBtn);

    expect(screen.getByText('Apex Tech Direct (Resposta Enviada)')).toBeInTheDocument();
  });
});
