Preciso evoluir o dashboard do sistema de restaurante adicionando uma nova seção analítica focada em:

* consumo de ingredientes
* CMV (Custo da Mercadoria Vendida)
* custo real de produção
* margem de lucro
* desperdício teórico
* eficiência operacional

O dashboard funciona baseado na seleção de:

* mês
* ano

Todos os gráficos e indicadores devem refletir os dados daquele período selecionado.

A ideia é transformar o dashboard em um painel gerencial completo para restaurante, permitindo entender:

* o que mais vende
* o que mais consome ingredientes
* o que dá mais lucro
* onde existem desperdícios
* quais pratos possuem baixa margem
* impacto do CMV no faturamento

Quero adicionar os seguintes componentes:

1. Cards KPI (topo do dashboard)
   Adicionar cards com:

* CMV total do mês
* margem média dos pratos
* custo total de produção
* ingrediente mais consumido
* prato mais lucrativo
* prato com menor margem
* desperdício teórico total
* percentual do CMV sobre faturamento

Os cards devem possuir:

* indicador visual de tendência
* comparação com mês anterior
* ícones coerentes com restaurante/financeiro
* destaque visual para indicadores críticos

2. Gráfico de consumo de ingredientes
   Criar um gráfico de barras horizontais mostrando:

* ingredientes mais consumidos no mês
* quantidade utilizada
* custo total consumido por ingrediente

Exemplo:

* arroz
* filé mignon
* batata
* queijo

O usuário deve conseguir visualizar rapidamente quais ingredientes possuem maior impacto financeiro.

3. Gráfico de CMV por categoria
   Criar um gráfico de pizza ou donut exibindo:

* distribuição do custo entre categorias

Exemplo:

* carnes
* bebidas
* frios
* acompanhamentos
* descartáveis

4. Gráfico de margem por prato
   Criar um gráfico comparando:

* faturamento do prato
* custo do prato
* margem líquida

Pode ser:

* barras agrupadas
* waterfall
* stacked bar

Objetivo:
identificar pratos que:

* vendem muito
* mas possuem baixa margem

5. Heatmap operacional
   Criar um heatmap:

* eixo X → horas do dia
* eixo Y → dias da semana
* intensidade → faturamento ou quantidade de pedidos

Objetivo:
identificar horários de pico e otimizar operação/cozinha/equipe.

6. Ranking de pratos
   Criar tabelas/cards para:

* pratos mais vendidos
* pratos mais lucrativos
* pratos com menor margem
* pratos com maior custo operacional

Cada item deve mostrar:

* quantidade vendida
* faturamento
* custo
* margem
* percentual de participação

7. Gráfico de desperdício teórico
   Criar visualização mostrando:

* ingredientes mais desperdiçados teoricamente
* custo potencial desperdiçado
* impacto financeiro do desperdício

Adicionar alertas visuais para desperdícios elevados.

8. Evolução temporal
   Adicionar gráficos de linha mostrando:

* evolução diária do CMV
* evolução diária do faturamento
* evolução diária da margem

Permitir comparar:

* mês atual
* mês anterior

9. Dashboard de engenharia de cardápio
   Adicionar uma seção inspirada em “menu engineering”.

Classificar pratos em quadrantes:

* Alta venda + Alta margem
* Alta venda + Baixa margem
* Baixa venda + Alta margem
* Baixa venda + Baixa margem

Os quadrantes devem possuir:

* visual moderno
* tooltips
* cores estratégicas
* destaque para oportunidades de negócio

10. Insights automáticos
    Adicionar uma seção de insights automáticos gerados pelos dados.

Exemplos:

* “Filé mignon representou 28% do CMV do mês”
* “Prato X possui alta venda mas margem abaixo da média”
* “Segunda-feira 12h é o horário de maior faturamento”
* “Ingrediente Y aumentou muito o custo operacional”

Esses insights devem aparecer como:

* cards inteligentes
* alertas
* badges
* pequenas recomendações visuais

11. Filtros avançados
    Adicionar filtros para:

* categoria de produto
* tipo de venda (delivery/local)
* turno
* dia da semana
* faixa de horário

12. UX esperada
    O dashboard deve transmitir:

* inteligência operacional
* gestão financeira
* controle de custos
* análise estratégica

A experiência deve parecer um sistema moderno de BI para restaurantes, semelhante a dashboards executivos.

Priorizar:

* clareza visual
* leitura rápida
* indicadores acionáveis
* visual premium
* organização limpa
* excelente hierarquia de informação

Os gráficos devem ser:

* interativos
* responsivos
* modernos
* com animações suaves
* preparados para grandes volumes de dados
