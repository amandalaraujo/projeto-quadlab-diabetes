import os
import glob
import pandas as pd
from sqlalchemy import create_engine

# ==============================================================================
# 1. MAPEAMENTO DE REGRAS DE NEGÓCIO (SUS / DIABETES)
# ==============================================================================
CIDS_DIABETES = ['E10', 'E11', 'E12', 'E13', 'E14']

CIDS_COMA = ['E100', 'E110', 'E120', 'E130', 'E140', 'E10.0', 'E11.0', 'E12.0', 'E13.0', 'E14.0']
CIDS_CETOACIDOSE = ['E101', 'E111', 'E121', 'E131', 'E141', 'E10.1', 'E11.1', 'E12.1', 'E13.1', 'E14.1']

PROC_AMPUTACAO = [
    '0409060089', '0409060070', '0409060135', '0409060097',
    '409060089', '409060070', '409060135', '409060097'
]

def identificar_complicacao(row, col_diag, col_proc):
    """Classifica o tipo de complicação com base no CID ou Procedimento."""
    diag = str(row.get(col_diag, '')).strip().upper().replace('.', '') if col_diag else ''
    proc = str(row.get(col_proc, '')).strip() if col_proc else ''

    is_amputacao = proc in PROC_AMPUTACAO
    is_coma = any(diag.startswith(c.replace('.', '')) for c in CIDS_COMA)
    is_ceto = any(diag.startswith(c.replace('.', '')) for c in CIDS_CETOACIDOSE)

    if is_amputacao:
        return 'Amputação'
    elif is_coma:
        return 'Coma Diabético'
    elif is_ceto:
        return 'Cetoacidose'
    return 'Sem complicação grave registrada'

# ==============================================================================
# 2. CONEXÃO COM O BANCO DE DADOS
# ==============================================================================
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///sihsus_diabetes.db")
engine = create_engine(DATABASE_URL)

def rodar_etl():
    caminho_raw = os.path.join(os.path.dirname(__file__), 'raw_data')
    arquivos_csv = sorted(glob.glob(os.path.join(caminho_raw, '*.csv')))

    if not arquivos_csv:
        print("Nenhum arquivo CSV encontrado em etl/raw_data/")
        return

    print(f"Encontrados {len(arquivos_csv)} arquivos para processar.\n")

    tabelas_ja_criadas = False

    for file_path in arquivos_csv:
        nome_arquivo = os.path.basename(file_path)
        print(f"Processando: {nome_arquivo}...")

        # Leitura com fallbacks de codificação padrão DataSUS
        try:
            df = pd.read_csv(file_path, sep=';', encoding='iso-8859-1', low_memory=False)
        except Exception:
            try:
                df = pd.read_csv(file_path, sep=',', encoding='iso-8859-1', low_memory=False)
            except Exception:
                df = pd.read_csv(file_path, sep=None, engine='python', encoding='utf-8')

        # 1. Padroniza colunas (maiúsculas e sem espaços)
        df.columns = [str(col).upper().strip() for col in df.columns]

        # 2. REMOVE COLUNAS DUPLICADAS NO CSV (Resolve o DuplicateColumnError)
        df = df.loc[:, ~df.columns.duplicated()].copy()

        total_bruto = len(df)

        # 3. Localiza a coluna de diagnóstico principal (trata Variações de Nomes)
        col_diag = None
        for col_cand in ['DIAG_PRINC', 'DIAGPRINC', 'DIAG_PRI', 'CID']:
            if col_cand in df.columns:
                col_diag = col_cand
                break

        col_proc = None
        for col_cand in ['PROC_REA', 'PROCREA', 'PROC_REAL']:
            if col_cand in df.columns:
                col_proc = col_cand
                break

        # 4. Filtra apenas casos de Diabetes
        if col_diag:
            mascara_diabetes = df[col_diag].astype(str).str.strip().str.upper().apply(
                lambda cid: any(cid.startswith(c) for c in CIDS_DIABETES)
            )
            df = df[mascara_diabetes].copy()
        else:
            print(f"   Coluna de Diagnóstico não encontrada no arquivo {nome_arquivo}")
            continue
        
        total_filtrado = len(df)
        print(f"   └─ Total lido: {total_bruto:,} | Casos de Diabetes: {total_filtrado:,}")

        if total_filtrado > 0:
            # 5. Aplica a rotulagem de complicações
            df['TIPO_COMPLICACAO'] = df.apply(lambda row: identificar_complicacao(row, col_diag, col_proc), axis=1)

            # 6. Carga no Banco de Dados
            modo_envio = 'replace' if not tabelas_ja_criadas else 'append'
            df.to_sql(
                name='atendimentos_diabetes',
                con=engine,
                if_exists=modo_envio,
                index=False,
                chunksize=2000
            )
            tabelas_ja_criadas = True
            print("   └─ Dados salvos no banco!")
        else:
            print("   └─ Nenhum registro correspondente a Diabetes neste arquivo.")

    print("\nETL finalizado com sucesso! Tabela 'atendimentos_diabetes' populada.")

if __name__ == '__main__':
    rodar_etl()