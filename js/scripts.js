var periodos;

var lancamentos;

var tabela;

var saldo_atual = 0;

$(document).ready(function () {

    $("#div-load-data").hide();

    $("#list-lancamento").hide();

    carregar_dados_periodos();

    $('#btn-hoje').click(function () {
        now();
    });

    $('#list-periodos').change(function () {
        selecionar_lancamentos();
    });

    $('#btn-limpar').click(function () {
        lancamento_reset();
    });

    $('#btn-link').hide();


    $('#inclusao').datepicker({
        buttonText: "data do lançamento",
        showButtonPanel: true,
        changeMonth: true,
        changeYear: true
    });

});

function carregar_periodos() {
    var meses = ['', 'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio',
        'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro',
        'Novembro', 'Dezembro'];
    var x;
    $('#list-periodos').empty();
    for (x in periodos) {
        var value = periodos[x].ano + '-' + periodos[x].mes;
        var text = meses[periodos[x].mes];
        $('#list-periodos')
                .append($("<option></option>")
                        .attr("value", value)
                        .text(text));
    }
    var prevGroup, $group = $();
    $('#list-periodos option').remove().each(function () {
        var $option = $(this),
                values = $option.val().split('-'),
                group = values[0];

        if (group != prevGroup) {
            $group = $('<optgroup />', {label: group}).appendTo('#list-periodos');
        }

        $group.append($('<option />', {
            text: meses[values[1]],
            value: values[0] + '-' + values[1]
        }));

        prevGroup = group;
    });
}

function now() {
    var now = new Date();
    var month = now.getMonth() + 1;
    var year = now.getFullYear();
    $('#list-periodos').val(year + '-' + month);
    selecionar_lancamentos();
}

function carregar_lista() {
    lancamento_reset();
    if (tabela != null) {
        try {
            tabela.destroy();
        } catch (e) {
            console.info(e);
        }
    }
    var html = '';
    var creditos = 0;
    var debitos = 0;
    var x;
    for (x in lancamentos) {
        html += '<tr ';
        html += ((x % 2) === 0) ? 'class="item odd" >' : 'class="item even" >';
        html += '<td style="width: 80%;"><a class="link_descricao" href="#" onclick="get_lancamento(' + x + ')">' + lancamentos[x].descricao + '</a></td>';
        html += '<td>' + (lancamentos[x].categorias == null ? '' : lancamentos[x].categorias) + '</td>';
        html += '<td>' + lancamentos[x].f_inclusao + '</td>';
        html += lancamentos[x].tipo === 'credito' ?
                '<td class="creditos valor">' : '<td class="debitos valor">';
        html += (lancamentos[x].valor_total).toFixed(2) + '</td>' +
                '</tr>\n';
        if (lancamentos[x].tipo === 'credito') {
            if (!isNaN(lancamentos[x].valor_total)) {
                creditos += lancamentos[x].valor_total;
            }
        } else {
            if (!isNaN(lancamentos[x].valor_total)) {
                debitos += lancamentos[x].valor_total;
            }
        }
    }

    $('.creditos').html(new Number(creditos).toFixed(2));
    $('.debitos').html(new Number(debitos).toFixed(2));

    saldo_atual = creditos - debitos;

    $('.valor-saldo').html(Math.abs(saldo_atual).toFixed(2));

    if (saldo_atual >= 0) {
        $('.valor-saldo').css('color', 'blue');
    } else {
        $('.valor-saldo').css('color', 'red');
    }

    $('#list-lancamento tbody').html(html);

    tabela = $('#list-lancamento').DataTable(
            {
                "bPaginate": false,
                "bStateSave": true,
                "responsive": true,
                "columnDefs": [
                    {"targets": [1], "visible": false}
                ],
                "order": [[2, 'asc']],
                "oLanguage": {
                    "sInfo": "Resultado _START_ a _END_ de _TOTAL_ ",
                    "sSearch": "Buscar:",
                    "sLengthMenu": 'Registros: _MENU_ ',
                    "sInfoFiltered": "(filtro de _MAX_ total registros)",
                    "sInfoEmpty": "Nenhum resultado",
                    "oPaginate": {
                        "sPrevious": "Anterior",
                        "sNext": "Próxima"
                    }
                },
                "fnDrawCallback": function () {
                    calcular();
                }
            }

    );

    $('#list-lancamento_filter label').
            append('<button type="button" id="btn_limpar" class="btn btn-default">Limpar</button>');

    $('#btn_limpar').click(function () {
        $('input:text').val('');
        $('#list-lancamento').dataTable().fnFilter('');
    });

    $("#btn-topo").click(function () {
        $("html, body").animate({scrollTop: 0}, "slow");
    });

    update_cache();

    $("#list-lancamento").show();
}

