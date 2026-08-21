import sqlite3
import pandas as pd
import matplotlib.pyplot as plt

conn = sqlite3.connect('sihsus_diabetes.db')

# ---------------------------------------------------------------
# Gráfico 1: Distribuição de complicações
# ---------------------------------------------------------------
df_comp = pd.read_sql("""
    SELECT TIPO_COMPLICACAO, COUNT(*) as qtd
    FROM atendimentos_diabetes
    GROUP BY TIPO_COMPLICACAO
    ORDER BY qtd DESC
""", conn)

plt.figure(figsize=(8, 5))
plt.bar(df_comp['TIPO_COMPLICACAO'], df_comp['qtd'], color=['#4C72B0', '#DD8452', '#55A868', '#C44E52'])
plt.title('Distribuição de Complicações — Diabetes SP 2025')
plt.ylabel('Nº de atendimentos')
plt.xticks(rotation=15)
plt.tight_layout()
plt.savefig('etl/debug_tools/grafico_complicacoes.png')
plt.show()

# ---------------------------------------------------------------
# Gráfico 2: Complicações por mês (evolução temporal)
# ---------------------------------------------------------------
df_mes = pd.read_sql("""
    SELECT MES_CMPT, TIPO_COMPLICACAO, COUNT(*) as qtd
    FROM atendimentos_diabetes
    WHERE TIPO_COMPLICACAO != 'Sem complicação grave registrada'
    GROUP BY MES_CMPT, TIPO_COMPLICACAO
""", conn)
df_pivot = df_mes.pivot(index='MES_CMPT', columns='TIPO_COMPLICACAO', values='qtd').fillna(0)
df_pivot = df_pivot.sort_index()

df_pivot.plot(kind='line', marker='o', figsize=(10, 5))
plt.title('Complicações por Mês — 2025')
plt.xlabel('Mês')
plt.ylabel('Nº de atendimentos')
plt.tight_layout()
plt.savefig('etl/debug_tools/grafico_complicacoes_mes.png')
plt.show()

# ---------------------------------------------------------------
# Gráfico 3: Faixa etária x complicação
# ---------------------------------------------------------------
df_idade = pd.read_sql("""
    SELECT DEF_IDADE_PUB, TIPO_COMPLICACAO, COUNT(*) as qtd
    FROM atendimentos_diabetes
    WHERE TIPO_COMPLICACAO != 'Sem complicação grave registrada'
    GROUP BY DEF_IDADE_PUB, TIPO_COMPLICACAO
""", conn)
df_idade_pivot = df_idade.pivot(index='DEF_IDADE_PUB', columns='TIPO_COMPLICACAO', values='qtd').fillna(0)

df_idade_pivot.plot(kind='bar', stacked=True, figsize=(10, 6))
plt.title('Complicações por Faixa Etária — 2025')
plt.ylabel('Nº de atendimentos')
plt.xticks(rotation=45)
plt.tight_layout()
plt.savefig('etl/debug_tools/grafico_complicacoes_idade.png')
plt.show()