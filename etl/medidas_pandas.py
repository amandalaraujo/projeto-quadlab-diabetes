import pandas as pd


def aihs_diabetes(df: pd.DataFrame, ano: int = 2025) -> int:
    """
    Equivalente em Pandas à medida DAX 'AIHs Diabetes',
    adaptada para a base atual do Neon (2025).
    """

    dados = df.copy()

    # Garante que o ano seja tratado como número
    dados["ANO_CMPT"] = pd.to_numeric(
        dados["ANO_CMPT"],
        errors="coerce"
    )

    # Pega os 3 primeiros caracteres do diagnóstico principal
    cid = (
        dados["DEF_DIAG_PRINC_CAT"]
        .astype("string")
        .str.strip()
        .str[:3]
    )

    # Equivalente aos filtros da medida
    filtro = (
        (dados["ANO_CMPT"] == ano)
        & cid.isin(["E10", "E11", "E14"])
    )

    # DISTINCTCOUNT do DAX conta BLANK como valor distinto
    resultado = dados.loc[
        filtro,
        "N_AIH"
    ].nunique(dropna=False)

    return int(resultado)


def aihs_dm_graves(df: pd.DataFrame, ano: int = 2025) -> int:
    """
    Equivalente em Pandas à medida DAX 'AIHs DM Graves',
    adaptada para a estrutura atual do Neon em 2025.
    """

    dados = df.copy()

    dados["ANO_CMPT"] = pd.to_numeric(
        dados["ANO_CMPT"],
        errors="coerce"
    )

    # Subcategorias consideradas graves na DAX original
    subcategorias_graves = {
        "E10.0",
        "E10.1",
        "E10.7",
        "E11.0",
        "E11.1",
        "E11.7",
        "E14.0",
        "E14.1",
        "E14.7"
    }

    subcategoria = (
        dados["DEF_DIAG_PRINC_SUBCAT"]
        .astype("string")
        .str.strip()
        .str[:5]
    )

    # No Neon os diagnósticos secundários estão
    # distribuídos entre DIAGSEC1 e DIAGSEC9
    colunas_diag_secundario = [
        f"DIAGSEC{i}" for i in range(1, 10)
    ]

    tem_z89 = (
        dados[colunas_diag_secundario]
        .astype("string")
        .apply(
            lambda coluna:
            coluna.str.strip().str[:3].eq("Z89")
        )
        .any(axis=1)
    )

    filtro = (
        (dados["ANO_CMPT"] == ano)
        &
        (
            subcategoria.isin(subcategorias_graves)
            | tem_z89
        )
    )

    resultado = dados.loc[
        filtro,
        "N_AIH"
    ].nunique(dropna=False)

    return int(resultado)


def percentual_graves(df: pd.DataFrame, ano: int = 2025) -> float:
    """
    Equivalente em Pandas à medida DAX '% Graves',
    usando as medidas já convertidas e validadas.
    """

    total_diabetes = aihs_diabetes(df, ano)
    total_graves = aihs_dm_graves(df, ano)

    if total_diabetes == 0:
        return 0.0

    return (total_graves / total_diabetes) * 100

def taxa_complicacao_grave(df: pd.DataFrame, ano: int = 2025) -> float:
    """
    Equivalente em Pandas à medida DAX 'Taxa Complicação Grave',
    usando as medidas já convertidas e validadas.
    """

    total_diabetes = aihs_diabetes(df, ano)
    total_graves = aihs_dm_graves(df, ano)

    if total_diabetes == 0:
        return 0.0

    return (total_graves / total_diabetes) * 1000

def impacto_graves(df: pd.DataFrame, ano: int = 2025) -> int:
    """
    Equivalente em Pandas à medida DAX 'Impacto Graves',
    usando a medida AIHs DM Graves já convertida e validada.
    """

    total_graves = aihs_dm_graves(df, ano)

    if total_graves < 100:
        return 1
    elif total_graves < 500:
        return 2
    elif total_graves < 1500:
        return 3
    elif total_graves < 3000:
        return 4
    else:
        return 5

