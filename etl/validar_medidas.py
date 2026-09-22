from pathlib import Path
import os

import pandas as pd
from dotenv import load_dotenv
from sqlalchemy import create_engine

from medidas_pandas import (
    aihs_diabetes,
    aihs_dm_graves,
    percentual_graves,
    taxa_complicacao_grave,
    impacto_graves,
    status_estado,
    likelihood_aihs,
    obitos_diabetes,
    taxa_obito_diabeticos,
    aihs_endocrinas,
    taxa_obito_diabeticos_endocrinos,
    obitos,
    total_aihs,
    taxa_obito,
    aihs_raca_cor_informada,
    completude_raca_cor,
    total_custo,
    total_custo_diabetes,
    custo_por_aih,
    custo_por_aih_diabeticas,
    dif_custo_checagem,
    permanencia_total_dias_diabetes,
    permanencia_media_dias,
    media_permanencia,
    obitos_gerais,
    idade_media,
    aihs_complicacoes_maternas,
    res_latd_dec
)


BASE_DIR = Path(__file__).resolve().parent.parent

load_dotenv(BASE_DIR / ".env")

database_url = os.getenv("DATABASE_URL")

if not database_url:
    raise RuntimeError(
        "DATABASE_URL não encontrada no arquivo .env"
    )


engine = create_engine(database_url)


# Apenas leitura.
# Traz somente as colunas necessárias para as medidas validadas.
query = """
SELECT
    "ANO_CMPT",
    "N_AIH",
    "DEF_DIAG_PRINC_CAT",
    "DEF_DIAG_PRINC_SUBCAT",
    "DIAGSEC1",
    "DIAGSEC2",
    "DIAGSEC3",
    "DIAGSEC4",
    "DIAGSEC5",
    "DIAGSEC6",
    "DIAGSEC7",
    "DIAGSEC8",
    "DIAGSEC9",
    "MORTE",
    "DEF_MORTE",
    "DEF_RACA_COR",
    "VAL_TOT",
    "VAL_SH",
    "VAL_SP",
    "VAL_SADT",
    "VAL_TRANSP",
    "VAL_SANGUE",
    "VAL_UCI",
    "VAL_UTI",
    "VAL_ACOMP",
    "VAL_OBSANG",
    "VAL_RN",
    "VAL_ORTP",
    "VAL_PED1AC",
    "QT_DIARIAS",
    "DIAS_PERM",
    "DEF_IDADE_ANOS",
    "RES_LATITUDE"
FROM public.atendimentos_diabetes;
"""


df = pd.read_sql_query(query, engine)

engine.dispose()


# =========================================================
# 1. AIHs Diabetes
# =========================================================

resultado_diabetes_python = aihs_diabetes(df, ano=2025)

# Valor confirmado diretamente no Neon
resultado_diabetes_neon = 25115


print("VALIDAÇÃO - AIHs Diabetes")
print("-------------------------")
print(f"Registros carregados: {len(df)}")
print(f"Neon / SQL:           {resultado_diabetes_neon}")
print(f"Python / Pandas:      {resultado_diabetes_python}")

if resultado_diabetes_python == resultado_diabetes_neon:
    print("STATUS: CONVERSÃO VALIDADA")
else:
    print("STATUS: RESULTADOS DIFERENTES")


# =========================================================
# 2. AIHs DM Graves
# =========================================================

resultado_graves_python = aihs_dm_graves(df, ano=2025)

# Valor confirmado diretamente no Neon
resultado_graves_neon = 7898


print()
print("VALIDAÇÃO - AIHs DM Graves")
print("--------------------------")
print(f"Neon / SQL:           {resultado_graves_neon}")
print(f"Python / Pandas:      {resultado_graves_python}")

if resultado_graves_python == resultado_graves_neon:
    print("STATUS: CONVERSÃO VALIDADA")
else:
    print("STATUS: RESULTADOS DIFERENTES")

    # =========================================================
# 3. % Graves
# =========================================================

