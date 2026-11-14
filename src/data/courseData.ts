import { BonusContent, CourseModule, Lesson } from '../types/course';

export const PLATFORM_NAME = 'IMPÉRIO DIGITAL';
export const PLATFORM_SLOGAN = 'Aprende. Executa. Vende. Escala.';

export function extractYoutubeId(url: string): string {
  try {
    const parsed = new URL(url);
    if (parsed.hostname.includes('youtu.be')) {
      return parsed.pathname.replace('/', '').trim();
    }
    const vParam = parsed.searchParams.get('v');
    if (vParam) return vParam.trim();
    const parts = parsed.pathname.split('/').filter(Boolean);
    return parts[parts.length - 1] ?? '';
  } catch {
    const match = url.match(/(?:youtu\.be\/|v=|\/embed\/)([A-Za-z0-9_-]{11})/);
    return match ? match[1] : '';
  }
}

export function getYoutubeThumbnail(youtubeId: string): string {
  return `https://i.ytimg.com/vi/${youtubeId}/hqdefault.jpg`;
}

function createLesson(
  moduleNumber: number,
  lessonNumber: number,
  title: string,
  youtubeUrl: string
): Lesson {
  const padded = String(lessonNumber).padStart(2, '0');
  return {
    id: `m${moduleNumber}-a${padded}`,
    number: lessonNumber,
    title,
    youtubeUrl,
    youtubeId: extractYoutubeId(youtubeUrl),
  };
}