def status_estado(df: pd.DataFrame, ano: int = 2025) -> str:
    """
    Equivalente em Pandas à medida DAX 'Status Estado',
    usando a medida AIHs DM Graves já convertida e validada.
    """

    total_graves = aihs_dm_graves(df, ano)

    if total_graves > 1000:
        return "Crítico"
    elif total_graves > 500:
        return "Alerta"
    else:
        return "Monitorado"

def likelihood_aihs(df: pd.DataFrame, ano: int = 2025) -> int:
    """
    Equivalente em Pandas à medida DAX 'Likelihood AIHs',
    usando a medida AIHs Diabetes já convertida e validada.
    """

    total_diabetes = aihs_diabetes(df, ano)

    if total_diabetes < 1000:
        return 1
    elif total_diabetes < 3000:
        return 2
    elif total_diabetes < 7000:
        return 3
    elif total_diabetes < 15000:
        return 4
    else:
        return 5

def obitos_diabetes(df: pd.DataFrame, ano: int = 2025) -> int:
    """
    Equivalente em Pandas à medida DAX 'Óbitos Diabetes',
    adaptada para a base atual do Neon em 2025.
    """

    dados = df.copy()

    dados["ANO_CMPT"] = pd.to_numeric(
        dados["ANO_CMPT"],
        errors="coerce"
    )

    dados["MORTE"] = pd.to_numeric(
        dados["MORTE"],
        errors="coerce"
    )

    diagnostico = (
        dados["DEF_DIAG_PRINC_CAT"]
        .astype("string")
        .str.strip()
    )

    definicao_morte = (
        dados["DEF_MORTE"]
        .astype("string")
        .str.strip()
    )

    filtro = (
        (dados["ANO_CMPT"] == ano)
        & diagnostico.notna()
        & diagnostico.str.startswith("E", na=False)
        & (
            (dados["MORTE"] == 1)
            | (definicao_morte == "Com óbito")
        )
    )

    resultado = dados.loc[
        filtro,
        "N_AIH"
    ].nunique(dropna=False)

    return int(resultado)

def taxa_obito_diabeticos(df: pd.DataFrame, ano: int = 2025) -> float:
    """
    Equivalente em Pandas à medida DAX
    'Taxa de Óbito Diabéticos (%)',
    usando medidas já convertidas e validadas.
    """

    total_obitos = obitos_diabetes(df, ano)
    total_diabetes = aihs_diabetes(df, ano)

    if total_diabetes == 0:
        return 0.0

    return total_obitos / total_diabetes

def aihs_endocrinas(df: pd.DataFrame, ano: int = 2025) -> int:
    """
    Equivalente em Pandas à medida DAX 'AIHs Endócrinas',
    adaptada para a base atual do Neon em 2025.
    """

    dados = df.copy()

    dados["ANO_CMPT"] = pd.to_numeric(
        dados["ANO_CMPT"],
        errors="coerce"
    )

    diagnostico = (
        dados["DEF_DIAG_PRINC_CAT"]
        .astype("string")
        .str.strip()
    )

    filtro = (
        (dados["ANO_CMPT"] == ano)
        & diagnostico.notna()
        & diagnostico.str.startswith("E", na=False)
    )

    resultado = dados.loc[
        filtro,
        "N_AIH"
    ].nunique(dropna=False)

    return int(resultado)

def taxa_obito_diabeticos_endocrinos(
    df: pd.DataFrame,
    ano: int = 2025
) -> float:
    """
    Equivalente em Pandas à medida DAX
    'Taxa de Óbito Diabéticos sobre endócrinos (%)'.
    """

    total_obitos = obitos_diabetes(df, ano)
    total_endocrinas = aihs_endocrinas(df, ano)

    if total_endocrinas == 0:
        return 0.0

    return total_obitos / total_endocrinas