resultado_percentual_python = percentual_graves(df, ano=2025)

# Valor confirmado diretamente no Neon
resultado_percentual_neon = 31.447342225761497


print()
print("VALIDAÇÃO - % Graves")
print("--------------------")
print(f"Neon / SQL:           {resultado_percentual_neon:.6f}%")
print(f"Python / Pandas:      {resultado_percentual_python:.6f}%")

if abs(resultado_percentual_python - resultado_percentual_neon) < 0.000001:
    print("STATUS: CONVERSÃO VALIDADA")
else:
    print("STATUS: RESULTADOS DIFERENTES")


# =========================================================
# 4. Taxa Complicação Grave
# =========================================================

resultado_taxa_python = taxa_complicacao_grave(df, ano=2025)

# Valor confirmado diretamente no Neon
resultado_taxa_neon = 314.47342225761497


print()
print("VALIDAÇÃO - Taxa Complicação Grave")
print("----------------------------------")
print(f"Neon / SQL:           {resultado_taxa_neon:.6f}")
print(f"Python / Pandas:      {resultado_taxa_python:.6f}")

if abs(resultado_taxa_python - resultado_taxa_neon) < 0.000001:
    print("STATUS: CONVERSÃO VALIDADA")
else:
    print("STATUS: RESULTADOS DIFERENTES")

# =========================================================
# 5. Impacto Graves
# =========================================================

resultado_impacto_python = impacto_graves(df, ano=2025)

# Valor confirmado diretamente no Neon
resultado_impacto_neon = 5


print()
print("VALIDAÇÃO - Impacto Graves")
print("--------------------------")
print(f"Neon / SQL:           {resultado_impacto_neon}")
print(f"Python / Pandas:      {resultado_impacto_python}")

if resultado_impacto_python == resultado_impacto_neon:
    print("STATUS: CONVERSÃO VALIDADA")
else:
    print("STATUS: RESULTADOS DIFERENTES")

# =========================================================
# 6. Status Estado
# =========================================================

resultado_status_python = status_estado(df, ano=2025)

# Valor confirmado diretamente no Neon
resultado_status_neon = "Crítico"


print()
print("VALIDAÇÃO - Status Estado")
print("-------------------------")
print(f"Neon / SQL:           {resultado_status_neon}")
print(f"Python / Pandas:      {resultado_status_python}")

if resultado_status_python == resultado_status_neon:
    print("STATUS: CONVERSÃO VALIDADA")
else:
    print("STATUS: RESULTADOS DIFERENTES")

# =========================================================
# 7. Likelihood AIHs
# =========================================================

resultado_likelihood_python = likelihood_aihs(df, ano=2025)

# Valor confirmado diretamente no Neon
resultado_likelihood_neon = 5


print()
print("VALIDAÇÃO - Likelihood AIHs")
print("---------------------------")
print(f"Neon / SQL:           {resultado_likelihood_neon}")
print(f"Python / Pandas:      {resultado_likelihood_python}")

if resultado_likelihood_python == resultado_likelihood_neon:
    print("STATUS: CONVERSÃO VALIDADA")
else:
    print("STATUS: RESULTADOS DIFERENTES")

# =========================================================
# 8. Óbitos Diabetes
# =========================================================

resultado_obitos_diabetes_python = obitos_diabetes(df, ano=2025)

# Valor confirmado diretamente no Neon
resultado_obitos_diabetes_neon = 977


print()
print("VALIDAÇÃO - Óbitos Diabetes")
print("---------------------------")
print(f"Neon / SQL:           {resultado_obitos_diabetes_neon}")
print(f"Python / Pandas:      {resultado_obitos_diabetes_python}")

if resultado_obitos_diabetes_python == resultado_obitos_diabetes_neon:
    print("STATUS: CONVERSÃO VALIDADA")
else:
    print("STATUS: RESULTADOS DIFERENTES")

# =========================================================
# 9. Taxa de Óbito Diabéticos (%)
# =========================================================

