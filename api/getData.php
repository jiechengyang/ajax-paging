<?php 
	include_once 'objmysql.class.php';
	header('Content-type: application/json;charset=UTF-8'); 
	$db = objmysql::get_ins('127.0.0.1', 'root', 'root', 'platform');
	$fields = $_POST['fields'];
	$page = !isset($_POST['page']) ? 1 : $_POST['page'];
	$pageSize = isset($_POST['pageSize']) ? $_POST['pageSize'] : 3;
	$limit = ($page -1) * $pageSize;
	$table = !isset($_POST['table']) ? 'byt_article' : 'byt_' . $_POST['table'];
	$where = '';
	if(isset($_POST['searchParams']['title'])) {
		$where .= ' AND title LIKE "%' . $_POST['searchParams']['title'] . '%" ';
	}

	$sql = "SELECT {$fields} FROM `{$table}` WHERE 1=1 {$where} LIMIT {$limit}, $pageSize";
	// echo $sql;
	$countSql = "SELECT count(id) AS count FROM `{$table}` WHERE 1=1 {$where}";
	$rows = $db->getall($sql);
	if ($rows) {
		foreach($rows as $key => $row) {
			$rows[$key]['created_at'] = date('Y-m-d H:i:s', $row['created_at']);
			if (array_key_exists('cover', $row)) {
				$rows[$key]['cover'] = 'http://www.platform.com.cn/' . $row['cover'];
			}
		}
	}
	$countRow = $db->getone($countSql);
	$data['totalCount'] = is_array($countRow) && array_key_exists('count', $countRow) ? $countRow['count'] : $countRow;
	$data['currentPage'] = $page;
	$data['rows'] = array_values($rows);

	echo json_encode($data);
 ?>