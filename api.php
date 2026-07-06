<?php
// api.php

// ini_set('display_errors', 1);
// error_reporting(E_ALL);

// egyszerű router példának:
header('Content-Type: application/json');

$action = $_GET['action'] ?? null;

require_once __DIR__ . '/../space-php-src/functions.php';
require_once __DIR__ . '/../space-php-src/Browser.php';
$oBrowser = new Browser;

$logArr = array();
$logArr['browser'] = $oBrowser->getBrowser();
$logArr['browserVersion'] = $oBrowser->getVersion();
$logArr['platform'] = $oBrowser->getPlatform();
$query = @unserialize( file_get_contents( 'http://ip-api.com/php/' . $logArr['ipAddress'] ) );
if ( $query && $query['status'] == 'success' )
{
	$logArr['ipIsp'] = $query['isp'];
	$logArr['ipOrg'] = $query['org'];
	$logArr['ipCountry'] = $query['country'];
	$logArr['ipRegion'] = $query['regionName'];
	$logArr['ipCity'] = $query['city'];
}		
		
$sContent = "SpaceGame";
$sContent .= "<br> IP cím: " . get_ip_address();
$sContent .= "<br> Szolgáltató: " . $logArr['ipIsp'];
$sContent .= "<br> Org: " . $logArr['ipOrg'];
$sContent .= "<br> Ország: " . $logArr['ipCountry'];
$sContent .= "<br> Régió: " . $logArr['ipRegion'];
$sContent .= "<br> Város: " . $logArr['ipCity'];

// print ($sContent);

if ($action === 'Indul') {
	// sendEmail( 'attila.zsolt.nagy@gmail.com', 'Warp Exit volt', 'üzenet', 'no-reply@labor.hu', "" );
	// sendEmail( "info@bitdent.eu", $sSubject, $sContent, '<info@bitdent.eu>', 'info@bitdent.eu' );
	sendEmail( "info@labor24.hu", 'Indították', $sContent, '<info@labor24.hu>', 'info@labor24.hu' );
	// mail('attila.zsolt.nagy@gmail.com', 'Test subject', 'Test body');
	// mail( "info@labor24.hu", 'Warp Exit volt', 'üzenet' );
}elseif ($action === 'death') { sendEmail( "info@labor24.hu", 'Death volt', $sContent, '<info@labor24.hu>', 'info@labor24.hu' );
}elseif ($action === 'jump') { sendEmail( "info@labor24.hu", 'Jump volt', $sContent, '<info@labor24.hu>', 'info@labor24.hu' );
}elseif ($action === 'jump') { sendEmail( "info@labor24.hu", 'Bányászás volt', $sContent, '<info@labor24.hu>', 'info@labor24.hu' );
}elseif ($action === 'Hit') {	sendEmail( "info@labor24.hu", 'Ütközés volt', $sContent, '<info@labor24.hu>', 'info@labor24.hu' );
}
exit;