resultado_taxa_obito_python = taxa_obito_diabeticos(df, ano=2025)

# Valor confirmado diretamente no Neon
resultado_taxa_obito_neon = 0.0389010551463269


print()
print("VALIDAÇÃO - Taxa de Óbito Diabéticos (%)")
print("-----------------------------------------")
print(f"Neon / SQL:           {resultado_taxa_obito_neon:.12f}")
print(f"Python / Pandas:      {resultado_taxa_obito_python:.12f}")

if abs(resultado_taxa_obito_python - resultado_taxa_obito_neon) < 0.000000000001:
    print("STATUS: CONVERSÃO VALIDADA")
else:
    print("STATUS: RESULTADOS DIFERENTES")

# =========================================================
# 10. AIHs Endócrinas
# =========================================================

resultado_aihs_endocrinas_python = aihs_endocrinas(df, ano=2025)

# Valor confirmado diretamente no Neon
resultado_aihs_endocrinas_neon = 26320


print()
print("VALIDAÇÃO - AIHs Endócrinas")
print("---------------------------")
print(f"Neon / SQL:           {resultado_aihs_endocrinas_neon}")
print(f"Python / Pandas:      {resultado_aihs_endocrinas_python}")

if resultado_aihs_endocrinas_python == resultado_aihs_endocrinas_neon:
    print("STATUS: CONVERSÃO VALIDADA")
else:
    print("STATUS: RESULTADOS DIFERENTES")

# =========================================================
# 11. Taxa de Óbito Diabéticos sobre endócrinos (%)
# =========================================================

resultado_taxa_obito_endocrinos_python = (
    taxa_obito_diabeticos_endocrinos(df, ano=2025)
)

# Valor confirmado diretamente no Neon
resultado_taxa_obito_endocrinos_neon = 0.03712006079027356


print()
print("VALIDAÇÃO - Taxa de Óbito Diabéticos sobre endócrinos (%)")
print("-----------------------------------------------------------")
print(f"Neon / SQL:           {resultado_taxa_obito_endocrinos_neon:.12f}")
print(f"Python / Pandas:      {resultado_taxa_obito_endocrinos_python:.12f}")

if abs(
    resultado_taxa_obito_endocrinos_python
    - resultado_taxa_obito_endocrinos_neon
) < 0.000000000001:
    print("STATUS: CONVERSÃO VALIDADA")
else:
    print("STATUS: RESULTADOS DIFERENTES")

# =========================================================
# 12. Óbitos
# =========================================================

resultado_obitos_python = obitos(df, ano=2025)

# Valor confirmado diretamente no Neon
resultado_obitos_neon = 977


print()
print("VALIDAÇÃO - Óbitos")
print("------------------")
print(f"Neon / SQL:           {resultado_obitos_neon}")
print(f"Python / Pandas:      {resultado_obitos_python}")

if resultado_obitos_python == resultado_obitos_neon:
    print("STATUS: CONVERSÃO VALIDADA")
else:
    print("STATUS: RESULTADOS DIFERENTES")

# =========================================================
# 13. Total AIHs
# =========================================================

resultado_total_aihs_python = total_aihs(df, ano=2025)

# Valor confirmado diretamente no Neon
resultado_total_aihs_neon = 26320


print()
print("VALIDAÇÃO - Total AIHs")
print("----------------------")
print(f"Neon / SQL:           {resultado_total_aihs_neon}")
print(f"Python / Pandas:      {resultado_total_aihs_python}")

if resultado_total_aihs_python == resultado_total_aihs_neon:
    print("STATUS: CONVERSÃO VALIDADA")
else:
    print("STATUS: RESULTADOS DIFERENTES")

# =========================================================
# 14. Taxa de Óbito (%)
# =========================================================

resultado_taxa_obito_python = taxa_obito(df, ano=2025)

# Valor confirmado diretamente no Neon
resultado_taxa_obito_neon = 0.03712006079027356


