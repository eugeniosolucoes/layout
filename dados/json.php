<?php

require_once './conexao.class.php';

function get_conexao() {
    $conexao = new Conexao();
    $link = mysql_connect($conexao->host, $conexao->user, $conexao->pwd);
    mysql_select_db($conexao->database, $link);
    return $link;
}

function get_periodos() {
    $ano_corrente = date("Y");
    $limite = 1;
    $sql_periodos = "SELECT mes, ano, creditos, debitos, balanco FROM `vw_periodos_json` WHERE usuario = ";
    $link = get_conexao();
    $usuario = filter_input(INPUT_GET, 'usuario');
    if (is_numeric($usuario)) {
        $sql_periodos .= $usuario;
        $sql_periodos .= ' ORDER BY ano, mes ';
        $result = mysql_query($sql_periodos, $link);
        $rows = array();
        while ($r = mysql_fetch_assoc($result)) {
            if ($r['ano'] >= ($ano_corrente - $limite) && $r['ano'] <= ($ano_corrente + $limite)) {
                $r['lancamentos'] = get_lancamento($usuario, $r['ano'], $r['mes']);
            } 
            $rows[] = $r;
        }
        Header('Content-Type: application/json');
        die(json_encode($rows, JSON_UNESCAPED_SLASHES | JSON_NUMERIC_CHECK));
    }
}

function get_periodo() {
    $sql_periodos = "SELECT mes, ano, creditos, debitos, balanco FROM `vw_periodos_json` WHERE usuario = ";
    $link = get_conexao();
    $usuario = filter_input(INPUT_GET, 'usuario');
    $ano = filter_input(INPUT_GET, 'ano');
    $mes = filter_input(INPUT_GET, 'mes');
    if (is_numeric($usuario) && is_numeric($ano) && is_numeric($mes)) {
        $sql_periodos .= $usuario;
        $sql_periodos .= ' AND ano = ' . $ano;
        $sql_periodos .= ' AND mes = ' . $mes;
        $result = mysql_query($sql_periodos, $link);
        $rows = array();
        while ($r = mysql_fetch_assoc($result)) {
            $r['lancamentos'] = get_lancamento($usuario, $r['ano'], $r['mes']);
            $rows[] = $r;
        }
        Header('Content-Type: application/json');
        die(json_encode($rows, JSON_UNESCAPED_SLASHES | JSON_NUMERIC_CHECK));
    }
}

function get_lancamento($usuario, $ano, $mes) {
    $sql_lancamentos = "SELECT * FROM `vw_lancamentos_json` WHERE ";
    $link = get_conexao();
    if (is_numeric($usuario) && is_numeric($mes) && is_numeric($ano)) {
        $sql_lancamentos .= ' usuario = ' . $usuario;
        $sql_lancamentos .= ' AND mes = ' . $mes;
        $sql_lancamentos .= ' AND ano = ' . $ano;
        $sql_lancamentos .= ' ORDER by ano, mes ';
        $result = mysql_query($sql_lancamentos, $link);
        $rows = array();
        while ($r = mysql_fetch_assoc($result)) {
            $rows[] = $r;
        }
        return $rows;
    }
}

$comando = filter_input(INPUT_GET, 'comando');

switch ($comando) {
    case 'periodos':
        get_periodos();
        break;
    case 'periodo':
        get_periodo();
        break;
}