def obitos(df: pd.DataFrame, ano: int = 2025) -> int:
    """
    Equivalente em Pandas à medida DAX 'Óbitos',
    adaptada para a base atual do Neon em 2025.
    """

    dados = df.copy()

    dados["ANO_CMPT"] = pd.to_numeric(
        dados["ANO_CMPT"],
        errors="coerce"
    )

    dados["MORTE"] = pd.to_numeric(
        dados["MORTE"],
        errors="coerce"
    )

    definicao_morte = (
        dados["DEF_MORTE"]
        .astype("string")
        .str.strip()
    )

    # Primeiro critério da DAX: MORTE = 1
    filtro_morte = (
        (dados["ANO_CMPT"] == ano)
        & (dados["MORTE"] == 1)
    )

    dados_morte = dados.loc[filtro_morte, "N_AIH"]

    # Equivalente ao COALESCE da DAX:
    # se o primeiro cálculo tiver registros, ele é utilizado.
    if not dados_morte.empty:
        return int(dados_morte.nunique(dropna=False))

    # Alternativa: DEF_MORTE = "Com óbito"
    filtro_def_morte = (
        (dados["ANO_CMPT"] == ano)
        & (definicao_morte == "Com óbito")
    )

    resultado = dados.loc[
        filtro_def_morte,
        "N_AIH"
    ].nunique(dropna=False)

    return int(resultado)

def total_aihs(df: pd.DataFrame, ano: int = 2025) -> int:
    """
    Equivalente em Pandas à medida DAX 'Total AIHs',
    adaptada para a base atual do Neon em 2025.
    """

    dados = df.copy()

    dados["ANO_CMPT"] = pd.to_numeric(
        dados["ANO_CMPT"],
        errors="coerce"
    )

    filtro = dados["ANO_CMPT"] == ano

    resultado = dados.loc[
        filtro,
        "N_AIH"
    ].nunique(dropna=False)

    return int(resultado)

def taxa_obito(df: pd.DataFrame, ano: int = 2025) -> float:
    """
    Equivalente em Pandas à medida DAX 'Taxa de Óbito (%)',
    adaptada para a base atual do Neon em 2025.
    """

    total_obitos = obitos(df, ano)
    quantidade_aihs = total_aihs(df, ano)

    if quantidade_aihs == 0:
        return 0.0

    return total_obitos / quantidade_aihs

def aihs_raca_cor_informada(df: pd.DataFrame, ano: int = 2025) -> int:
    """
    Equivalente em Pandas à medida DAX
    'AIHs Raça/Cor Informada',
    adaptada para a base atual do Neon em 2025.
    """

    dados = df.copy()

    dados["ANO_CMPT"] = pd.to_numeric(
        dados["ANO_CMPT"],
        errors="coerce"
    )

    raca_cor = (
        dados["DEF_RACA_COR"]
        .astype("string")
        .str.strip()
    )

    categorias_validas = {
        "Amarela",
        "Branca",
        "Indígena",
        "Parda",
        "Preta"
    }

    filtro = (
        (dados["ANO_CMPT"] == ano)
        & raca_cor.isin(categorias_validas)
    )

    resultado = dados.loc[
        filtro,
        "N_AIH"
    ].nunique(dropna=False)

    return int(resultado)

def completude_raca_cor(df: pd.DataFrame, ano: int = 2025) -> float:
    """
    Equivalente em Pandas à medida DAX
    'Completude Raça/Cor (%)'.
    """

    total_raca_cor_informada = aihs_raca_cor_informada(df, ano)
    quantidade_aihs = total_aihs(df, ano)

    if quantidade_aihs == 0:
        return 0.0

    return total_raca_cor_informada / quantidade_aihs

def total_custo(df: pd.DataFrame, ano: int = 2025) -> float:
    """
    Equivalente em Pandas à medida DAX 'Total Custo',
    adaptada para a base atual do Neon em 2025.
    """

    dados = df.copy()

    dados["ANO_CMPT"] = pd.to_numeric(
        dados["ANO_CMPT"],
        errors="coerce"
    )

    colunas_custo = [
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
        "VAL_PED1AC"
    ]

    for coluna in colunas_custo:
        dados[coluna] = pd.to_numeric(
            dados[coluna],
            errors="coerce"
        )

    dados = dados[dados["ANO_CMPT"] == ano].copy()

    componentes = [
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
        "VAL_PED1AC"
    ]

    custo_componentes = (
        dados[componentes]
        .fillna(0)
        .sum(axis=1)
    )

    custo_por_linha = dados["VAL_TOT"].where(
        dados["VAL_TOT"].notna(),
        custo_componentes
    )

    return float(custo_por_linha.sum())

