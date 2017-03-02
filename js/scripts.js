var lista;

var selecionado;

var tabela;


$(document).ready(function () {


    $.ajax({
        async: false,
        url: "dados/test.json",
        dataType: "json",
        success: function (data) {
            lista = eval(data);
        }
    });

    carregar_meses();
    carregar_anos();

    now();

    $('#btn-previous').click(function () {
        move_previous();
    });
    $('#btn-next').click(function () {
        move_next();
    });

    $('#btn-hoje').click(function () {
        now();
    });

    $('#list-month').change(function () {
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

function carregar_meses() {
    var meses = ['', 'janeiro', 'fevereiro', 'março', 'abril', 'maio',
        'junho', 'julho', 'agosto', 'setembro', 'outubro',
        'novembro', 'dezembro'];
    var x;
    for (x in lista.meses) {
        $('#list-month')
                .append($("<option></option>")
                        .attr("value", lista.meses[x])
                        .text(meses[lista.meses[x]]));
    }
}

function carregar_anos() {
    var x;
    for (x in lista.anos) {
        $('#list-year')
                .append($("<option></option>")
                        .attr("value", lista.anos[x])
                        .text(lista.anos[x]));
    }
}

function move_previous() {
    var op = $('#list-month option:selected');
    if (op[0].index > 0) {
        var i = op.val();
        i--;
        $('#list-month').val(i);
        selecionar_lancamentos();
    }
}

function move_next() {
    var op = $('#list-month option:selected');
    var ops = $('#list-month option');
    var index = op[0].index;
    var last = ops.length - 1;
    if (index < last) {
        var i = op.val();
        i++;
        $('#list-month').val(i);
        selecionar_lancamentos();
    }
}


function now() {
    var now = new Date();
    var month = now.getMonth() + 1;
    var year = now.getFullYear();

    $('#list-month').val(month);
    $('#list-year').val(year);
    selecionar_lancamentos();
}

function carregar_lista() {
    lancamento_reset();
    //$('#list-lancamento tr').not(':first').not(':last').remove();
    try {
        tabela.destroy();
    } catch (e) {
        console.info(e);
    }
    var html = '';
    var x;
    for (x in selecionado.lancamentos) {
        html += '<tr ';
        html += ((x % 2) === 0) ? 'class="item odd" >' : 'class="item even" >';
        html += '<td><a class="link_descricao" href="#" onclick="get_lancamento(' + x + ')">' + selecionado.lancamentos[x].descricao + '</a></td>' +
                '<td>' + selecionado.lancamentos[x].f_inclusao + '</td>';
        html += selecionado.lancamentos[x].tipo === 'credito' ?
                '<td class="creditos valor">' : '<td class="debitos valor">';
        html += (selecionado.lancamentos[x].valor_total).toFixed(2) + '</td>' +
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
}

function get_lancamento(item) {

    var lancamento = selecionado.lancamentos[item];

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
    var op = $('#list-month option:selected');

    selecionado = lista.dados[op[0].index];

    $('.creditos').html(selecionado.creditos.toFixed(2));
    $('.debitos').html(selecionado.debitos.toFixed(2));

    var saldo = selecionado.creditos - selecionado.debitos;

    $('.valor-saldo').html(Math.abs(saldo).toFixed(2));

    if (saldo >= 0) {
        $('.valor-saldo').css('color', 'blue');
    } else {
        $('.valor-saldo').css('color', 'red');
    }
    carregar_lista();

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