function get_lancamento(item) {

    var lancamento = lancamentos[item];

    lancamento_reset();

    $('#descricao').val(lancamento.descricao);
    $('#quantidade').val(lancamento.quantidade);
    $('#valor').val(lancamento.valor);
    $('#inclusao').val(lancamento.f_inclusao);
    $('#tipo').val(lancamento.tipo);
    $('#categorias').val(lancamento.categorias);
    if (lancamento.link != null && lancamento.link.length != 0) {
        $('#link').val(decodeURIComponent(lancamento.link));
        $('#btn-link').attr('href', $('#link').val());
        $('#btn-link').show();
    } else {
        $('#btn-link').hide();
    }

    var result = $('a[href="#panel-element-lancamento"]').attr('aria-expanded');
    if ((result == 'true') ? false : true) {
        $('a[href="#panel-element-lancamento"]').trigger('click');
    }
    $('#descricao').focus();
}

function selecionar_lancamentos() {
    var op = $('#list-periodos option:selected');

    if (op[0] != null) {

        var index = periodos[op[0].index];

        $('#label-year').html(index.ano);

        show_lancamentos(index);

    }
}

function lancamento_reset() {
    $('#form-lancamento')[0].reset();
    $('#btn-link').hide();
}

function calcular() {
    var creditos = 0;
    var debitos = 0;
    $("tr.item").each(function () {
        $this = $(this)
        var valor_credito = $this.find("td.creditos").html();
        if (!isNaN(valor_credito)) {
            creditos += new Number(valor_credito);
        }
        var value_debito = $this.find("td.debitos").html();
        if (!isNaN(value_debito)) {
            debitos += new Number(value_debito);
        }
    });
    var resultado = creditos - debitos;
    $('#total').html(Math.abs(resultado).toFixed(2));
    if (resultado >= 0) {
        $('#total').removeClass('debitos');
        $('#total').addClass('creditos');
    } else {
        $('#total').removeClass('creditos');
        $('#total').addClass('debitos');
    }

}

function carregar_dados_periodos() {
    var cache = localStorage.getItem("periodos-cache");
    $("#div-load-data").show();
    if (cache == null) {
        $.ajax({
            url: 'dados/json.php',
            data: {comando: 'periodos', usuario: 1},
            dataType: 'json'})
                .done(function (data) {
                    show_lancamentos
                    periodos = data;
                    localStorage.setItem("periodos-cache", JSON.stringify(data));
                    carregar_periodos();
                    now();
                })
                .fail(function () {
                    $("#div-load-data").html('Falha ao recuperar os dados!');
                })
                .always(function () {
                    $("#div-load-data").hide();
                    $("#div-load-data").html('Carregando...');
                });

    } else {
        periodos = JSON.parse(localStorage.getItem("periodos-cache"));
        carregar_periodos();
        now();
        $("#div-load-data").hide();
    }
}

function show_lancamentos(index) {
    $("#div-load-data").show();
    $.ajax({
        url: 'dados/json.php',
        timeout: 3000,
        data: {comando: 'periodo', usuario: 1, mes: index.mes, ano: index.ano},
        dataType: 'json'})
            .done(function (data) {
                if (data != null) {
                    lancamentos = data[0].lancamentos;
                }
                carregar_lista();
                $("#div-load-data").hide();
            })
            .fail(function () {
                lancamentos = index.lancamentos;
                carregar_lista();
                $("#div-load-data").hide();
            });

}


function update_cache() {
    var op = $('#list-periodos option:selected');

    if (op[0] !== null) {
        var index = periodos[op[0].index];
        if (saldo_atual.toFixed(2) !== new Number(index.balanco).toFixed(2)) {
            var i = op[0].index;
            console.log(i);
            var vcreditos = new Number($('.creditos').html()).toFixed(2);
            var vdebitos = new Number($('.debitos').html()).toFixed(2)
            index['creditos'] = vcreditos;
            index['debitos'] = vdebitos;
            index['balanco'] = saldo_atual.toFixed(2);
            index['lancamentos'] = lancamentos;
            console.log(index);
            periodos[i] = index;
            localStorage.setItem("periodos-cache", JSON.stringify(periodos));
        }
    }
}