def total_custo_diabetes(df: pd.DataFrame, ano: int = 2025) -> float:
    """
    Equivalente em Pandas à medida DAX
    'Total Custo Diabetes',
    adaptada para a base atual do Neon em 2025.
    """

    dados = df.copy()

    dados["ANO_CMPT"] = pd.to_numeric(
        dados["ANO_CMPT"],
        errors="coerce"
    )

    diagnostico = (
        dados["DEF_DIAG_PRINC_CAT"]
        .astype("string")
        .str.strip()
        .str[:3]
    )

    colunas_custo = [
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
        "VAL_PED1AC"
    ]

    for coluna in colunas_custo:
        dados[coluna] = pd.to_numeric(
            dados[coluna],
            errors="coerce"
        )

    filtro = (
        (dados["ANO_CMPT"] == ano)
        & diagnostico.isin(["E10", "E11", "E14"])
    )

    dados = dados.loc[filtro].copy()

    componentes = [
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
        "VAL_PED1AC"
    ]

    custo_componentes = (
        dados[componentes]
        .fillna(0)
        .sum(axis=1)
    )

    custo_por_linha = dados["VAL_TOT"].where(
        dados["VAL_TOT"].notna(),
        custo_componentes
    )

    return float(custo_por_linha.sum())

def custo_por_aih(df: pd.DataFrame, ano: int = 2025) -> float:
    """
    Equivalente em Pandas à medida DAX
    'Custo por AIH'.
    """

    custo_total = total_custo(df, ano)
    quantidade_aihs = total_aihs(df, ano)

    if quantidade_aihs == 0:
        return 0.0

    return custo_total / quantidade_aihs

def custo_por_aih_diabeticas(df: pd.DataFrame, ano: int = 2025) -> float:
    """
    Equivalente em Pandas à medida DAX
    'Custo por AIH Diabéticas'.
    """

    custo_diabetes = total_custo_diabetes(df, ano)
    quantidade_aihs = total_aihs(df, ano)

    if quantidade_aihs == 0:
        return 0.0

    return custo_diabetes / quantidade_aihs

def dif_custo_checagem(df: pd.DataFrame, ano: int = 2025) -> float:
    """
    Equivalente em Pandas à medida DAX
    'Dif Custo (checagem)',
    adaptada para a base atual do Neon em 2025.
    """

    dados = df.copy()

    dados["ANO_CMPT"] = pd.to_numeric(
        dados["ANO_CMPT"],
        errors="coerce"
    )

    colunas_custo = [
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
        "VAL_PED1AC"
    ]

    for coluna in colunas_custo:
        dados[coluna] = pd.to_numeric(
            dados[coluna],
            errors="coerce"
        )

    dados = dados[dados["ANO_CMPT"] == ano].copy()

    componentes = [
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
        "VAL_PED1AC"
    ]

    soma_componentes = (
        dados[componentes]
        .fillna(0)
        .sum(axis=1)
    )

    diferenca_por_linha = (
        dados["VAL_TOT"].fillna(0)
        - soma_componentes
    )

    return float(diferenca_por_linha.sum())

def permanencia_total_dias_diabetes(
    df: pd.DataFrame,
    ano: int = 2025
) -> int:
    """
    Equivalente em Pandas à medida DAX
    'Permanência Total (dias) Diabetes',
    adaptada para a base atual do Neon em 2025.
    """

    dados = df.copy()

    dados["ANO_CMPT"] = pd.to_numeric(
        dados["ANO_CMPT"],
        errors="coerce"
    )

    dados["QT_DIARIAS"] = pd.to_numeric(
        dados["QT_DIARIAS"],
        errors="coerce"
    )

    diagnostico = (
        dados["DEF_DIAG_PRINC_CAT"]
        .astype("string")
        .str.strip()
    )

    filtro = (
        (dados["ANO_CMPT"] == ano)
        & diagnostico.str.startswith("E", na=False)
    )

    resultado = (
        dados.loc[filtro, "QT_DIARIAS"]
        .sum()
    )

    return int(resultado)

def permanencia_media_dias(
    df: pd.DataFrame,
    ano: int = 2025
) -> float:
    """
    Equivalente em Pandas à medida DAX
    'Permanência Média (dias)'.
    """

    permanencia_total = permanencia_total_dias_diabetes(df, ano)
    quantidade_aihs = total_aihs(df, ano)

    if quantidade_aihs == 0:
        return 0.0

    return permanencia_total / quantidade_aihs

