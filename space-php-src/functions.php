<?php

function get_ip_address() {
    // check for shared internet/ISP IP
    if (!empty($_SERVER['HTTP_CLIENT_IP']) && validate_ip($_SERVER['HTTP_CLIENT_IP'])) {
        return $_SERVER['HTTP_CLIENT_IP'];
    }

    // check for IPs passing through proxies
    if (!empty($_SERVER['HTTP_X_FORWARDED_FOR'])) {
        // check if multiple ips exist in var
        if (strpos($_SERVER['HTTP_X_FORWARDED_FOR'], ',') !== false) {
            $iplist = explode(',', $_SERVER['HTTP_X_FORWARDED_FOR']);
            foreach ($iplist as $ip) {
                if (validate_ip($ip))
                    return $ip;
            }
        } else {
            if (validate_ip($_SERVER['HTTP_X_FORWARDED_FOR']))
                return $_SERVER['HTTP_X_FORWARDED_FOR'];
        }
    }
    if (!empty($_SERVER['HTTP_X_FORWARDED']) && validate_ip($_SERVER['HTTP_X_FORWARDED']))
        return $_SERVER['HTTP_X_FORWARDED'];
    if (!empty($_SERVER['HTTP_X_CLUSTER_CLIENT_IP']) && validate_ip($_SERVER['HTTP_X_CLUSTER_CLIENT_IP']))
        return $_SERVER['HTTP_X_CLUSTER_CLIENT_IP'];
    if (!empty($_SERVER['HTTP_FORWARDED_FOR']) && validate_ip($_SERVER['HTTP_FORWARDED_FOR']))
        return $_SERVER['HTTP_FORWARDED_FOR'];
    if (!empty($_SERVER['HTTP_FORWARDED']) && validate_ip($_SERVER['HTTP_FORWARDED']))
        return $_SERVER['HTTP_FORWARDED'];

    // return unreliable ip since all else failed
    return $_SERVER['REMOTE_ADDR'];
}

/**
 * Ensures an ip address is both a valid IP and does not fall within
 * a private network range.
 */
function validate_ip($ip) {
    if (strtolower($ip) === 'unknown')
        return false;

    // generate ipv4 network address
    $ip = ip2long($ip);

    // if the ip is set and not equivalent to 255.255.255.255
    if ($ip !== false && $ip !== -1) {
        // make sure to get unsigned long representation of ip
        // due to discrepancies between 32 and 64 bit OSes and
        // signed numbers (ints default to signed in PHP)
        $ip = sprintf('%u', $ip);
        // do private network range checking
        if ($ip >= 0 && $ip <= 50331647) return false;
        if ($ip >= 167772160 && $ip <= 184549375) return false;
        if ($ip >= 2130706432 && $ip <= 2147483647) return false;
        if ($ip >= 2851995648 && $ip <= 2852061183) return false;
        if ($ip >= 2886729728 && $ip <= 2887778303) return false;
        if ($ip >= 3221225984 && $ip <= 3221226239) return false;
        if ($ip >= 3232235520 && $ip <= 3232301055) return false;
        if ($ip >= 4294967040) return false;
    }
    return true;
}

/**
 * 01bol januart csinal
 *
 * @param unknown_type $honap
 * @return unknown
 */
function honapSzambolBetu( $honap )
{

    switch ( $honap )
    {
        case "01":
            $honapBetuvel = "január";
            break;
        case "02":
            $honapBetuvel = "február";
            break;
        case "03":
            $honapBetuvel = "március";
            break;
        case "04":
            $honapBetuvel = "április";
            break;
        case "05":
            $honapBetuvel = "május";
            break;
        case "06":
            $honapBetuvel = "június";
            break;
        case "07":
            $honapBetuvel = "július";
            break;
        case "08":
            $honapBetuvel = "augusztus";
            break;
        case "09":
            $honapBetuvel = "szeptember";
            break;
        case "10":
            $honapBetuvel = "október";
            break;
        case "11":
            $honapBetuvel = "november";
            break;
        case "12":
            $honapBetuvel = "december";
            break;
    }
    return $honapBetuvel;
}

/**
 * kiszedi a vesszőket stringből
 *
 * @param unknown_type $string
 * @return unknown
 */
function stripCommas( $string )
{
    $string = str_replace( ",", "", $string );
    return $string;
}

/**
 * az arr2-t az arr1 elé teszi kulcsokat átszámozza nullától
 *
 * @param unknown_type $arr1
 * @param unknown_type $arr2
 */
function arrayCsusztatas( $arr1, $arr2 )
{
    $count = count( $arr2 );

    $i = 0;
    foreach ( $arr2 as $val )
    {
        $ret[$i] = $val;
        $i++;
    }

    foreach ( $arr1 as $val2 )
    {
        $ret[$count] = $val2;
        $count++;
    }
    return $ret;
}