print()
print("VALIDAÇÃO - Taxa de Óbito (%)")
print("-----------------------------")
print(f"Neon / SQL:           {resultado_taxa_obito_neon:.12f}")
print(f"Python / Pandas:      {resultado_taxa_obito_python:.12f}")

if abs(
    resultado_taxa_obito_python - resultado_taxa_obito_neon
) < 0.000000000001:
    print("STATUS: CONVERSÃO VALIDADA")
else:
    print("STATUS: RESULTADOS DIFERENTES")

# =========================================================
# 15. AIHs Raça/Cor Informada
# =========================================================

resultado_raca_cor_python = aihs_raca_cor_informada(df, ano=2025)

# Valor confirmado diretamente no Neon
resultado_raca_cor_neon = 26320


print()
print("VALIDAÇÃO - AIHs Raça/Cor Informada")
print("------------------------------------")
print(f"Neon / SQL:           {resultado_raca_cor_neon}")
print(f"Python / Pandas:      {resultado_raca_cor_python}")

if resultado_raca_cor_python == resultado_raca_cor_neon:
    print("STATUS: CONVERSÃO VALIDADA")
else:
    print("STATUS: RESULTADOS DIFERENTES")

# =========================================================
# 16. Completude Raça/Cor (%)
# =========================================================

resultado_completude_python = completude_raca_cor(df, ano=2025)

# Valor confirmado diretamente no Neon
resultado_completude_neon = 1.0


print()
print("VALIDAÇÃO - Completude Raça/Cor (%)")
print("------------------------------------")
print(f"Neon / SQL:           {resultado_completude_neon:.12f}")
print(f"Python / Pandas:      {resultado_completude_python:.12f}")

if abs(
    resultado_completude_python - resultado_completude_neon
) < 0.000000000001:
    print("STATUS: CONVERSÃO VALIDADA")
else:
    print("STATUS: RESULTADOS DIFERENTES")

# =========================================================
# 17. Total Custo
# =========================================================

resultado_total_custo_python = total_custo(df, ano=2025)

# Valor confirmado diretamente no Neon
resultado_total_custo_neon = 37654986.7200004


print()
print("VALIDAÇÃO - Total Custo")
print("-----------------------")
print(f"Neon / SQL:           {resultado_total_custo_neon:.6f}")
print(f"Python / Pandas:      {resultado_total_custo_python:.6f}")

if abs(
    resultado_total_custo_python - resultado_total_custo_neon
) < 0.01:
    print("STATUS: CONVERSÃO VALIDADA")
else:
    print("STATUS: RESULTADOS DIFERENTES")

# =========================================================
# 18. Total Custo Diabetes
# =========================================================

resultado_total_custo_diabetes_python = total_custo_diabetes(df, ano=2025)

# Valor confirmado diretamente no Neon
resultado_total_custo_diabetes_neon = 36166209.79000087


print()
print("VALIDAÇÃO - Total Custo Diabetes")
print("--------------------------------")
print(f"Neon / SQL:           {resultado_total_custo_diabetes_neon:.6f}")
print(f"Python / Pandas:      {resultado_total_custo_diabetes_python:.6f}")

if abs(
    resultado_total_custo_diabetes_python
    - resultado_total_custo_diabetes_neon
) < 0.01:
    print("STATUS: CONVERSÃO VALIDADA")
else:
    print("STATUS: RESULTADOS DIFERENTES")

# =========================================================
# 19. Custo por AIH
# =========================================================

resultado_custo_por_aih_python = custo_por_aih(df, ano=2025)

# Valor confirmado diretamente no Neon
resultado_custo_por_aih_neon = 1430.6605896656688


print()
print("VALIDAÇÃO - Custo por AIH")
print("-------------------------")
print(f"Neon / SQL:           {resultado_custo_por_aih_neon:.6f}")
print(f"Python / Pandas:      {resultado_custo_por_aih_python:.6f}")