def media_permanencia(df: pd.DataFrame, ano: int = 2025) -> float:
    """
    Equivalente em Pandas à medida DAX
    'Média Permanência',
    adaptada para a base atual do Neon em 2025.
    """

    dados = df.copy()

    dados["ANO_CMPT"] = pd.to_numeric(
        dados["ANO_CMPT"],
        errors="coerce"
    )

    dados["DIAS_PERM"] = pd.to_numeric(
        dados["DIAS_PERM"],
        errors="coerce"
    )

    filtro = dados["ANO_CMPT"] == ano

    resultado = dados.loc[
        filtro,
        "DIAS_PERM"
    ].mean()

    return float(resultado)

def obitos_gerais(df: pd.DataFrame, ano: int = 2025) -> int:
    """
    Equivalente em Pandas à medida DAX
    'Óbitos Gerais',
    adaptada para a base atual do Neon em 2025.
    """

    dados = df.copy()

    dados["ANO_CMPT"] = pd.to_numeric(
        dados["ANO_CMPT"],
        errors="coerce"
    )

    dados["MORTE"] = pd.to_numeric(
        dados["MORTE"],
        errors="coerce"
    )

    definicao_morte = (
        dados["DEF_MORTE"]
        .astype("string")
        .str.strip()
    )

    filtro = (
        (dados["ANO_CMPT"] == ano)
        & (
            (dados["MORTE"] == 1)
            | (definicao_morte == "Com óbito")
        )
    )

    resultado = dados.loc[
        filtro,
        "N_AIH"
    ].nunique(dropna=False)

    return int(resultado)

def idade_media(df: pd.DataFrame, ano: int = 2025) -> float:
    """
    Equivalente em Pandas à medida DAX
    'Idade Média'.

    Adaptação:
    def_idade_anos.1 (Power BI) -> DEF_IDADE_ANOS (Neon)
    """

    dados = df.copy()

    dados["ANO_CMPT"] = pd.to_numeric(
        dados["ANO_CMPT"],
        errors="coerce"
    )

    dados["DEF_IDADE_ANOS"] = pd.to_numeric(
        dados["DEF_IDADE_ANOS"],
        errors="coerce"
    )

    filtro = dados["ANO_CMPT"] == ano

    resultado = dados.loc[
        filtro,
        "DEF_IDADE_ANOS"
    ].mean()

    return float(resultado)

def aihs_complicacoes_maternas(
    df: pd.DataFrame,
    ano: int = 2025
) -> int:
    """
    Equivalente em Pandas à medida DAX
    'AIHs Complicações Maternas',
    adaptada para a base atual do Neon em 2025.
    """

    dados = df.copy()

    dados["ANO_CMPT"] = pd.to_numeric(
        dados["ANO_CMPT"],
        errors="coerce"
    )

    diagnostico = (
        dados["DEF_DIAG_PRINC_CAT"]
        .astype("string")
        .str.strip()
    )

    filtro_complicacoes = (
        diagnostico.str.contains("O14", case=False, regex=False, na=False)
        | diagnostico.str.contains("O15", case=False, regex=False, na=False)
        | diagnostico.str.contains("O72", case=False, regex=False, na=False)
        | diagnostico.str.contains("O85", case=False, regex=False, na=False)
    )

    filtro = (
        (dados["ANO_CMPT"] == ano)
        & diagnostico.notna()
        & filtro_complicacoes
    )

    resultado = dados.loc[
        filtro,
        "N_AIH"
    ].nunique(dropna=False)

    return int(resultado)

def res_latd_dec(
    df: pd.DataFrame,
    ano: int = 2025
) -> pd.Series:
    """
    Adaptação da medida DAX 'res_LATD_DEC'.

    No Neon, RES_LATITUDE já está armazenada em graus decimais.
    Portanto, não é necessária a divisão por 100000.
    """

    dados = df.copy()

    dados["ANO_CMPT"] = pd.to_numeric(
        dados["ANO_CMPT"],
        errors="coerce"
    )

    dados["RES_LATITUDE"] = pd.to_numeric(
        dados["RES_LATITUDE"],
        errors="coerce"
    )

    filtro = dados["ANO_CMPT"] == ano

    return dados.loc[
        filtro,
        "RES_LATITUDE"
    ]