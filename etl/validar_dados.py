# ==============================================================================
# VALIDAÇÃO DE DADOS - ETL PARA DADOS DO SIHSUS (SUS) - DIABETES
# ==============================================================================
import sqlite3
import pandas as pd

conn = sqlite3.connect('sihsus_diabetes.db')  # ajuste o caminho se necessário

# Quantos registros no total?
print(pd.read_sql("SELECT COUNT(*) AS total FROM atendimentos_diabetes", conn))

# Distribuição por tipo de complicação
print(pd.read_sql("""
    SELECT TIPO_COMPLICACAO, COUNT(*) AS qtd
    FROM atendimentos_diabetes
    GROUP BY TIPO_COMPLICACAO
    ORDER BY qtd DESC
""", conn))

# As primeiras linhas, pra olhar as colunas de perto
print(pd.read_sql("SELECT * FROM atendimentos_diabetes LIMIT 5", conn).T)