/**
 * százalékszámolás
 * @param type $iOsszeg
 * @param type $iSzazalek
 * @return type
 */
function szazalekszamolas( $iOsszeg, $iSzazalek )
{
    return round( $iOsszeg - ( ( $iOsszeg * $iSzazalek ) / 100 ) );
}

/**
 * fileba író fv
 * @param type $sPath  végén / jel
 * @param type $sFileName
 * @param type $sString
 * @param type $sKiterjesztes
 */
function filebaIro( $sPath, $sFileName, $sString, $sKiterjesztes )
{
    $fp = fopen( $sPath . $sFileName . '.' . $sKiterjesztes, 'w' );
    fwrite( $fp, var_export( $sString, true ) );
    fclose( $fp );
}

/**
 * könyvtárat hoz létre
 * @param type $sPath
 */
function konyvtarLetrehozo( $sPath )
{
    if ( !file_exists( $sPath ) )
    {
        mkdir( $sPath, 0777, true );
    }
}

/**
 * friendlyUrl
 *
 * @param unknown_type $p_str
 * @return unknown
 */
function friendlyUrl( $p_str )
{
    $p_str = str_replace( "ö", "o", $p_str );
    $p_str = str_replace( "Ö", "O", $p_str );
    $p_str = str_replace( "ü", "u", $p_str );
    $p_str = str_replace( "Ü", "U", $p_str );
    $p_str = str_replace( "ó", "o", $p_str );
    $p_str = str_replace( "Ó", "O", $p_str );
    $p_str = str_replace( "ő", "o", $p_str );
    $p_str = str_replace( "Ő", "O", $p_str );
    $p_str = str_replace( "ú", "u", $p_str );
    $p_str = str_replace( "Ú", "U", $p_str );
    $p_str = str_replace( "á", "a", $p_str );
    $p_str = str_replace( "Á", "A", $p_str );
    $p_str = str_replace( "ű", "u", $p_str );
    $p_str = str_replace( "Ű", "U", $p_str );
    $p_str = str_replace( "é", "e", $p_str );
    $p_str = str_replace( "É", "E", $p_str );
    $p_str = str_replace( "í", "i", $p_str );
    $p_str = str_replace( "Í", "I", $p_str );

    $p_str = str_replace( " ", "-", $p_str );

    return $p_str;
}

/**
 * email küldés
 * @param type $email
 * @param type $subject
 * @param type $message
 * @param type $site_name
 * @param type $reply envelope sender, erre a címre megy a válasz-email
 */
function sendEmail( $email, $subject, $message, $site_name, $reply = "" )
{

    //header
    $header = "MIME-Version: 1.0\r\n";
    $header .= "Content-type: text/html; charset=utf-8\r\n";
    $header .= "FROM: " . $site_name . "\r\n";
    $header .= "Reply-To: " . $reply . "\r\n";
    $header .= 'X-Mailer: PHP/' . phpversion();

    if ( $reply !== '')
    {
        $reply = '-f' . $reply;
    }
    
    @mail( $email, $subject, $message, $header, $reply );
}

/**
 * Email küldés csatolmánnyal
 * @param type $filename
 * @param type $path
 * @param type $mailto
 * @param type $from_mail
 * @param type $from_name
 * @param type $replyto
 * @param type $subject
 * @param type $message
 */
function mail_attachment( $filename, $path, $mailto, $from_mail, $from_name, $replyto, $subject, $message )
{
    $file = $path . $filename;
    $file_size = filesize( $file );
    $handle = fopen( $file, "r" );
    $content = fread( $handle, $file_size );
    fclose( $handle );
    $content = chunk_split( base64_encode( $content ) );
    $uid = md5( uniqid( time() ) );
    $header = "From: " . $from_name . " <" . $from_mail . ">\r\n";
    $header .= "Reply-To: " . $replyto . "\r\n";
    $header .= "MIME-Version: 1.0\r\n";
    $header .= "Content-Type: multipart/mixed; boundary=\"" . $uid . "\"\r\n\r\n";
    $header .= "This is a multi-part message in MIME format.\r\n";
    $header .= "--" . $uid . "\r\n";
    $header .= "Content-type:text/plain; charset=iso-8859-1\r\n";
    $header .= "Content-Transfer-Encoding: 7bit\r\n\r\n";
    $header .= $message . "\r\n\r\n";
    $header .= "--" . $uid . "\r\n";
    $header .= "Content-Type: application/octet-stream; name=\"" . $filename . "\"\r\n"; // use different content types here
    $header .= "Content-Transfer-Encoding: base64\r\n";
    $header .= "Content-Disposition: attachment; filename=\"" . $filename . "\"\r\n\r\n";
    $header .= $content . "\r\n\r\n";
    $header .= "--" . $uid . "--";
    if ( mail( $mailto, $subject, "", $header ) )
    {
        //echo "mail send ... OK"; // or use booleans here
    }
    else
    {
        //echo "mail send ... ERROR!";
    }
}

