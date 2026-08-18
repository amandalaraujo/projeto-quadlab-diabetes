# This is an auto-generated Django model module.
# You'll have to do the following manually to clean this up:
#   * Rearrange models' order
#   * Make sure each model has one field with primary_key=True
#   * Make sure each ForeignKey and OneToOneField has `on_delete` set to the desired behavior
#   * Remove `managed = False` lines if you wish to allow Django to create, modify, and delete the table
# Feel free to rename the models, but don't rename db_table values or field names.
from django.db import models


class AtendimentosDiabetes(models.Model):
    id = models.IntegerField(primary_key=True, db_column='rowid')
    
    uf_zi = models.BigIntegerField(db_column='UF_ZI', blank=True, null=True)  # Field name made lowercase.
    ano_cmpt = models.BigIntegerField(db_column='ANO_CMPT', blank=True, null=True)  # Field name made lowercase.
    mes_cmpt = models.BigIntegerField(db_column='MES_CMPT', blank=True, null=True)  # Field name made lowercase.
    espec = models.BigIntegerField(db_column='ESPEC', blank=True, null=True)  # Field name made lowercase.
    cgc_hosp = models.TextField(db_column='CGC_HOSP', blank=True, null=True)  # Field name made lowercase. This field type is a guess.
    n_aih = models.BigIntegerField(db_column='N_AIH', blank=True, null=True)  # Field name made lowercase.
    ident = models.BigIntegerField(db_column='IDENT', blank=True, null=True)  # Field name made lowercase.
    cep = models.BigIntegerField(db_column='CEP', blank=True, null=True)  # Field name made lowercase.
    munic_res = models.BigIntegerField(db_column='MUNIC_RES', blank=True, null=True)  # Field name made lowercase.
    nasc = models.BigIntegerField(db_column='NASC', blank=True, null=True)  # Field name made lowercase.
    sexo = models.BigIntegerField(db_column='SEXO', blank=True, null=True)  # Field name made lowercase.
    uti_mes_in = models.BigIntegerField(db_column='UTI_MES_IN', blank=True, null=True)  # Field name made lowercase.
    uti_mes_an = models.BigIntegerField(db_column='UTI_MES_AN', blank=True, null=True)  # Field name made lowercase.
    uti_mes_al = models.BigIntegerField(db_column='UTI_MES_AL', blank=True, null=True)  # Field name made lowercase.
    uti_mes_to = models.BigIntegerField(db_column='UTI_MES_TO', blank=True, null=True)  # Field name made lowercase.
    marca_uti = models.BigIntegerField(db_column='MARCA_UTI', blank=True, null=True)  # Field name made lowercase.
    uti_int_in = models.BigIntegerField(db_column='UTI_INT_IN', blank=True, null=True)  # Field name made lowercase.
    uti_int_an = models.BigIntegerField(db_column='UTI_INT_AN', blank=True, null=True)  # Field name made lowercase.
    uti_int_al = models.BigIntegerField(db_column='UTI_INT_AL', blank=True, null=True)  # Field name made lowercase.
    uti_int_to = models.BigIntegerField(db_column='UTI_INT_TO', blank=True, null=True)  # Field name made lowercase.
    diar_acom = models.BigIntegerField(db_column='DIAR_ACOM', blank=True, null=True)  # Field name made lowercase.
    qt_diarias = models.BigIntegerField(db_column='QT_DIARIAS', blank=True, null=True)  # Field name made lowercase.
    proc_solic = models.BigIntegerField(db_column='PROC_SOLIC', blank=True, null=True)  # Field name made lowercase.
    proc_rea = models.TextField(db_column='PROC_REA', blank=True, null=True)  # Field name made lowercase.
    val_sh = models.TextField(db_column='VAL_SH', blank=True, null=True)  # Field name made lowercase. This field type is a guess.
    val_sp = models.TextField(db_column='VAL_SP', blank=True, null=True)  # Field name made lowercase. This field type is a guess.
    val_sadt = models.TextField(db_column='VAL_SADT', blank=True, null=True)  # Field name made lowercase. This field type is a guess.
    val_rn = models.TextField(db_column='VAL_RN', blank=True, null=True)  # Field name made lowercase. This field type is a guess.
    val_acomp = models.TextField(db_column='VAL_ACOMP', blank=True, null=True)  # Field name made lowercase. This field type is a guess.
    val_ortp = models.TextField(db_column='VAL_ORTP', blank=True, null=True)  # Field name made lowercase. This field type is a guess.
    val_sangue = models.TextField(db_column='VAL_SANGUE', blank=True, null=True)  # Field name made lowercase. This field type is a guess.
    val_sadtsr = models.TextField(db_column='VAL_SADTSR', blank=True, null=True)  # Field name made lowercase. This field type is a guess.
    val_transp = models.TextField(db_column='VAL_TRANSP', blank=True, null=True)  # Field name made lowercase. This field type is a guess.
    val_obsang = models.TextField(db_column='VAL_OBSANG', blank=True, null=True)  # Field name made lowercase. This field type is a guess.
    val_ped1ac = models.TextField(db_column='VAL_PED1AC', blank=True, null=True)  # Field name made lowercase. This field type is a guess.
    val_tot = models.TextField(db_column='VAL_TOT', blank=True, null=True)  # Field name made lowercase. This field type is a guess.
    val_uti = models.TextField(db_column='VAL_UTI', blank=True, null=True)  # Field name made lowercase. This field type is a guess.
    us_tot = models.TextField(db_column='US_TOT', blank=True, null=True)  # Field name made lowercase. This field type is a guess.
    dt_inter = models.BigIntegerField(db_column='DT_INTER', blank=True, null=True)  # Field name made lowercase.
    dt_saida = models.BigIntegerField(db_column='DT_SAIDA', blank=True, null=True)  # Field name made lowercase.
    diag_princ = models.TextField(db_column='DIAG_PRINC', blank=True, null=True)  # Field name made lowercase.
    diag_secun = models.BigIntegerField(db_column='DIAG_SECUN', blank=True, null=True)  # Field name made lowercase.
    cobranca = models.BigIntegerField(db_column='COBRANCA', blank=True, null=True)  # Field name made lowercase.
    natureza = models.BigIntegerField(db_column='NATUREZA', blank=True, null=True)  # Field name made lowercase.
    nat_jur = models.BigIntegerField(db_column='NAT_JUR', blank=True, null=True)  # Field name made lowercase.
    gestao = models.BigIntegerField(db_column='GESTAO', blank=True, null=True)  # Field name made lowercase.
    rubrica = models.BigIntegerField(db_column='RUBRICA', blank=True, null=True)  # Field name made lowercase.
    ind_vdrl = models.BigIntegerField(db_column='IND_VDRL', blank=True, null=True)  # Field name made lowercase.
    munic_mov = models.BigIntegerField(db_column='MUNIC_MOV', blank=True, null=True)  # Field name made lowercase.
    cod_idade = models.BigIntegerField(db_column='COD_IDADE', blank=True, null=True)  # Field name made lowercase.
    idade = models.BigIntegerField(db_column='IDADE', blank=True, null=True)  # Field name made lowercase.
    dias_perm = models.BigIntegerField(db_column='DIAS_PERM', blank=True, null=True)  # Field name made lowercase.
    morte = models.BigIntegerField(db_column='MORTE', blank=True, null=True)  # Field name made lowercase.
    nacional = models.BigIntegerField(db_column='NACIONAL', blank=True, null=True)  # Field name made lowercase.
    num_proc = models.TextField(db_column='NUM_PROC', blank=True, null=True)  # Field name made lowercase. This field type is a guess.
    car_int = models.BigIntegerField(db_column='CAR_INT', blank=True, null=True)  # Field name made lowercase.
    tot_pt_sp = models.BigIntegerField(db_column='TOT_PT_SP', blank=True, null=True)  # Field name made lowercase.
    cpf_aut = models.TextField(db_column='CPF_AUT', blank=True, null=True)  # Field name made lowercase. This field type is a guess.
    homonimo = models.BigIntegerField(db_column='HOMONIMO', blank=True, null=True)  # Field name made lowercase.
    num_filhos = models.BigIntegerField(db_column='NUM_FILHOS', blank=True, null=True)  # Field name made lowercase.
    instru = models.BigIntegerField(db_column='INSTRU', blank=True, null=True)  # Field name made lowercase.
    cid_notif = models.TextField(db_column='CID_NOTIF', blank=True, null=True)  # Field name made lowercase.
    contracep1 = models.BigIntegerField(db_column='CONTRACEP1', blank=True, null=True)  # Field name made lowercase.
    contracep2 = models.BigIntegerField(db_column='CONTRACEP2', blank=True, null=True)  # Field name made lowercase.
    gestrisco = models.BigIntegerField(db_column='GESTRISCO', blank=True, null=True)  # Field name made lowercase.
    insc_pn = models.BigIntegerField(db_column='INSC_PN', blank=True, null=True)  # Field name made lowercase.
    seq_aih5 = models.BigIntegerField(db_column='SEQ_AIH5', blank=True, null=True)  # Field name made lowercase.
    cbor = models.BigIntegerField(db_column='CBOR', blank=True, null=True)  # Field name made lowercase.
    cnaer = models.BigIntegerField(db_column='CNAER', blank=True, null=True)  # Field name made lowercase.
    vincprev = models.BigIntegerField(db_column='VINCPREV', blank=True, null=True)  # Field name made lowercase.
    gestor_cod = models.BigIntegerField(db_column='GESTOR_COD', blank=True, null=True)  # Field name made lowercase.
    gestor_tp = models.BigIntegerField(db_column='GESTOR_TP', blank=True, null=True)  # Field name made lowercase.
    gestor_cpf = models.BigIntegerField(db_column='GESTOR_CPF', blank=True, null=True)  # Field name made lowercase.
    gestor_dt = models.TextField(db_column='GESTOR_DT', blank=True, null=True)  # Field name made lowercase. This field type is a guess.
    cnes = models.BigIntegerField(db_column='CNES', blank=True, null=True)  # Field name made lowercase.
    cnpj_mant = models.TextField(db_column='CNPJ_MANT', blank=True, null=True)  # Field name made lowercase. This field type is a guess.
    infehosp = models.TextField(db_column='INFEHOSP', blank=True, null=True)  # Field name made lowercase. This field type is a guess.
    cid_asso = models.BigIntegerField(db_column='CID_ASSO', blank=True, null=True)  # Field name made lowercase.
    cid_morte = models.BigIntegerField(db_column='CID_MORTE', blank=True, null=True)  # Field name made lowercase.
    complex = models.BigIntegerField(db_column='COMPLEX', blank=True, null=True)  # Field name made lowercase.
    financ = models.BigIntegerField(db_column='FINANC', blank=True, null=True)  # Field name made lowercase.
    faec_tp = models.TextField(db_column='FAEC_TP', blank=True, null=True)  # Field name made lowercase. This field type is a guess.
    regct = models.BigIntegerField(db_column='REGCT', blank=True, null=True)  # Field name made lowercase.
    raca_cor = models.BigIntegerField(db_column='RACA_COR', blank=True, null=True)  # Field name made lowercase.
    etnia = models.TextField(db_column='ETNIA', blank=True, null=True)  # Field name made lowercase.
    sequencia = models.BigIntegerField(db_column='SEQUENCIA', blank=True, null=True)  # Field name made lowercase.
    remessa = models.TextField(db_column='REMESSA', blank=True, null=True)  # Field name made lowercase.
    aud_just = models.TextField(db_column='AUD_JUST', blank=True, null=True)  # Field name made lowercase.
    sis_just = models.TextField(db_column='SIS_JUST', blank=True, null=True)  # Field name made lowercase.
    val_sh_fed = models.TextField(db_column='VAL_SH_FED', blank=True, null=True)  # Field name made lowercase. This field type is a guess.
    val_sp_fed = models.TextField(db_column='VAL_SP_FED', blank=True, null=True)  # Field name made lowercase. This field type is a guess.
    val_sh_ges = models.TextField(db_column='VAL_SH_GES', blank=True, null=True)  # Field name made lowercase. This field type is a guess.
    val_sp_ges = models.TextField(db_column='VAL_SP_GES', blank=True, null=True)  # Field name made lowercase. This field type is a guess.
    val_uci = models.TextField(db_column='VAL_UCI', blank=True, null=True)  # Field name made lowercase. This field type is a guess.
    marca_uci = models.BigIntegerField(db_column='MARCA_UCI', blank=True, null=True)  # Field name made lowercase.
    diagsec1 = models.TextField(db_column='DIAGSEC1', blank=True, null=True)  # Field name made lowercase.
    diagsec2 = models.TextField(db_column='DIAGSEC2', blank=True, null=True)  # Field name made lowercase.
    diagsec3 = models.TextField(db_column='DIAGSEC3', blank=True, null=True)  # Field name made lowercase.
    diagsec4 = models.TextField(db_column='DIAGSEC4', blank=True, null=True)  # Field name made lowercase.
    diagsec5 = models.TextField(db_column='DIAGSEC5', blank=True, null=True)  # Field name made lowercase.
    diagsec6 = models.TextField(db_column='DIAGSEC6', blank=True, null=True)  # Field name made lowercase.
    diagsec7 = models.TextField(db_column='DIAGSEC7', blank=True, null=True)  # Field name made lowercase.
    diagsec8 = models.TextField(db_column='DIAGSEC8', blank=True, null=True)  # Field name made lowercase.
    diagsec9 = models.TextField(db_column='DIAGSEC9', blank=True, null=True)  # Field name made lowercase.
    tpdisec1 = models.BigIntegerField(db_column='TPDISEC1', blank=True, null=True)  # Field name made lowercase.
    tpdisec2 = models.BigIntegerField(db_column='TPDISEC2', blank=True, null=True)  # Field name made lowercase.
    tpdisec3 = models.BigIntegerField(db_column='TPDISEC3', blank=True, null=True)  # Field name made lowercase.
    tpdisec4 = models.BigIntegerField(db_column='TPDISEC4', blank=True, null=True)  # Field name made lowercase.
    tpdisec5 = models.BigIntegerField(db_column='TPDISEC5', blank=True, null=True)  # Field name made lowercase.
    tpdisec6 = models.BigIntegerField(db_column='TPDISEC6', blank=True, null=True)  # Field name made lowercase.
    tpdisec7 = models.BigIntegerField(db_column='TPDISEC7', blank=True, null=True)  # Field name made lowercase.
    tpdisec8 = models.BigIntegerField(db_column='TPDISEC8', blank=True, null=True)  # Field name made lowercase.
    tpdisec9 = models.BigIntegerField(db_column='TPDISEC9', blank=True, null=True)  # Field name made lowercase.
    fonte_orc = models.BigIntegerField(db_column='FONTE_ORC', blank=True, null=True)  # Field name made lowercase.
    res_muncod = models.BigIntegerField(db_column='RES_MUNCOD', blank=True, null=True)  # Field name made lowercase.
    res_munnome = models.TextField(db_column='RES_MUNNOME', blank=True, null=True)  # Field name made lowercase.
    res_munnomex = models.TextField(db_column='RES_MUNNOMEX', blank=True, null=True)  # Field name made lowercase.
    res_amazonia = models.TextField(db_column='RES_AMAZONIA', blank=True, null=True)  # Field name made lowercase.
    res_fronteira = models.TextField(db_column='RES_FRONTEIRA', blank=True, null=True)  # Field name made lowercase.
    res_capital = models.TextField(db_column='RES_CAPITAL', blank=True, null=True)  # Field name made lowercase.
    res_msaudcod = models.BigIntegerField(db_column='RES_MSAUDCOD', blank=True, null=True)  # Field name made lowercase.
    res_rsaudcod = models.BigIntegerField(db_column='RES_RSAUDCOD', blank=True, null=True)  # Field name made lowercase.
    res_csaudcod = models.BigIntegerField(db_column='RES_CSAUDCOD', blank=True, null=True)  # Field name made lowercase.
    res_latitude = models.TextField(db_column='RES_LATITUDE', blank=True, null=True)  # Field name made lowercase. This field type is a guess.
    res_longitude = models.TextField(db_column='RES_LONGITUDE', blank=True, null=True)  # Field name made lowercase. This field type is a guess.
    res_altitude = models.TextField(db_column='RES_ALTITUDE', blank=True, null=True)  # Field name made lowercase. This field type is a guess.
    res_area = models.TextField(db_column='RES_AREA', blank=True, null=True)  # Field name made lowercase. This field type is a guess.
    res_codigo_adotado = models.BigIntegerField(db_column='RES_CODIGO_ADOTADO', blank=True, null=True)  # Field name made lowercase.
    res_sigla_uf = models.TextField(db_column='RES_SIGLA_UF', blank=True, null=True)  # Field name made lowercase.
    res_codigo_uf = models.BigIntegerField(db_column='RES_CODIGO_UF', blank=True, null=True)  # Field name made lowercase.
    res_nome_uf = models.TextField(db_column='RES_NOME_UF', blank=True, null=True)  # Field name made lowercase.
    res_regiao = models.TextField(db_column='RES_REGIAO', blank=True, null=True)  # Field name made lowercase.
    int_muncod = models.BigIntegerField(db_column='INT_MUNCOD', blank=True, null=True)  # Field name made lowercase.
    int_munnome = models.TextField(db_column='INT_MUNNOME', blank=True, null=True)  # Field name made lowercase.
    int_munnomex = models.TextField(db_column='INT_MUNNOMEX', blank=True, null=True)  # Field name made lowercase.
    int_amazonia = models.TextField(db_column='INT_AMAZONIA', blank=True, null=True)  # Field name made lowercase.
    int_fronteira = models.TextField(db_column='INT_FRONTEIRA', blank=True, null=True)  # Field name made lowercase.
    int_capital = models.TextField(db_column='INT_CAPITAL', blank=True, null=True)  # Field name made lowercase.
    int_msaudcod = models.BigIntegerField(db_column='INT_MSAUDCOD', blank=True, null=True)  # Field name made lowercase.
    int_rsaudcod = models.BigIntegerField(db_column='INT_RSAUDCOD', blank=True, null=True)  # Field name made lowercase.
    int_csaudcod = models.BigIntegerField(db_column='INT_CSAUDCOD', blank=True, null=True)  # Field name made lowercase.
    int_latitude = models.TextField(db_column='INT_LATITUDE', blank=True, null=True)  # Field name made lowercase. This field type is a guess.
    int_longitude = models.TextField(db_column='INT_LONGITUDE', blank=True, null=True)  # Field name made lowercase. This field type is a guess.
    int_altitude = models.BigIntegerField(db_column='INT_ALTITUDE', blank=True, null=True)  # Field name made lowercase.
    int_area = models.TextField(db_column='INT_AREA', blank=True, null=True)  # Field name made lowercase. This field type is a guess.
    int_codigo_adotado = models.BigIntegerField(db_column='INT_CODIGO_ADOTADO', blank=True, null=True)  # Field name made lowercase.
    int_sigla_uf = models.TextField(db_column='INT_SIGLA_UF', blank=True, null=True)  # Field name made lowercase.
    int_codigo_uf = models.BigIntegerField(db_column='INT_CODIGO_UF', blank=True, null=True)  # Field name made lowercase.
    int_nome_uf = models.TextField(db_column='INT_NOME_UF', blank=True, null=True)  # Field name made lowercase.
    int_regiao = models.TextField(db_column='INT_REGIAO', blank=True, null=True)  # Field name made lowercase.
    res_coordenadas = models.TextField(db_column='RES_COORDENADAS', blank=True, null=True)  # Field name made lowercase.
    int_coordenadas = models.TextField(db_column='INT_COORDENADAS', blank=True, null=True)  # Field name made lowercase.
    def_cod_idade = models.TextField(db_column='DEF_COD_IDADE', blank=True, null=True)  # Field name made lowercase.
    def_idade_anos = models.TextField(db_column='DEF_IDADE_ANOS', blank=True, null=True)  # Field name made lowercase. This field type is a guess.
    def_idade_meses = models.TextField(db_column='DEF_IDADE_MESES', blank=True, null=True)  # Field name made lowercase. This field type is a guess.
    def_idade_dias = models.TextField(db_column='DEF_IDADE_DIAS', blank=True, null=True)  # Field name made lowercase. This field type is a guess.
    codidade = models.BigIntegerField(db_column='CODIDADE', blank=True, null=True)  # Field name made lowercase.
    dia_semana_internacao = models.TextField(db_column='DIA_SEMANA_INTERNACAO', blank=True, null=True)  # Field name made lowercase.
    dia_semana_saida = models.TextField(db_column='DIA_SEMANA_SAIDA', blank=True, null=True)  # Field name made lowercase.
    ano_internacao = models.BigIntegerField(db_column='ANO_INTERNACAO', blank=True, null=True)  # Field name made lowercase.
    ano_saida = models.BigIntegerField(db_column='ANO_SAIDA', blank=True, null=True)  # Field name made lowercase.
    mes_internacao = models.BigIntegerField(db_column='MES_INTERNACAO', blank=True, null=True)  # Field name made lowercase.
    mes_saida = models.BigIntegerField(db_column='MES_SAIDA', blank=True, null=True)  # Field name made lowercase.
    def_reg_metr_res = models.TextField(db_column='DEF_REG_METR_RES', blank=True, null=True)  # Field name made lowercase.
    def_reg_metr_int = models.TextField(db_column='DEF_REG_METR_INT', blank=True, null=True)  # Field name made lowercase.
    def_cir_res = models.TextField(db_column='DEF_CIR_RES', blank=True, null=True)  # Field name made lowercase.
    def_cir_int = models.TextField(db_column='DEF_CIR_INT', blank=True, null=True)  # Field name made lowercase.
    def_aglr_res = models.TextField(db_column='DEF_AGLR_RES', blank=True, null=True)  # Field name made lowercase.
    def_aglr_int = models.TextField(db_column='DEF_AGLR_INT', blank=True, null=True)  # Field name made lowercase.
    def_meso_res = models.TextField(db_column='DEF_MESO_RES', blank=True, null=True)  # Field name made lowercase.
    def_meso_int = models.TextField(db_column='DEF_MESO_INT', blank=True, null=True)  # Field name made lowercase.
    def_micro_res = models.TextField(db_column='DEF_MICRO_RES', blank=True, null=True)  # Field name made lowercase.
    def_micro_int = models.TextField(db_column='DEF_MICRO_INT', blank=True, null=True)  # Field name made lowercase.
    def_rsaud_res = models.TextField(db_column='DEF_RSAUD_RES', blank=True, null=True)  # Field name made lowercase.
    def_rsaud_int = models.TextField(db_column='DEF_RSAUD_INT', blank=True, null=True)  # Field name made lowercase.
    def_csaud_res = models.TextField(db_column='DEF_CSAUD_RES', blank=True, null=True)  # Field name made lowercase.
    def_csaud_int = models.TextField(db_column='DEF_CSAUD_INT', blank=True, null=True)  # Field name made lowercase.
    def_procedimento_realizado = models.TextField(db_column='DEF_PROCEDIMENTO_REALIZADO', blank=True, null=True)  # Field name made lowercase.
    def_procedimento_solicitado = models.TextField(db_column='DEF_PROCEDIMENTO_SOLICITADO', blank=True, null=True)  # Field name made lowercase.
    def_esferajur = models.TextField(db_column='DEF_ESFERAJUR', blank=True, null=True)  # Field name made lowercase.
    def_etnia = models.TextField(db_column='DEF_ETNIA', blank=True, null=True)  # Field name made lowercase.
    def_nacionalidade = models.TextField(db_column='DEF_NACIONALIDADE', blank=True, null=True)  # Field name made lowercase.
    def_cbo = models.TextField(db_column='DEF_CBO', blank=True, null=True)  # Field name made lowercase.
    def_cnae = models.TextField(db_column='DEF_CNAE', blank=True, null=True)  # Field name made lowercase.
    def_leitos = models.TextField(db_column='DEF_LEITOS', blank=True, null=True)  # Field name made lowercase.
    def_diag_princ_cap = models.TextField(db_column='DEF_DIAG_PRINC_CAP', blank=True, null=True)  # Field name made lowercase.
    def_diag_secun_cap = models.TextField(db_column='DEF_DIAG_SECUN_CAP', blank=True, null=True)  # Field name made lowercase. This field type is a guess.
    def_diag_princ_grupo = models.TextField(db_column='DEF_DIAG_PRINC_GRUPO', blank=True, null=True)  # Field name made lowercase.
    def_diag_secun_grupo = models.TextField(db_column='DEF_DIAG_SECUN_GRUPO', blank=True, null=True)  # Field name made lowercase. This field type is a guess.
    def_diag_princ_cat = models.TextField(db_column='DEF_DIAG_PRINC_CAT', blank=True, null=True)  # Field name made lowercase.
    def_diag_secun_cat = models.TextField(db_column='DEF_DIAG_SECUN_CAT', blank=True, null=True)  # Field name made lowercase. This field type is a guess.
    def_diag_princ_subcat = models.TextField(db_column='DEF_DIAG_PRINC_SUBCAT', blank=True, null=True)  # Field name made lowercase.
    def_diag_secun_subcat = models.TextField(db_column='DEF_DIAG_SECUN_SUBCAT', blank=True, null=True)  # Field name made lowercase. This field type is a guess.
    def_uti_mes_to = models.TextField(db_column='DEF_UTI_MES_TO', blank=True, null=True)  # Field name made lowercase.
    def_seq_aih5 = models.TextField(db_column='DEF_SEQ_AIH5', blank=True, null=True)  # Field name made lowercase.
    def_ident = models.TextField(db_column='DEF_IDENT', blank=True, null=True)  # Field name made lowercase.
    def_vincprev = models.TextField(db_column='DEF_VINCPREV', blank=True, null=True)  # Field name made lowercase.
    def_regime = models.TextField(db_column='DEF_REGIME', blank=True, null=True)  # Field name made lowercase.
    def_regct = models.TextField(db_column='DEF_REGCT', blank=True, null=True)  # Field name made lowercase.
    def_faec_tp = models.TextField(db_column='DEF_FAEC_TP', blank=True, null=True)  # Field name made lowercase.
    def_car_int = models.TextField(db_column='DEF_CAR_INT', blank=True, null=True)  # Field name made lowercase.
    def_sexo = models.TextField(db_column='DEF_SEXO', blank=True, null=True)  # Field name made lowercase.
    def_marca_uti = models.TextField(db_column='DEF_MARCA_UTI', blank=True, null=True)  # Field name made lowercase.
    def_cobranca = models.TextField(db_column='DEF_COBRANCA', blank=True, null=True)  # Field name made lowercase.
    def_nat_jur = models.TextField(db_column='DEF_NAT_JUR', blank=True, null=True)  # Field name made lowercase.
    def_gestao = models.TextField(db_column='DEF_GESTAO', blank=True, null=True)  # Field name made lowercase.
    def_ind_vdrl = models.TextField(db_column='DEF_IND_VDRL', blank=True, null=True)  # Field name made lowercase.
    def_morte = models.TextField(db_column='DEF_MORTE', blank=True, null=True)  # Field name made lowercase.
    def_homonimo = models.TextField(db_column='DEF_HOMONIMO', blank=True, null=True)  # Field name made lowercase.
    def_instru = models.TextField(db_column='DEF_INSTRU', blank=True, null=True)  # Field name made lowercase.
    def_contracep1 = models.TextField(db_column='DEF_CONTRACEP1', blank=True, null=True)  # Field name made lowercase.
    def_contracep2 = models.TextField(db_column='DEF_CONTRACEP2', blank=True, null=True)  # Field name made lowercase.
    def_gestrisco = models.TextField(db_column='DEF_GESTRISCO', blank=True, null=True)  # Field name made lowercase.
    def_infehosp = models.TextField(db_column='DEF_INFEHOSP', blank=True, null=True)  # Field name made lowercase. This field type is a guess.
    def_complex = models.TextField(db_column='DEF_COMPLEX', blank=True, null=True)  # Field name made lowercase.
    def_financ = models.TextField(db_column='DEF_FINANC', blank=True, null=True)  # Field name made lowercase.
    def_raca_cor = models.TextField(db_column='DEF_RACA_COR', blank=True, null=True)  # Field name made lowercase.
    def_marca_uci = models.TextField(db_column='DEF_MARCA_UCI', blank=True, null=True)  # Field name made lowercase.
    def_tpdisec1 = models.TextField(db_column='DEF_TPDISEC1', blank=True, null=True)  # Field name made lowercase.
    def_tpdisec2 = models.TextField(db_column='DEF_TPDISEC2', blank=True, null=True)  # Field name made lowercase.
    def_tpdisec3 = models.TextField(db_column='DEF_TPDISEC3', blank=True, null=True)  # Field name made lowercase.
    def_tpdisec4 = models.TextField(db_column='DEF_TPDISEC4', blank=True, null=True)  # Field name made lowercase.
    def_tpdisec5 = models.TextField(db_column='DEF_TPDISEC5', blank=True, null=True)  # Field name made lowercase.
    def_tpdisec6 = models.TextField(db_column='DEF_TPDISEC6', blank=True, null=True)  # Field name made lowercase.
    def_tpdisec7 = models.TextField(db_column='DEF_TPDISEC7', blank=True, null=True)  # Field name made lowercase.
    def_tpdisec8 = models.TextField(db_column='DEF_TPDISEC8', blank=True, null=True)  # Field name made lowercase.
    def_tpdisec9 = models.TextField(db_column='DEF_TPDISEC9', blank=True, null=True)  # Field name made lowercase.
    def_identific = models.TextField(db_column='DEF_IDENTIFIC', blank=True, null=True)  # Field name made lowercase.
    def_n_aih = models.TextField(db_column='DEF_N_AIH', blank=True, null=True)  # Field name made lowercase.
    def_idade_bas = models.TextField(db_column='DEF_IDADE_BAS', blank=True, null=True)  # Field name made lowercase.
    def_idade_pub = models.TextField(db_column='DEF_IDADE_PUB', blank=True, null=True)  # Field name made lowercase.
    def_idade_18 = models.TextField(db_column='DEF_IDADE_18', blank=True, null=True)  # Field name made lowercase.
    def_num_filhos = models.TextField(db_column='DEF_NUM_FILHOS', blank=True, null=True)  # Field name made lowercase.
    def_dias_perm = models.TextField(db_column='DEF_DIAS_PERM', blank=True, null=True)  # Field name made lowercase.
    tipo_complicacao = models.TextField(db_column='TIPO_COMPLICACAO', blank=True, null=True)  # Field name made lowercase.

    class Meta:
        managed = False
        db_table = 'atendimentos_diabetes'