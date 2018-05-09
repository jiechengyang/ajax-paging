<?php
   /*
     file  mysqli.class.php
     mysqli库函数支持oop
   */
   class objmysql
   {
		private static $sqlins = null;
		private $conn = null;

		public function __construct($host, $user, $pwd, $db)
		{
			$this->conn = new mysqli($host, $user, $pwd, $db);
			if($this->conn->connect_error){
			   $error = new Exception('数据库连接失败');
			   $this->error($error);
			   throw $error;
			}
			$this->SetChar('utf8');
		}

		//析构方法
		public function __desstruct()
		{

		}

		//1、调用数据库--暂时可以不需要使用，为什么要写呢，一是因为父类是抽象类，子类必须去继承它所有的抽象方法
		//2、可以在mysqli里使用构造方法连接库使用
		public function select_db($db)
		{
		   $sql = 'use '. $db;
		   $this->sql_query($sql);
		}
		//错误记录日志
		public function error($errmsg)
		{
			 die($errmsg);
		}
		//设置字符集
		public function SetChar($char)
		{
		  $sql = 'set names '.$char;
		  $this->conn->query($sql);
		}
		//单例模式入口
		public static function get_ins($host, $user, $pwd, $db)
		{
			if (!(self::$sqlins instanceof self)) {
			   self::$sqlins = new self($host, $user, $pwd, $db);
			}
			return self::$sqlins;
		}

		//将执行sql语句
		public function sql_query($sql)
		{
		   $res = $this->conn->query($sql);
		   if(!$res){
		       $this->error($this->conn->connect_error."\r\n错误的sql语句:".$sql);
		   }

			return $res;
		}

		//得到多行数据
		public function getall($sql)
		{
		   $res = $this->sql_query($sql);
		   while($row = $res->fetch_assoc()){
		        $arr[] = $row;
		   }
		   return $arr;
		}

		//得到单行数据
		public  function getrow($sql)
		{
		     $res = $this->sql_query($sql);
			 return $res->fetch_assoc();
		}
		/*查询单个数据（参数:$sql;返回值:array或者bool）----单个记录就是查询单个字段的数据*/
		public   function getone($sql)
		{
		     $res = $this->sql_query($sql);
			 $row = $res->fetch_row();

			 return $row[0];
		}

		/*自动执行增删改语句（参数：表名、数据、dml语句类型、条件）
		  这个函数的作用是可以自动拼接sql语句
		  如：auto_execute_dml(user,array('usernmae'=>'yjc','email'=>'yjc@168.com'),insert,'')
		        insert into user (username,email) values('yjc','yjc@168.com')
		*/
		/*
		**params table
		**params data
		**params datatype
		**params where
		**return boolean
		*/
		public  function auto_execute_dml($table,$dataarr,$mode='insert',$where=' 1 and limit 1')
		{
		   if(!is_array($dataarr)){
		      return false;
		   }
			 $sql = '';
		      if($mode == 'update'){
			      $sql = 'update '.$table.' set ';
				  foreach($dataarr as $k=>$v){
				    $sql.= $k.' = '."'".$v."'".',';
				  }
				  $sql = rtrim($sql,',');
				  $sql.= $where;//写条件的时候带上where
				  return $this->sql_query($sql);
			  }
			  $fieldstr = implode(',',array_keys($dataarr));
			  $valstr = implode("','",array_values($dataarr));
			  $sql = 'insert into '.$table.' ( '.$fieldstr.' ) ';
			  $sql .= 'values (\'';
			  $sql .= $valstr.' \')';
			  return $this->sql_query($sql);
		}

		//返回影响的函数
		public  function affected_rows()
		{
		    return $this->conn->affected_rows;
		}
		//	    获得上次插入的id
		public function insert_id()
		{
		   return $this->conn->insert_id;
		}
		#批量执行sql语句
		public function multi_sql($sqls)
		{
		  $sql = rtrim($sqls,';');
		  $this->WriteLog($sql);
		  $res = $this->conn->multi_query($sql);//结果返回 bool\ resource
		  return $res;
		}
		//取出批量执行的查询语句的结果集
		public function multi_all($sql)
		{
		    $res = $this->multi_sql($sql);
			$data = array();
			do{
					$result = $this->conn->store_result();//得到第一个 当前的结果集
					while($row = $result->fetch_assoc){
					      $data[] = $row;
					}
					$result->free();
					if(!$this->conn->more_result()){//检查是否有多个查询的多个查询结果 
					     break;
					}
			}while($this->conn->next_result());//指向下一个结果集
			return $data;
		}
   }
?>