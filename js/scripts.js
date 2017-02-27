// Empty JS for your own code to be here

var fevereiro = {
    "mes": 2,
    "ano": 2017,
    "creditos": 6046.22,
    "debitos": 500,
    "lancamentos": [
        {"tipo": "credito", "descricao": "pagamento", "quantidade": 1, "inclusao": "01/02/2017", "valor": 6046.22},
        {"tipo": "debito", "descricao": "condomínio", "quantidade": 1, "inclusao": "10/02/2017", "valor": 300},
        {"tipo": "debito", "descricao": "transporte escolar", "quantidade": 1, "inclusao": "10/02/2017", "valor": 200}
    ]
};

var marco = {
    "mes": 3,
    "ano": 2017,
    "creditos": 7000,
    "debitos": 500,
    "lancamentos": [
        {"tipo": "credito", "descricao": "pagamento", "quantidade": 1, "inclusao": "01/03/2017", "valor": 7000},
        {"tipo": "debito", "descricao": "cartão de crédito", "quantidade": 1, "inclusao": "15/03/2017", "valor": 300},
        {"tipo": "debito", "descricao": "riocard", "quantidade": 1, "inclusao": "10/03/2017", "valor": 200}
    ]
};

var lista = {
    "meses": [2, 3],
    "anos": [2017],
    "dados": [fevereiro, marco]
};

var selecionado;

$(document).ready(function () {

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
    $('#form-lancamento')[0].reset();
    $('#list-lancamento tr').not(':first').remove();
    var html = '';
    var x;
    for (x in selecionado.lancamentos) {
        html += '<tr ';
        html += ((x % 2) === 0) ? 'class="odd" >' : 'class="even" >';
        html += '<td><a href="#" onclick="get_lancamento(' + x + ')">' + selecionado.lancamentos[x].descricao + '</a></td>' +
                '<td>' + selecionado.lancamentos[x].inclusao + '</td>';
        html += selecionado.lancamentos[x].tipo === 'credito' ?
                '<td class="creditos valor">' : '<td class="debitos valor">';
        html += (selecionado.lancamentos[x].quantidade * selecionado.lancamentos[x].valor).toFixed(2) + '</td>' +
                '</tr>\n';
    }
    $('#list-lancamento tr').first().after(html);
}

function get_lancamento(item) {

    var lancamento = selecionado.lancamentos[item];

    $('#descricao').val(lancamento.descricao);
    $('#quantidade').val(lancamento.quantidade);
    $('#valor').val(lancamento.valor);
    $('#inclusao').val(lancamento.inclusao);
    $('#tipo').val(lancamento.tipo);

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