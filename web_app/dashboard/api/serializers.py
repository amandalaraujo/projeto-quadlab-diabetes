# Este projeto expõe dados agregados (KPIs e figuras Plotly já prontas),
# não linhas cruas de AtendimentosDiabetes — por isso não há um
# ModelSerializer tradicional aqui. Se no futuro vocês precisarem
# expor uma listagem paginada de atendimentos (ex: para uma tabela
# detalhada), criem o serializer aqui, por exemplo:
#
# from rest_framework import serializers
# from ..models import AtendimentosDiabetes
#
# class AtendimentoSerializer(serializers.ModelSerializer):
#     class Meta:
#         model = AtendimentosDiabetes
#         fields = [
#             "mes_cmpt", "ano_cmpt", "sexo", "idade", "uf_zi",
#             "munic_res", "tipo_complicacao", "val_tot", "morte",
#         ]