export const COURSE_MODULES: CourseModule[] = [
  {
    id: 'modulo-1',
    number: 1,
    coverKey: 'module-1',
    shortTitle: 'Materiais do Módulo 1',
    title: 'Materiais do Módulo 1',
    subtitle: 'Base documental, guias e recursos essenciais',
    description:
      'Acede à pasta organizada com todos os documentos, modelos e materiais de apoio fundamentais para iniciar a tua jornada no Império Digital com estrutura.',
    type: 'materials',
    driveUrl: 'https://drive.google.com/drive/folders/1WLswJGn1gG7w57BASU0boJXkDtS_Ci8r',
    lessons: [],
  },
  {
    id: 'modulo-2',
    number: 2,
    coverKey: 'module-2',
    shortTitle: 'Criação de Produtos com IA',
    title: 'Criação de Produtos com Inteligência Artificial',
    subtitle: 'Produtos Low Ticket e Infoprodutos',
    description:
      'Domina a criação estratégica de produtos digitais de alta procura utilizando inteligência artificial para estruturar ofertas Low Ticket e Infoprodutos prontos a vender.',
    type: 'video',
    lessons: [
      createLesson(
        2,
        1,
        'Aula 01 — Fundamentos da Criação com Inteligência Artificial',
        'https://youtu.be/ChTrFedFha0?si=NTSXO0CL5hpGl3m-'
      ),
      createLesson(
        2,
        2,
        'Aula 02 — Estruturação de Produtos Low Ticket',
        'https://youtu.be/PaRAOuolB2s?si=ZsnENNHP1vy_3crR'
      ),
      createLesson(
        2,
        3,
        'Aula 03 — Montagem e Empacotamento de Infoprodutos',
        'https://youtu.be/iqweLe3E3r0?si=a3gBCNE_RkDX12SL'
      ),
    ],
  },
  {
    id: 'modulo-3',
    number: 3,
    coverKey: 'module-3',
    shortTitle: 'Produtos Vencedores & Clonagem',
    title: 'Produtos Vencedores e Clonagem',
    subtitle: 'Pesquisa, análise de ofertas e clonagem ética',
    description:
      'Aprende a identificar produtos com tração comprovada no mercado, dissecar ofertas vencedoras e aplicar técnicas eficazes de modelagem e clonagem.',
    type: 'video',
    lessons: [
      createLesson(
        3,
        1,
        'Aula 01 — Como Encontrar Produtos Vencedores',
        'https://youtu.be/dLLDJFlO7Hg?si=XqnpxVDgu8ZEBMBa'
      ),
      createLesson(
        3,
        2,
        'Aula 02 — Análise Profunda de Ofertas e Ângulos',
        'https://youtu.be/Wn2LULIjHi4?si=xhvbH9RA2sDql1VY'
      ),
      createLesson(
        3,
        3,
        'Aula 03 — Técnicas Práticas de Clonagem de Produtos',
        'https://youtu.be/_A3P2PCu5KI?si=JckqcZzP-7w-gghH'
      ),
      createLesson(
        3,
        4,
        'Aula 04 — Validação e Adaptação para Conversão',
        'https://youtu.be/2L-RN8B_jCk?si=CPcr64X_u3fF0zB2'
      ),
    ],
  },
  {
    id: 'modulo-4',
    number: 4,
    coverKey: 'module-4',
    shortTitle: 'Páginas de Vendas & X1',
    title: 'Páginas de Vendas e Vendas no X1',
    subtitle: 'Landing Pages com IA e fechamento 1 a 1',
    description:
      'Constrói páginas de vendas persuasivas com apoio de inteligência artificial e domina scripts e táticas de vendas diretas no X1 para multiplicar conversões.',
    type: 'video',
    lessons: [
      createLesson(
        4,
        1,
        'Aula 01 — Criação de Páginas de Vendas com IA',
        'https://youtu.be/eaTam6SoKUQ?si=wbLMnD5XOnpgsYPo'
      ),
      createLesson(
        4,
        2,
        'Aula 02 — Arquitetura de Landing Pages de Alta Conversão',
        'https://youtu.be/OT-Glmle2T4?si=ZB1v_N4DUWra0jZ2'
      ),
      createLesson(
        4,
        3,
        'Aula 03 — Estratégias de Atendimento e Vendas no X1',
        'https://youtu.be/wtJ0RmcBJFU?si=uxeZU0JUQ0Yrg_jG'
      ),
      createLesson(
        4,
        4,
        'Aula 04 — Fechamento, Objeções e Follow-Up no X1',
        'https://youtu.be/MCZ9UA2bwkU?si=UnX3oEMg9wTM1sld'
      ),
    ],
  },
  {
    id: 'modulo-5',
    number: 5,
    coverKey: 'module-5',
    shortTitle: 'Tráfego Pago & Compradores',
    title: 'Tráfego Pago e Aquisição de Compradores',
    subtitle: 'Campanhas, segmentação e otimização de vendas',
    description:
      'Domina a compra de tráfego qualificado do zero à otimização avançada para atrair compradores reais todos os dias e aumentar o retorno das campanhas.',
    type: 'video',
    lessons: [
      createLesson(
        5,
        1,
        'Aula 01 — Fundamentos do Tráfego Pago e Aquisição',
        'https://youtu.be/6BHDWv9tHyM?si=hWvHxRwX_Tgys0UI'
      ),
      createLesson(
        5,
        2,
        'Aula 02 — Estrutura de Contas e Preparação Inicial',
        'https://youtu.be/1wPlkcSXQP0?si=aQChwpquwJ47srN_'
      ),
      createLesson(
        5,
        3,
        'Aula 03 — Segmentação e Público Comprador',
        'https://youtu.be/VX5Fu8Epuk8?si=R2P-rlWoD9KsAwV5'
      ),
      createLesson(
        5,
        4,
        'Aula 04 — Criação de Criativos que Convertem',
        'https://youtu.be/d5VIPmXUm5M?si=WQD4MYF-Use4P-uQ'
      ),
      createLesson(
        5,
        5,
        'Aula 05 — Configuração Passo a Passo da Campanha',
        'https://youtu.be/CZU9kbJW-Hw?si=58UpGNWvsJp4gQzx'
      ),
      createLesson(
        5,
        6,
        'Aula 06 — Leitura de Métricas e Diagnóstico',
        'https://youtu.be/WWxjPFvAff0?si=xk52KxnudNvkYhdJ'
      ),
      createLesson(
        5,
        7,
        'Aula 07 — Testes de Conjuntos e Otimização de CPA',
        'https://youtu.be/xMOFh6E4cB8?si=qKHT66vjlGcG_FhL'
      ),
      createLesson(
        5,
        8,
        'Aula 08 — Remarketing e Recuperação de Interessados',
        'https://youtu.be/krwRysoDYzA?si=Wdkckc026eqhoH5a'
      ),
      createLesson(
        5,
        9,
        'Aula 09 — Consistência Diária e Ajustes de Orçamento',
        'https://youtu.be/yuK6LKX2gFY?si=XvFBeKr8xZO_TtdW'
      ),
      createLesson(
        5,
        10,
        'Aula 10 — Estratégias Avançadas de Aquisição',
        'https://youtu.be/4pMeNdFJyLQ?si=9xB-gwe8I4i5Q8KZ'
      ),
    ],
  },
  {
    id: 'modulo-6',
    number: 6,
    coverKey: 'module-6',
    shortTitle: 'Escalagem do Produto Vencedor',
    title: 'Escalagem do Produto Vencedor',
    subtitle: 'Volume de vendas, margem e crescimento previsível',
    description:
      'Aplica métodos comprovados para escalar ofertas validadas com segurança, multiplicar o volume diário de pedidos e maximizar os resultados do teu negócio.',
    type: 'video',
    lessons: [
      createLesson(
        6,
        1,
        'Aula 01 — Critérios para Iniciar a Escalagem Segura',
        'https://youtu.be/vMohRXf648c?si=TyI9-avBY_nUJKvH'
      ),
      createLesson(
        6,
        2,
        'Aula 02 — Escala Horizontal e Vertical de Campanhas',
        'https://youtu.be/1XfagUU5Pi0?si=W2u6Xr2O_ZswR8JB'
      ),
      createLesson(
        6,
        3,
        'Aula 03 — Sustentação de Resultados e Lucro Líquido',
        'https://youtu.be/nXwlFLv6oYY?si=HqXH4w3a3Du6K2JK'
      ),
    ],
  },
];

