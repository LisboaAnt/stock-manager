# Documento de Especificação do Sistema de Estoque

## 1. Definição do contexto do sistema
- **Objetivo**: Gerir produtos e seus saldos de estoque, controlando entradas, saídas, ajustes, consulta de saldos e rastreabilidade das movimentações, com autenticação e perfis de acesso.
- **Atores principais**:
  - **Administrador**: gerencia usuários, permissões, parâmetros e todos os cadastros.
  - **Operador de Estoque**: executa cadastros de produtos e movimentações (entradas, saídas e ajustes) e consulta relatórios.
  - **Financeiro (opcional)**: consulta relatórios e exporta dados.
- **Fronteiras do sistema**:
  - UI Web (Next.js) para operação e visualização.
  - API (serverless/Express) para regras de negócio e persistência (atualmente com modo mock em produção).
- **Integrações (atuais/previstas)**:
  - Autenticação JWT (simulada/fictícia quando sem banco).
  - Importação/Exportação CSV/JSON (prevista).
  - Futuro ERP/Contábil (previsto, via REST/Webhooks).

## 2. Especificação de requisitos

### 2.1 Requisitos funcionais (RF)
1. RF-01: Autenticar usuário por e-mail e senha.
2. RF-02: Encerrar sessão/invalidar credenciais (logout).
3. RF-03: Manter usuários (criar/editar/ativar/desativar) e perfis (Administrador, Operador, Financeiro).
4. RF-04: Manter produtos (criar, listar, buscar, editar, excluir).
5. RF-05: Classificar produtos por categoria.
6. RF-06: Manter fornecedores e relacioná-los a produtos (opcional na 1ª versão).
7. RF-07: Registrar entrada de estoque (compra, devolução de cliente, ajuste positivo).
8. RF-08: Registrar saída de estoque (venda, perda, ajuste negativo).
9. RF-09: Realizar ajustes de inventário (acerto de contagem física).
10. RF-10: Consultar saldo atual por produto e histórico de movimentações.
11. RF-11: Pesquisar e filtrar produtos por nome, categoria, fornecedor e faixa de estoque.
12. RF-12: Gerar relatórios (movimentações por período, estoque atual, curva ABC futura).
13. RF-13: Exportar relatórios em CSV/JSON.
14. RF-14: Importar cadastros de produtos via CSV (validando dados).
15. RF-15: Auditar operações (quem fez o quê e quando).

### 2.2 Requisitos não funcionais (RNF)
1. RNF-01: Segurança: comunicação HTTPS; proteção de endpoints; sanitização de entradas.
2. RNF-02: Autorização por perfil; acesso mínimo necessário.
3. RNF-03: Disponibilidade: 99% mensal (meta para produção).
4. RNF-04: Desempenho: páginas principais < 2s p95 com até 10k produtos.
5. RNF-05: Escalabilidade horizontal na camada de API (serverless na Vercel).
6. RNF-06: Usabilidade: UI responsiva e consistente (MUI/Tailwind), acessível.
7. RNF-07: Observabilidade: logs de requisições/erros; correlação de requisições.
8. RNF-08: Privacidade/Conformidade: armazenamento de senhas com hash quando banco estiver ativo; política de retenção de logs.
9. RNF-09: Compatibilidade: navegadores modernos; API REST JSON.
10. RNF-10: Internacionalização preparada (pt-BR como default).

## 3. Modelagem de casos de uso (UML)

```mermaid
usecaseDiagram
actor Administrador as ADM
actor "Operador de Estoque" as OPE
actor Financeiro as FIN

ADM -- (Gerenciar Usuários)
ADM -- (Gerenciar Perfis/Permissões)

OPE -- (Autenticar)
OPE -- (Gerenciar Produtos)
OPE -- (Registrar Entrada)
OPE -- (Registrar Saída)
OPE -- (Ajustar Inventário)
OPE -- (Consultar Saldo / Histórico)

FIN -- (Gerar Relatórios)
FIN -- (Exportar Dados)

(Autenticar) <.. (Gerenciar Usuários) : «include»
(Gerenciar Produtos) <.. (Registrar Entrada) : «include»
(Gerenciar Produtos) <.. (Registrar Saída) : «include»
(Gerenciar Produtos) <.. (Ajustar Inventário) : «include»
(Gerar Relatórios) <.. (Exportar Dados) : «extend»
```

- Descrição resumida dos principais casos:
  - **Autenticar**: Usuário informa credenciais e obtém sessão/token.
  - **Gerenciar Produtos**: CRUD de produtos e categorização.
  - **Registrar Entrada/Saída**: cria movimentações e altera saldo.
  - **Ajustar Inventário**: acerta saldo com base em contagem física.
  - **Consultar Saldo/Histórico**: consulta estoque atual e trilha de auditoria.
  - **Gerar Relatórios/Exportar**: obtém relatórios e exporta.
  - **Gerenciar Usuários/Permissões**: administração de contas e perfis.

## 4. Diagrama de classes (UML)

```mermaid
classDiagram

class User {
  +id: number
  +email: string
  +passwordHash: string
  +role: Role
}

enum Role {
  ADMIN
  OPERATOR
  FINANCE
}

class Category {
  +id: number
  +name: string
}

class Supplier {
  +id: number
  +name: string
  +documentId: string
  +contactEmail: string
}

class Product {
  +id: number
  +name: string
  +description: string
  +price: number
  +imageUrl: string
  +stockQuantity: number
}

class StockMovement {
  +id: number
  +type: MovementType
  +date: Date
  +quantity: number
  +unitPrice: number
  +notes: string
}

enum MovementType {
  ENTRADA
  SAIDA
  AJUSTE
}

User "1" -- "*" StockMovement : performedBy
Product "1" -- "*" StockMovement : movements
Product "*" -- "1" Category
Product "*" -- "*" Supplier : supplies

class AuthService {
  +login(email, password): Token
}
class ProductService {
  +createProduct(...)
  +updateProduct(...)
  +deleteProduct(...)
  +listProducts(filter)
}
class StockService {
  +registerEntry(product, qty, price)
  +registerExit(product, qty, price)
  +adjustInventory(product, qty)
}
class ReportService {
  +stockSnapshot()
  +movementsByPeriod()
}

AuthService ..> User
ProductService ..> Product
StockService ..> Product
StockService ..> StockMovement
ReportService ..> Product
ReportService ..> StockMovement
```

- Observações:
  - O relacionamento de **Product–Supplier** pode ser N:N via tabela associativa (ex.: `ProductSupplier`).
  - O `stockQuantity` pode ser derivado (snapshot) ou mantido por trigger de movimentações.
  - `passwordHash` aplica-se quando o banco estiver habilitado; em modo mock, o login é simplificado.

---

Este documento descreve o escopo inicial e oferece base para evolução (banco real, perfis/autorizações completas, integrações e relatórios avançados).
