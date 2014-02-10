<?
$filename = "metric-modeller.txt";
header("Cache-Control: public");
header("Content-Description: File Transfer");
header("Content-Disposition: attachment; filename=$filename");
header("Content-Type: application/download; "); 
header("Content-Transfer-Encoding: binary");
$outCsv="";
foreach($_GET as $key=>$value){
		$outCsv.=$key.",".$value."\r\n";
}
echo $outCsv;
?>