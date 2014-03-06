<?
$filename = "metric-modeller.txt";
// Headers for downloading the file.
header("Cache-Control: public");
header("Content-Description: File Transfer");
header("Content-Disposition: attachment; filename=$filename");
header("Content-Type: application/download; "); 
header("Content-Transfer-Encoding: binary");
$outCsv="";
$COUNTER = 0;
$LENGTH = count($_GET);
foreach($_GET as $key=>$value){
	//Counter was added to eliminate the white space in the export file,
	//which is translated to a null array element when you import the file.
	$COUNTER++;
	if ($COUNTER == $LENGTH){
		$outCsv.=$key.",".$value;
	} 
	else if ($COUNTER != $LENGTH){
		$outCsv.=$key.",".$value."\r\n";
	}
}
echo $outCsv;
?>