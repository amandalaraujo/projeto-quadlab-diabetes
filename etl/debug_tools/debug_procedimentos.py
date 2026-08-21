import sqlite3
import pandas as pd

conn = sqlite3.connect('sihsus_diabetes.db')

# Os procedimentos mais frequentes entre os casos de diabetes
df = pd.read_sql("""
    SELECT PROC_REA, DEF_PROCEDIMENTO_REALIZADO, COUNT(*) as qtd
    FROM atendimentos_diabetes
    GROUP BY PROC_REA
    ORDER BY qtd DESC
    LIMIT 30
""", conn)
pd.set_option('display.max_colwidth', None)
print(df)

# Busca por qualquer procedimento cujo nome contenha "amput" (ignorando maiúsc/minúsc)
print("\n--- Procedimentos com 'amput' no nome ---")
df_amput = pd.read_sql("""
    SELECT DISTINCT PROC_REA, DEF_PROCEDIMENTO_REALIZADO, COUNT(*) as qtd
    FROM atendimentos_diabetes
    WHERE LOWER(DEF_PROCEDIMENTO_REALIZADO) LIKE '%amput%'
    GROUP BY PROC_REA
""", conn)
print(df_amput)