export const BONUS_CONTENTS: BonusContent[] = [
  {
    id: 'bonus-1',
    number: 1,
    coverKey: 'bonus-1',
    shortTitle: 'Importar das Fábricas',
    title: 'Bónus 1 — Importar Diretamente das Fábricas',
    description:
      'Material de formação completo sobre negociação direta com fabricantes, controlo de qualidade e redução máxima de custos por unidade.',
    highlights: ['Negociação direta', 'Controlo de produção', 'Margens superiores'],
    driveUrl: 'https://drive.google.com/drive/folders/1ECWA8c9mwTpkHlKYyzoLxFJp_jS6m2gK',
    actionLabel: 'Abrir Material no Drive',
  },
  {
    id: 'bonus-2',
    number: 2,
    coverKey: 'bonus-2',
    shortTitle: 'Plataformas Internacionais',
    title: 'Bónus 2 — Importação Através de Plataformas Internacionais',
    description:
      'Aprende o processo seguro para comprar, validar fornecedores e importar através das maiores plataformas globais.',
    highlights: ['Alibaba', 'AliExpress', 'eBay'],
    driveUrl: 'https://drive.google.com/drive/folders/1qgrGsYDaLD_AGYrcMntYazmOVGyFrL8F',
    actionLabel: 'Abrir Material no Drive',
  },
  {
    id: 'bonus-3',
    number: 3,
    coverKey: 'bonus-3',
    shortTitle: 'Lista de Fornecedores',
    title: 'Bónus 3 — Lista de Fornecedores',
    description:
      'Acesso direto à lista selecionada de fornecedores verificados para acelerar o processo de importação e lançamento de produtos.',
    highlights: ['Fornecedores verificados', 'Acesso imediato', 'Documento exclusivo'],
    driveUrl: 'https://drive.google.com/file/d/1q_ohknkq9VQ4SbZrOoa3w5va9E36xFza/view?usp=drivesdk',
    actionLabel: 'Abrir Lista Exclusiva',
  },
];
