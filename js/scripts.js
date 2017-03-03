var lista;

var lancamentos;

var tabela;

$(document).ready(function () {

    $("#list-lancamento-load").hide();

    $("#list-lancamento").hide();

    $.ajax({
        url: 'dados/json.php',
        data: {comando: 1, usuario: 1},
        dataType: 'json',
        success: function (data) {
            lista = data;
            carregar_periodos();
            now();
        }
    });


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
    for (x in lista) {
        var value = lista[x].ano + '-' + lista[x].mes;
        var text = lista[x].ano + ' (' + meses[lista[x].mes] +')';
        $('#list-periodos')
                .append($("<option></option>")
                        .attr("value", value)
                        .text(text));
    }
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
    //$('#list-lancamento tr').not(':first').not(':last').remove();
    if( tabela != null ) {
        try {
            tabela.destroy();
        } catch (e) {
            console.info(e);
        }
    }
    var html = '';
    var x;
    for (x in lancamentos) {
        html += '<tr ';
        html += ((x % 2) === 0) ? 'class="item odd" >' : 'class="item even" >';
        html += '<td><a class="link_descricao" href="#" onclick="get_lancamento(' + x + ')">' + lancamentos[x].descricao + '</a></td>' +
                '<td>' + lancamentos[x].f_inclusao + '</td>';
        html += lancamentos[x].tipo === 'credito' ?
                '<td class="creditos valor">' : '<td class="debitos valor">';
        html += (lancamentos[x].valor_total).toFixed(2) + '</td>' +
                '</tr>\n';
    }
    $('#list-lancamento tbody').html(html);

    tabela = $('#list-lancamento').DataTable(
            {
                "bPaginate": false,
                "bStateSave": true,
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

        var index = lista[op[0].index];
        
        $('.creditos').html(index.creditos.toFixed(2));
        $('.debitos').html(index.debitos.toFixed(2));

        var saldo = index.balanco;

        $('.valor-saldo').html(Math.abs(saldo).toFixed(2));

        if (saldo >= 0) {
            $('.valor-saldo').css('color', 'blue');
        } else {
            $('.valor-saldo').css('color', 'red');
        }
        
        $("#list-lancamento-load").show();

        $.ajax({
            url: 'dados/json.php',
            data: {comando: 2, usuario: 1, mes: index.mes, ano: index.ano},
            dataType: 'json',
            success: function (data) {
                lancamentos = data;
                carregar_lista();
                $("#list-lancamento-load").hide();
            }
        });

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