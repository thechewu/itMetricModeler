<?
$lines = file_get_contents($_FILES['file']['tmp_name']);
$array = array_map("str_getcsv",explode("\n",$lines));
$ext = pathinfo($_FILES['file']['name'], PATHINFO_EXTENSION);
switch($ext){
	case 'csv':
		foreach($array[0] as $val){
			
			$strs = explode("=",$val);
			
			if($strs[1]===null){
			
				$tempArray[] = array('projectName',$strs[0]);
			}
			
			switch($strs[0]){
				case 'function_points':
					$strs[0] = 'inputFp';
					$tempArray[] = array($strs[0],$strs[1]);
				break;
				
				case 'product_attributes':
					$strs[0] = 'complexity';
					$comp = floatval($strs[1]);
					$comp = 10 - round((1.70-$comp)/0.1);
					$strs[1] = $comp;
					$tempArray[] = array($strs[0],$strs[1]);
				break;
				
				case 'hardware_attributes':
					$strs[0] = 'hardwareAttr';
					$tempArray[] = array($strs[0],$strs[1]);
				break;
				
				case 'personnel_attributes':
					$strs[0] = 'langSelect';
					$avg = round((1.38 - sqrt(sqrt(floatval($strs[1]))))/0.117);
					$avg = ($avg <= 0) ? 1 : (($avg > 5) ? 5 : $avg);
					$strs[1] = $avg;
					$tempArray[] = array("teamCongruity",$strs[1]);
					$tempArray[] = array("langExperience",$strs[1]);
					$tempArray[] = array("platformExperience",$strs[1]);
					$tempArray[] = array("programerCap",$strs[1]);
				break;
				
				case 'project_attributes':
					$strs[0] = 'projectAttr';
					$tempArray[] = array($strs[0],$strs[1]);
					
				break;
				
				case 'person_cost':
					$strs[0] = 'inCpp';
					$tempArray[] = array($strs[0],$strs[1]);
				break;
				
				case 'prog_language':
					$strs[0] = 'langSelect';
					$strs[1] = intval($strs[1]);
					switch($strs[1]){
						case  51:$strs[1]=  0;break;
						case 119:$strs[1]=  1;break;
						case  97:$strs[1]=  2;break;
						case  50:$strs[1]=  3;break;
						case  54:$strs[1]=  4;break;
						case  61:$strs[1]=  5;break;
						case  34:$strs[1]=  6;break;
						case  53:$strs[1]=  7;break;
						case  47:$strs[1]=  8;break;
						case  57:$strs[1]=  9;break;
						case  37:$strs[1]= 10;break;
						case  24:$strs[1]= 11;break;
						case  21:$strs[1]= 12;break;
						case  52:$strs[1]= 13;break;
						case  42:$strs[1]= 14;break;
					}
					$tempArray[] = array($strs[0],$strs[1]);
				break;
				
				default: break;
			}
		}
		$array = $tempArray;
	break;
	
	case 'txt':break;
	
	case 'json':
		$array = json_decode($lines);
		foreach($array as $key => $value){
			switch($key){
				case 'NAME': 
					$key = 'projectName';
					$tempArray[] = array($key,$value);
					break;
				case 'FUNCTION_POINTS': 
					$key = 'inputFp'; 
					$tempArray[] = array($key,$value);
					break;
				case 'DEVELOPER_WAGE' : 
					$key = 'inCpp'; 
					$value = intval($value)*160; 
					$tempArray[] = array($key,$value);
					break;
				case 'LANGUAGE' : $key = 'langSelect';
					switch ($value){
						case 'ASP':
							$value = 0;
							break;
						case 'Assembler':
							$value = 1;
							break;	
						case 'C':
							$value = 2;
							break;
						case 'C++':
							$value = 3;
							break;
						case 'C#':
							$value = 4;
							break;
						case 'COBOL':
							$value = 5;
							break;	
						case 'HTML':
							$value = 6;
							break;
						case 'Java':
							$value = 7;
							break;	
						case 'JavaScript':
							$value = 8;
							break;
						case '.NET':
							$value = 9;
							break;	
						case 'Oracle':
							$value = 10;
							break;	
						case 'PERL':
							$value = 11;
							break;	
						case 'SQL':
							$value = 12;
							break;	
						case 'VB .NET':
							$value = 13;
							break;								
						case 'Visual Basic':
							$value = 14;
							break;								
					}
					$tempArray[] = array($key,$value);
					break;
				default:break;	
			}
			
		}
		$array = $tempArray;
	break;
	
	default : break;
}

echo json_encode($array);
?>