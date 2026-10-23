from pathlib import Path
import os

import pandas as pd
from dotenv import load_dotenv
from sqlalchemy import create_engine


# Localiza o .env que está na raiz do projeto
BASE_DIR = Path(__file__).resolve().parent.parent
load_dotenv(BASE_DIR / ".env")

database_url = os.getenv("DATABASE_URL")

if not database_url:
    raise RuntimeError("DATABASE_URL não encontrada no arquivo .env")


# Conecta ao PostgreSQL do Neon
engine = create_engine(database_url)


# Consulta SOMENTE leitura
query = """
SELECT
    "ANO_CMPT",
    COUNT(*) AS quantidade_registros
FROM public.atendimentos_diabetes
GROUP BY "ANO_CMPT"
ORDER BY "ANO_CMPT";
"""


df = pd.read_sql_query(query, engine)

print("Conexão com Neon realizada com sucesso!")
print(df)

engine.dispose()