/**
 * véletlen hash generáló
 *
 * @param unknown_type $codelenght
 * @return unknown
 */
function randHash( $codelenght = 6 )
{
      $newcode_length = 0;
    $newcode = "";
    while ( $newcode_length < $codelenght )
    {
        $x = 1;
        $y = 2;
        $part = rand( $x, $y );
        if ( $part == 1 )
        {
            $a = 48;
            $b = 57;
        }  // Numbers
        if ( $part == 2 )
        {
            $a = 97;
            $b = 122;
        } // LowerCase
        if ( $part == 3 )
        {
            $a = 65;
            $b = 90;
        }  // UpperCase
        $code_part = chr( rand( $a, $b ) );
        $newcode_length = $newcode_length + 1;
        $newcode = $newcode . $code_part;
    }
    return $newcode;
}

/**
 * visszaadja a kapott tömbből a legnagyobb elemek kulcsait.
 * szavazás eredmény kiválasztásához
 *
 * @param unknown_type $mylist
 * @return array az input tömb kulcsai
 */
function doublemax( $mylist )
{
    $maxvalue = max( $mylist );
    $max_keys = array();

    while ( list( $key, $value) = each( $mylist ) )
    {
        if ( $value == $maxvalue )
        {
            array_push( $max_keys, $key );
        }
    }
    return $max_keys;
}

/**
 * megadható hosszra vágja a kapott szöveget
 *
 * @param unknown_type $string
 * @param unknown_type $length
 * @return unknown
 */
function trimString( $string, $length )
{
    if ( strlen( $string ) > $length )
    {
        $string = substr( $string, 0, $length ) . " ...";
    }
    return $string;
}

/**
 * Enter description here...
 *
 * @param unknown_type $string
 * @return unknown
 */
function clearString( $string )
{
    $ret = strip_tags( $string );
    //$ret = addslashes( $ret);

    return $ret;
}

/**
 * hunchar2engchar
 * 
 * A magyar ékezetes karaterek cseréje angol 'megfelelőikre'
 * @param $p_str Az átalakítandó string
 * @return $p_str Az átalakított string
 */
function hunchar2engchar( $p_str )
{
    $p_str = str_replace( "ö", "o", $p_str );
    $p_str = str_replace( "Ö", "O", $p_str );
    $p_str = str_replace( "ü", "u", $p_str );
    $p_str = str_replace( "Ü", "U", $p_str );
    $p_str = str_replace( "ó", "o", $p_str );
    $p_str = str_replace( "Ó", "O", $p_str );
    $p_str = str_replace( "ő", "o", $p_str );
    $p_str = str_replace( "Ő", "O", $p_str );
    $p_str = str_replace( "ú", "u", $p_str );
    $p_str = str_replace( "Ú", "U", $p_str );
    $p_str = str_replace( "á", "a", $p_str );
    $p_str = str_replace( "Á", "A", $p_str );
    $p_str = str_replace( "ű", "u", $p_str );
    $p_str = str_replace( "Ű", "U", $p_str );
    $p_str = str_replace( "é", "e", $p_str );
    $p_str = str_replace( "É", "E", $p_str );
    $p_str = str_replace( "í", "i", $p_str );
    $p_str = str_replace( "Í", "I", $p_str );

    $p_str = str_replace( " ", "", $p_str );

    return $p_str;
}

function remove_http( $url = '' )
{
    return preg_replace( "/^https?:\/\/(.+)$/i", "\\1", $url );
}

/**
 * szokozt kiszedi
 *
 * @param unknown_type $p_str
 * @return unknown
 */
function stripSpace( $p_str )
{
    $p_str = str_replace( " ", "", $p_str );
    return $p_str;
}

/**
 * tömbön elemeit összefűzi vesszővel stringgé
 *
 * @param unknown_type $array
 * @return unknown
 */
function arrayToString( $array )
{
    $ret = "";
    foreach ( $array as $ertek )
    {
        $ret .= $ertek . ", ";
    }
    return substr( $ret, 0, -2 );
}

function stringToArray( $str )
{
    $ret = explode( ", ", $str );
    return $ret;
}

function negativeValues( $string )
{
    $string = str_replace( ", ", ", -", $string );
    return "-" . $string;
}

//*** könyvtár törlő */
function deleteDirectory($dirPath) {
    if (!is_dir($dirPath)) {
        return;
    }

    $files = scandir($dirPath);

    foreach ($files as $file) {
        if ($file !== '.' && $file !== '..') {
            $filePath = $dirPath . '/' . $file;
            if (is_dir($filePath)) {
                deleteDirectory($filePath);
            } else {
                unlink($filePath);
            }
        }
    }

    rmdir($dirPath);
    return true;
}
