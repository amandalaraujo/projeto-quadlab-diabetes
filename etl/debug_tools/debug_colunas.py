import pandas as pd

arquivo_ok = 'etl/raw_data/ETLSIH.ST_SP_2025_12_t.csv'      # funcionou
arquivo_com_problema = 'etl/raw_data/ETLSIH.ST_SP_2025_1_t.csv'  # falhou

for nome, caminho in [('OK (dez)', arquivo_ok), ('PROBLEMA (jan)', arquivo_com_problema)]:
    print(f"\n===== {nome} =====")
    with open(caminho, 'rb') as f:
        primeiros_bytes = f.read(200)
        print("Primeiros bytes (raw):", primeiros_bytes)

    df_teste = pd.read_csv(caminho, sep=';', encoding='iso-8859-1', nrows=1)
    print("Colunas encontradas:", df_teste.columns.tolist()[:5], "... total:", len(df_teste.columns))