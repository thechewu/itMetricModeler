<?
$lines = file_get_contents($_FILES['file']['tmp_name']);
$array = array_map("str_getcsv",explode("\n",$lines));
echo json_encode($array);
?>