if abs(
    resultado_custo_por_aih_python
    - resultado_custo_por_aih_neon
) < 0.01:
    print("STATUS: CONVERSÃO VALIDADA")
else:
    print("STATUS: RESULTADOS DIFERENTES")

# =========================================================
# 20. Custo por AIH Diabéticas
# =========================================================

resultado_custo_aih_diabeticas_python = custo_por_aih_diabeticas(
    df,
    ano=2025
)

# Valor confirmado diretamente no Neon
resultado_custo_aih_diabeticas_neon = 1374.0961166413704


print()
print("VALIDAÇÃO - Custo por AIH Diabéticas")
print("-------------------------------------")
print(f"Neon / SQL:           {resultado_custo_aih_diabeticas_neon:.6f}")
print(f"Python / Pandas:      {resultado_custo_aih_diabeticas_python:.6f}")

if abs(
    resultado_custo_aih_diabeticas_python
    - resultado_custo_aih_diabeticas_neon
) < 0.01:
    print("STATUS: CONVERSÃO VALIDADA")
else:
    print("STATUS: RESULTADOS DIFERENTES")

# =========================================================
# 21. Dif Custo (checagem)
# =========================================================

resultado_dif_custo_python = dif_custo_checagem(df, ano=2025)

# Valor confirmado diretamente no Neon
resultado_dif_custo_neon = -13172001.689999994


print()
print("VALIDAÇÃO - Dif Custo (checagem)")
print("--------------------------------")
print(f"Neon / SQL:           {resultado_dif_custo_neon:.6f}")
print(f"Python / Pandas:      {resultado_dif_custo_python:.6f}")

if abs(
    resultado_dif_custo_python
    - resultado_dif_custo_neon
) < 0.01:
    print("STATUS: CONVERSÃO VALIDADA")
else:
    print("STATUS: RESULTADOS DIFERENTES")

    # =========================================================
# 22. Permanência Total (dias) Diabetes
# =========================================================

resultado_permanencia_total_python = permanencia_total_dias_diabetes(
    df,
    ano=2025
)

# Valor confirmado diretamente no Neon
resultado_permanencia_total_neon = 145581


print()
print("VALIDAÇÃO - Permanência Total (dias) Diabetes")
print("----------------------------------------------")
print(f"Neon / SQL:           {resultado_permanencia_total_neon}")
print(f"Python / Pandas:      {resultado_permanencia_total_python}")

if resultado_permanencia_total_python == resultado_permanencia_total_neon:
    print("STATUS: CONVERSÃO VALIDADA")
else:
    print("STATUS: RESULTADOS DIFERENTES")

# =========================================================
# 23. Permanência Média (dias)
# =========================================================

resultado_permanencia_media_python = permanencia_media_dias(
    df,
    ano=2025
)

# Valor confirmado diretamente no Neon
resultado_permanencia_media_neon = 5.531193009118541


print()
print("VALIDAÇÃO - Permanência Média (dias)")
print("------------------------------------")
print(f"Neon / SQL:           {resultado_permanencia_media_neon:.12f}")
print(f"Python / Pandas:      {resultado_permanencia_media_python:.12f}")

if abs(
    resultado_permanencia_media_python
    - resultado_permanencia_media_neon
) < 0.000000000001:
    print("STATUS: CONVERSÃO VALIDADA")
else:
    print("STATUS: RESULTADOS DIFERENTES")

# =========================================================
# 24. Média Permanência
# =========================================================

resultado_media_permanencia_python = media_permanencia(
    df,
    ano=2025
)

# Valor confirmado diretamente no Neon
resultado_media_permanencia_neon = 6.054530965391621


print()
print("VALIDAÇÃO - Média Permanência")
print("----------------------------")
print(f"Neon / SQL:           {resultado_media_permanencia_neon:.12f}")
print(f"Python / Pandas:      {resultado_media_permanencia_python:.12f}")

if abs(
    resultado_media_permanencia_python
    - resultado_media_permanencia_neon
) < 0.000000000001:
    print("STATUS: CONVERSÃO VALIDADA")
