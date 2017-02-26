// Empty JS for your own code to be here

var dados = {
    "creditos": 6046.22,
    "debitos": 7344,
    "lancamentos": [
        {"tipo": "credito", "descricao": "pagamento", "quantidade": 1, "inclusao": "01/03/2017", "valor": 6046.22},
        {"tipo": "debito", "descricao": "condomínio", "quantidade": 1, "inclusao": "10/03/2017", "valor": 275},
        {"tipo": "debito", "descricao": "transporte escolar", "quantidade": 1, "inclusao": "10/03/2017", "valor": 167}
    ]
};

$(document).ready(function () {

    carregar_anos();

    get_hoje();

    $('#btn-previous').click(function () {
        move_previous();
    });
    $('#btn-next').click(function () {
        move_next();
    });

    $('#btn-hoje').click(function () {
        get_hoje();
    });


    $('.creditos').html(dados.creditos.toFixed(2));
    $('.debitos').html(dados.debitos.toFixed(2));

    var saldo = dados.creditos - dados.debitos;

    $('.valor-saldo').html(Math.abs(saldo).toFixed(2));

    if (saldo >= 0) {
        $('.valor-saldo').css('color', 'blue');
    } else {
        $('.valor-saldo').css('color', 'red');
    }

    carregar_lista();

});


function carregar_anos() {
    for (i = 2008; i <= 2020; i++) {
        $('#list-year')
                .append($("<option></option>")
                        .attr("value", i)
                        .text(i));
    }
}

function move_previous() {
    var month = get_selected_value('list-month');
    var year = get_selected_value('list-year');
    var next_month = (month < 2) ? 12 : --month;
    var next_year = (next_month === 12) ? --year : year;
    if (next_year >= document.getElementById("list-year")[0].value) {
        document.getElementById("list-month").value = next_month;
        document.getElementById("list-year").value = next_year;
    }
}

function move_next() {
    var month = get_selected_value('list-month');
    var year = get_selected_value('list-year');
    var next_month = (month > 11) ? 1 : ++month;
    var next_year = (next_month === 1) ? ++year : year;
    if (next_month <= 12 && next_year <= document.getElementById("list-year")
            [document.getElementById("list-year").length - 1].value) {
        document.getElementById("list-month").value = next_month;
        document.getElementById("list-year").value = next_year;
    }
}

function get_selected_value(id) {
    var x = document.getElementById(id);
    var value = -1;
    for (i = 0; i < x.options.length; i++) {
        if (x.options[i].selected) {
            value = x.options[i].value;
            break;
        }
    }
    return value;
}


function get_hoje() {
    var now = new Date();
    var month = now.getMonth() + 1;
    var year = now.getFullYear();

    document.getElementById("list-month").value = month;
    document.getElementById("list-year").value = year;
}

function carregar_lista() {
    $('#list-lancamento tr').not(':first').not(':last').remove();
    var html = '';
    var x;
    for (x in dados.lancamentos) {
        html += '<tr ';
        html += ((x % 2) === 0) ? 'class="odd" >' : 'class="even" >';
        html += '<td><a href="#" onclick="get_lancamento('+x+')">' + dados.lancamentos[x].descricao + '</a></td>' +
                '<td>' + dados.lancamentos[x].inclusao + '</td>';
        html += dados.lancamentos[x].tipo === 'credito' ? 
        '<td class="creditos valor">':'<td class="debitos valor">' ; 
        html += (dados.lancamentos[x].quantidade * dados.lancamentos[x].valor).toFixed(2) + '</td>' +
                '</tr>\n';
    }
    $('#list-lancamento tr').first().after(html);
}

function get_lancamento(item){
    
    var lancamento = dados.lancamentos[item];
    
    $('#descricao').val(lancamento.descricao);
    $('#quantidade').val(lancamento.quantidade);
    $('#valor').val(lancamento.valor);
    $('#inclusao').val(lancamento.inclusao);
    
    
}