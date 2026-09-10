# ==============================================================================
# PIPELINE PRINCIPAL DE ETL PARA DADOS DO SIHSUS (SUS) - DIABETES
# ==============================================================================
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

# Códigos confirmados via inspeção real dos dados (ver etl/debug_procedimentos.py)
# Amputação/desarticulação efetiva — evento novo de complicação
PROC_AMPUTACAO = [
    '0408020024',  # Amputação/desarticulação de membros superiores
    '0408050012',  # Amputação/desarticulação de membros inferiores
    '0408050020',  # Amputação/desarticulação de pé e tarso
    '0408060042',  # Amputação/desarticulação de dedo
]

# Revisão de coto de amputação já existente — NÃO é um novo evento de amputação,
# mantido separado para não inflar a métrica de complicação
PROC_REVISAO_COTO = [
    '0408050330',
    '0408060425',
]

def identificar_complicacao(row, col_diag, col_proc, col_nome_proc=None):
    diag = str(row.get(col_diag, '')).strip().upper().replace('.', '') if col_diag else ''
    proc = str(row.get(col_proc, '')).strip() if col_proc else ''
    nome_proc = str(row.get(col_nome_proc, '')).strip().upper() if col_nome_proc else ''

    # Lista explícita + rede de segurança por nome (exclui revisões de coto)
    is_amputacao = (
        proc in PROC_AMPUTACAO
        or ('AMPUTA' in nome_proc and proc not in PROC_REVISAO_COTO and 'REVISAO' not in nome_proc)
    )
    is_coma = any(diag.startswith(c.replace('.', '')) for c in CIDS_COMA)
    is_ceto = any(diag.startswith(c.replace('.', '')) for c in CIDS_CETOACIDOSE)

# Prioridade: Amputação > Coma > Cetoacidose > Sem complicação
# Cada atendimento foi classificado numa única categoria de complicação, 
# por ordem de gravidade" — porque muda ligeiramente a leitura dos números 


# ************(VALIDAR DEPOIS)************


    if is_amputacao:
        return 'Amputação'
    elif is_coma:
        return 'Coma Diabético'
    elif is_ceto:
        return 'Cetoacidose'
    return 'Sem complicação grave registrada'


def ler_csv_sihsus(file_path):
    """
    Tenta ler o CSV combinando separador e encoding, mas só considera
    sucesso se encontrar de fato uma coluna de diagnóstico reconhecível
    e se houver mais de 1 coluna.
    """
    tentativas = [
        {'sep': ',', 'encoding': 'utf-8-sig'},   # Combinação principal
        {'sep': ',', 'encoding': 'iso-8859-1'},
        {'sep': ';', 'encoding': 'utf-8-sig'},
        {'sep': ';', 'encoding': 'iso-8859-1'},
    ]

    colunas_diag_candidatas = ['DIAG_PRINC', 'DIAGPRINC', 'DIAG_PRI', 'CID']

    for tentativa in tentativas:
        try:
            df = pd.read_csv(file_path, low_memory=False, **tentativa)
        except Exception:
            continue

        # Padroniza colunas (maiúsculas e sem espaços)
        df.columns = [str(c).upper().strip() for c in df.columns]
        # Remove colunas duplicadas
        df = df.loc[:, ~df.columns.duplicated()].copy()

        # Validação explícita: Se separou em várias colunas E achou o CID
        if len(df.columns) > 1 and any(c in df.columns for c in colunas_diag_candidatas):
            return df

    return None

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

        # Leitura inteligente utilizando a nova função
        df = ler_csv_sihsus(file_path)

        if df is None:
            print(f"   Não foi possível ler {nome_arquivo} com nenhuma combinação conhecida de separador/encoding.")
            continue

        total_bruto = len(df)

        # Identifica a coluna de Diagnóstico
        col_diag = None
        for col_cand in ['DIAG_PRINC', 'DIAGPRINC', 'DIAG_PRI', 'CID']:
            if col_cand in df.columns:
                col_diag = col_cand
                break

        # Identifica a coluna de Procedimento
        col_proc = None
        for col_cand in ['PROC_REA', 'PROC_SOL', 'PA_PROCID']:
            if col_cand in df.columns:
                col_proc = col_cand
                break

        # Trata a formatação de coluna de procedimento para evitar perda de zero à esquerda
        if col_proc:
            df[col_proc] = (
                df[col_proc]
                .astype(str)
                .str.replace(r'\.0$', '', regex=True)
                .str.zfill(10)
            )

        # Filtra apenas casos de Diabetes
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
            # Aplica a rotulagem de complicações
            df['TIPO_COMPLICACAO'] = df.apply(
                lambda row: identificar_complicacao(row, col_diag, col_proc, col_nome_proc='DEF_PROCEDIMENTO_REALIZADO'),
                axis=1
)

            # Carga no Banco de Dados
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