else:
    print("STATUS: RESULTADOS DIFERENTES")

# =========================================================
# 25. Óbitos Gerais
# =========================================================

resultado_obitos_gerais_python = obitos_gerais(
    df,
    ano=2025
)

# Valor confirmado diretamente no Neon
resultado_obitos_gerais_neon = 977


print()
print("VALIDAÇÃO - Óbitos Gerais")
print("-------------------------")
print(f"Neon / SQL:           {resultado_obitos_gerais_neon}")
print(f"Python / Pandas:      {resultado_obitos_gerais_python}")

if resultado_obitos_gerais_python == resultado_obitos_gerais_neon:
    print("STATUS: CONVERSÃO VALIDADA")
else:
    print("STATUS: RESULTADOS DIFERENTES")

# =========================================================
# 26. Idade Média
# =========================================================

resultado_idade_media_python = idade_media(
    df,
    ano=2025
)

# Valor confirmado diretamente no Neon
resultado_idade_media_neon = 52.02717061323619


print()
print("VALIDAÇÃO - Idade Média")
print("-----------------------")
print(f"Neon / SQL:           {resultado_idade_media_neon:.12f}")
print(f"Python / Pandas:      {resultado_idade_media_python:.12f}")

if abs(
    resultado_idade_media_python
    - resultado_idade_media_neon
) < 0.000000000001:
    print("STATUS: CONVERSÃO VALIDADA")
else:
    print("STATUS: RESULTADOS DIFERENTES")

# =========================================================
# 27. AIHs Complicações Maternas
# =========================================================

resultado_complicacoes_maternas_python = aihs_complicacoes_maternas(
    df,
    ano=2025
)

# Valor confirmado diretamente no Neon
resultado_complicacoes_maternas_neon = 0


print()
print("VALIDAÇÃO - AIHs Complicações Maternas")
print("---------------------------------------")
print(f"Neon / SQL:           {resultado_complicacoes_maternas_neon}")
print(f"Python / Pandas:      {resultado_complicacoes_maternas_python}")

if resultado_complicacoes_maternas_python == resultado_complicacoes_maternas_neon:
    print("STATUS: CONVERSÃO VALIDADA")
else:
    print("STATUS: RESULTADOS DIFERENTES")

# =========================================================
# 29. res_LATD_DEC
# =========================================================

resultado_latitude_python = res_latd_dec(
    df,
    ano=2025
)

# Valores confirmados diretamente no Neon
quantidade_neon = 26352
latitude_minima_neon = -29.638
latitude_maxima_neon = -3.102
latitude_media_neon = -22.802892987249283


quantidade_python = resultado_latitude_python.count()
latitude_minima_python = resultado_latitude_python.min()
latitude_maxima_python = resultado_latitude_python.max()
latitude_media_python = resultado_latitude_python.mean()


print()
print("VALIDAÇÃO - res_LATD_DEC")
print("------------------------")
print(f"Quantidade - Neon:  {quantidade_neon}")
print(f"Quantidade - Python: {quantidade_python}")
print()
print(f"Mínima - Neon:      {latitude_minima_neon}")
print(f"Mínima - Python:    {latitude_minima_python}")
print()
print(f"Máxima - Neon:      {latitude_maxima_neon}")
print(f"Máxima - Python:    {latitude_maxima_python}")
print()
print(f"Média - Neon:       {latitude_media_neon:.12f}")
print(f"Média - Python:     {latitude_media_python:.12f}")


validada = (
    quantidade_python == quantidade_neon
    and abs(latitude_minima_python - latitude_minima_neon) < 0.000000001
    and abs(latitude_maxima_python - latitude_maxima_neon) < 0.000000001
    and abs(latitude_media_python - latitude_media_neon) < 0.000000001
)

if validada:
    print("STATUS: CONVERSÃO VALIDADA")
else:
    print("STATUS: RESULTADOS DIFERENTES")