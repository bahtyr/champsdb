<?php 
$str_json = file_get_contents('php://input');
$myfile = fopen("../../data/".$_GET["file"].".json", "w", true) or die("Unable to open file!");
fwrite($myfile, $str_json);
fclose($myfile);
?>