<?php

	$result = '{ "data":[';
	if(isset($_GET['from']) && isset($_GET['to'])){
		$step = 15 * 60 * 1000;
		
		$from = floatval($_GET['from']);
		$to = floatval($_GET['to']);
		
		if($to - $from < 30 * 3600000){
		
			// Generate under one month
			for($j=0;$j<3;$j++){
				$result .= '{"data":[';
				
				for($i=$from; $i <= $to ; $i = $i + $step){
					
					if($i > $from){
						$result .= ',';
					}
					$result .= '{ "x":'.$i.',"y":'. (rand(0, 1000)). '}';
				}
				
				$result .= ']}';
				if($j<2){
					$result .= ',';
				}
			}
			
		}
		
		
	}
	
	$result .= ']}';
	header('Content-type: application/json');
	echo $result;