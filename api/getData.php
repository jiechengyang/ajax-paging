<?php 
	include_once 'objmysql.class.php';
	header('Content-type: application/json;charset=UTF-8'); 
	$db = objmysql::get_ins('127.0.0.1', 'root', 'root', 'platform');
	$fields = $_POST['fields'];
	$page = !isset($_POST['page']) ? 1 : $_POST['page'];
	$pageSize = isset($_POST['pageSize']) ? $_POST['pageSize'] : 3;
	$limit = ($page -1) * $pageSize;
	$sql = "SELECT {$fields} FROM `byt_article` WHERE 1=1 LIMIT {$limit}, $pageSize";
	// echo $sql;
	$countSql = "SELECT count(id) AS count FROM `byt_article` WHERE 1=1";
	$rows = $db->getall($sql);
	$countRow = $db->getone($countSql);
	$data['totalCount'] = is_array($countRow) && array_key_exists('count', $countRow) ? $countRow['count'] : $countRow;
	$data['currentPage'] = $page;
	$data['rows'] = array_values($rows);

	echo json_encode($data);
 ?>