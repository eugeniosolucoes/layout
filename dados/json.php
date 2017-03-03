<?php

require_once './conexao.class.php';

function get_conexao() {
    $conexao = new Conexao();
    $link = mysql_connect($conexao->host, $conexao->user, $conexao->pwd);
    mysql_select_db($conexao->database, $link);
    return $link;
}

function get_periodos() {

    $sql_periodos = "SELECT mes, ano, creditos, debitos, balanco FROM `vw_periodos_json` WHERE usuario = ";

    $link = get_conexao();

    $usuario = filter_input(INPUT_GET, 'usuario');

    if (is_numeric($usuario)) {

        $sql_periodos .= $usuario;

        $result = mysql_query($sql_periodos, $link);

        $rows = array();
        while ($r = mysql_fetch_assoc($result)) {
            $rows[] = $r;
        }
        Header('Content-Type: application/json');

        die(json_encode($rows, JSON_UNESCAPED_SLASHES |  JSON_NUMERIC_CHECK));
    }
}

function get_lancamentos() {

    $sql_lancamentos = "SELECT * FROM `vw_lancamentos_json` WHERE ";

    $link = get_conexao();

    $usuario = filter_input(INPUT_GET, 'usuario');
    $mes = filter_input(INPUT_GET, 'mes');
    $ano = filter_input(INPUT_GET, 'ano');

    if (is_numeric($usuario) && is_numeric($mes) && is_numeric($ano)) {

        $sql_lancamentos .= ' usuario = ' . $usuario;
        $sql_lancamentos .= ' AND mes = ' . $mes;
        $sql_lancamentos .= ' AND ano = ' . $ano;

        $result = mysql_query($sql_lancamentos, $link);

        $rows = array();
        while ($r = mysql_fetch_assoc($result)) {
            $rows[] = $r;
        }
        Header('Content-Type: application/json');

        die(json_encode($rows, JSON_UNESCAPED_SLASHES |  JSON_NUMERIC_CHECK));
    }
}

$comando = filter_input(INPUT_GET, 'comando');

switch ($comando) {
    case 1:
        get_periodos();
        break;
    case 2:
        get_lancamentos();
        break;
}
