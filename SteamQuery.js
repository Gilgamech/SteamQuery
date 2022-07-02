var http = require("http");
//var request = require("request");

const dgram = require('dgram');
const server = dgram.createSocket('udp4');

var msg = "ÿÿÿÿTSource Engine Query";
var myBuf2 = [];
var buf2 = Buffer.from(msg);
//var $host = "13.54.210.86";
//var $port = 27015;
var $host = "127.0.0.1";
var $port = 41235;
var $listenPort = 41234;

/* SourceQuery
// "http://arkdedicated.com/officialservers.ini"

function Get-SteamServerInfo {
Param(
		$serveraddr,
		$serverport = 27015,
		$UDPtimeout = 1000
)
//#Prepare our request message
$bytes =  "ÿÿÿÿTSource Engine Query" | Flip-TextToBytes -a 
$bytes += "00"
//#Build endpoint. 
    $endpoint = New-Object System.Net.IPEndPoint ($serveraddr,$serverport)
    $udpclient= New-Object System.Net.Sockets.UdpClient
	$udpclient.client.receiveTimeout = $UDPtimeout
    $bytesSent=$udpclient.Send($bytes,$bytes.length,$endpoint)

	//#Listen for the challenge response
	$content = try {	
		$udpclient.Receive($endpoint)  
	} catch {
		Write-warning "Connection to $($Serveraddr):$($ServerPort) for Info timed out. Double-check the server's listening port."
	} //#finally {}

	//#If the challenge isn't empty, print as Bytes then print as ASCII
	if ($content) {
		$contxt = -join ($content  | Flip-BytesToText)
		$contxt = ($contxt | Convert-SteamServerFields) -split ","
		
		$conlen = $content.length
		$oput = "" | Select "Raw","ProtocolID","OWNINGID","OWNINGNAME","NUMOPENPUBCONN","P2PADDR","P2PPORT","ModId","servername","mapname","foldername","gamename","options","SteamApplicationID","PlayerCount","MaxPlayers","Bots","ServerType","Environment","Passworded","VAC","Version","EDF"
		
		$NameMapSeparator = 41
		$MapFolderSeparator = 50
		$FolderGameSeparator = 70
		$GameOptionsSeparator = 91
		//#Manually populating cuz bleh.
		//#Data	Type	Comment
		$oput.raw = $content
		//#Header	byte	Always equal to 'I' (0x49)
		$oput.ProtocolID = $contxt[0][5] | Flip-TextToBytes -a
		$oput.OWNINGID = (($contxt | select-string "OWNINGID" ) -split ": " -split ",")[1]
		$oput.OWNINGNAME = (($contxt | select-string "OWNINGNAME" ) -split ": " -split ",")[1]
		$oput.NUMOPENPUBCONN = (($contxt | select-string "NUMOPENPUBCONN" ) -split ": " -split ",")[1]
		$oput.P2PADDR = (($contxt | select-string "P2PADDR" ) -split ": " -split ",")[1]
		$oput.P2PPORT = (($contxt | select-string "P2PPORT" ) -split ": " -split ",")[1]
		$oput.ModId = (($contxt | select-string "ModId" ) -split ": " -split ",")[1]
		[string]$oput.servername = -join $contxt[0][6..$NameMapSeparator]
		[string]$oput.mapname = -join $contxt[0][($NameMapSeparator +1)..$MapFolderSeparator]
		[string]$oput.foldername = -join $contxt[0][($MapFolderSeparator +1)..$FolderGameSeparator]
		[string]$oput.gamename = -join $contxt[0][($FolderGameSeparator +1)..$GameOptionsSeparator]
		$ConOptions = $contxt[0][($GameOptionsSeparator +1)..999] | flip-texttobytes -ASCII
		[string]$oput.options = $ConOptions
		
		$oput.SteamApplicationID = $ConOptions[0..3]| flip-bytestotext
		$oput.PlayerCount = $ConOptions[4]
		$oput.MaxPlayers = $ConOptions[5]
		$oput.Bots = $ConOptions[6]
		$oput.ServerType = $ConOptions[7] | flip-bytestotext 
		$oput.Environment = $ConOptions[8]| flip-bytestotext 
		$oput.Passworded = $ConOptions[9]
		$oput.VAC = $ConOptions[10]
		$oput.Version = $ConOptions[11..($ConOptions.length -2)] | flip-bytestotext
		$oput.EDF = $ConOptions[-1]
		
		$oput
		/*<#
ID	short	Steam Application ID of game.
Players	byte	Number of players on the server.
Max. Players	byte	Maximum number of players the server reports it can hold.
Bots	byte	Number of bots on the server.
Server type	byte	Indicates the type of server:
'd' for a dedicated server
'l' for a non-dedicated server
'p' for a SourceTV relay (proxy)
Environment	byte	Indicates the operating system of the server:
'l' for Linux
'w' for Windows
'm' or 'o' for Mac (the code changed after L4D1)
Visibility	byte	Indicates whether the server requires a password:
0 for public
1 for private
VAC	byte
	#>
	
	} //#if context

	//#Close the UDP client
	$udpclient.Close()
} //#end Get-SteamServerInfo

function Get-SteamServerPlayers {
Param(
		$serveraddr,
		$serverport = 27015,
		$UDPtimeout = 1000
)
	//#Build message
	$bytes =  'ÿÿÿÿUÿÿÿÿ' | Flip-TextToBytes -a 

	[array]$obj = @{}

	//#Build endpoint
    $endpoint = New-Object System.Net.IPEndPoint ($serveraddr,$serverport)
	//#I found this online, I don't really know what it does lol
    $udpclient= New-Object System.Net.Sockets.UdpClient
	//#Timeout in ms
	$udpclient.client.receiveTimeout = $UDPtimeout
	//#Not sure what we're doing with BytesSent here.
    $bytesSent=$udpclient.Send($bytes,$bytes.length,$endpoint)

	//#Listen for the challenge response
	$content=try {	
		$udpclient.Receive($endpoint)  
	} catch {
		Write-warning "Connection to $($Serveraddr):$($ServerPort) for Players first time timed out. Double-check the server's listening port."
	} //#finally {}

	//#If the challenge isn't empty, print as Bytes then print as ASCII
	if ($content) {
		$contxt = Flip-BytesToText $content -a
		
		//#Modify challenge to be response	
		$content[4] = "U" | Flip-TextToBytes -a
		$conrsp = Flip-BytesToText $content -a
		
		//#Send the challenge response back as a handshake
		$payloadbytes = $udpclient.Send($content,$content.length,$endpoint)
		
		//#Listen for the challenge response
	$payload=try {	
	$udpclient.Receive($endpoint)  
	} catch {
	Write-warning "Connection to $($Serveraddr):$($ServerPort) for Players second time timed out. Double-check the server's listening port."
	} finally {
		//#Close the UDP client
		$udpclient.Close()
	}

	//#If the payload isn't empty, print as Bytes then print as ASCII
	if ($payload) {

		$playercount = ($payload[(5)])
		//#Haicut the first 6...
		$payload = $payload[6..($payload.Length)]
		//#	$paytxt = Flip-BytesToText $payload -a

		//#If there are players...
		if ($payload.length -gt 6) {
			$splitpayload = $payload -join " " -replace " 0 0 0 0 0 ","`n" -split "`n"
			$TextPayload = $splitpayload | %{ -join ($_ -split " " | Flip-BytesToText -Unicode)}; //# end foreach _
			if ($TextPayload.length -gt 4) {
				$PlayerPayload = $TextPayload | %{ ($_.substring(0,4)),($_.substring(4,($_.length-4)))}
			} //#end if TextPayload
			
			//# Foreach line in the count of splits, - you'll iterate over each split
			for ($i = 2; $i -le ($PlayerPayload.length - 1); $i++) { 
				//#if the line number is even, write as property and the next line as value.
				if (($i % 2)) { 
					//# Even line is the player name property, odd is the time value

					//#Write the even item to "Player" and the odd to "Time". 
					if ($PlayerPayload[$i] -eq (Flip-BytesToText 1,1,1,1 -a)) {
						[string]$playerproperty = 0 
					} else {
						[string]$playerproperty = $PlayerPayload[ $i ]
					}; //#end if PlayerPayload
					
					
					$bytes = $PlayerPayload[($i + 1)] | Flip-TextToBytes -a 
				if ($bytes) {
					$timevalue = [bitconverter]::ToSingle($bytes,0)
				} //#end if TextPayload

					$timef = (get-date) - (get-date).AddSeconds(-$timevalue)

					//#Add a line to the array, create columns for Name, Value, Type
					$obj += "" | select ID, Player, Score, Time, TimeF; 
					//#Math out the index of the new line
					$arrayspot = ( $obj.length -1 )
					//#Populate Name
					$obj[ $arrayspot ].ID = 0 //#ID is always 0.
					$obj[ $arrayspot ].Player = $playerproperty 
					$obj[ $arrayspot ].Score = 0 //#Score is always 0.
					$obj[ $arrayspot ].Time = $timevalue 
					$obj[ $arrayspot ].TimeF = $timef 

			} //#end if i

			} //#end for conlen
		} else { //#If payload.length -le 6, there were no players found.
			[string]$property = ("No players found.")
			[string]$value = ($True)

			//#Add a line to the array, create columns for Name, Value, Type
			$obj += "" | select ID, Player, Score, Time, TimeF; 
			//#Math out the index of the new line
			$arrayspot = ( $obj.length -1 )
			//#Populate Name
			$obj[ $arrayspot ].Player = $property 
			$obj[ $arrayspot ].Time = $value 
		}; //#end if payload

		//#"Raw: $Payload"
		"Server player count: $playercount"
		"Output player count: $($obj.Player.count)"
		$obj | where {$_.player -ne "" } | sort player -descending

		} else {
			Write-warning "No payload received."
		} //#end if payload
		
	} //#end if context

} //#end Get-SteamServerPlayers

function Get-SteamServerRules {
	Param(
		$serveraddr,
		$serverport = 27015,
		$UDPtimeout = 1000
   ) //#end Params
	//#Build message
	$bytes =  'ÿÿÿÿVÿÿÿÿ' | Flip-TextToBytes -a 
	//#Set our UDP timeout in ms.



	//#Build endpoint
		$endpoint = New-Object System.Net.IPEndPoint ($serveraddr,$serverport)
	//#I found this online, I don't really know what it does lol
		$udpclient= New-Object System.Net.Sockets.UdpClient
	//#Timeout in ms
		$udpclient.client.receiveTimeout = $UDPtimeout
	//#Not sure what we're doing with BytesSent here.
		$bytesSent=$udpclient.Send($bytes,$bytes.length,$endpoint)

	//#Listen for the challenge response
	$content=try {	
		$udpclient.Receive($endpoint)  
	} catch {
		Write-warning "Connection to $($Serveraddr):$($ServerPort) for Rules first time timed out. Double-check the server's listening port."
	} //#finally {}

	//#If the challenge isn't empty, print as Bytes then print as ASCII
if ($content) {
	$contxt = Flip-BytesToText $content -a
	
//#Modify challenge to be response	 
	$content[4] = "V" | Flip-TextToBytes -a
	$conrsp = Flip-BytesToText $content -a
	
//#Send the challenge response back as a handshake
    $payloadbytes = $udpclient.Send($content,$content.length,$endpoint)

	//#Listen for the challenge response
$payload=try {	
$udpclient.Receive($endpoint)  
} catch {
Write-warning "Connection to $($Serveraddr):$($ServerPort) for Rules second time timed out. Double-check the server's listening port."
} //#finally {}

//#If the payload isn't empty, print as Bytes then print as ASCII
	if ($payload) {
		$paytxt = -join ($payload  | Flip-BytesToText)
		$paytxt = ($paytxt | Convert-SteamServerFields) -split ","
	
		//#Data container
		$oput = "" | Select "raw","ALLOWDOWNLOADCHARS","ALLOWDOWNLOADITEMS","ClusterId","CUSTOMSERVERNAME","DayTime","GameMode","GameMode2","GameMode3","Vaults","MATCHTIMEOUT","ModId","Mod0", "Mod1","Mod2","Mod3","Mod4","Mod5","Mod6","Mod7","Mod8","Mod9","Networking","NUMOPENPUBCONN","OFFICIALSERVER","OWNINGID","OWNINGNAME","P2PADDR","P2PPORT","SEARCHKEYWORDS","CustomServerPassword","SERVERUSESBATTLEYE","SESSIONFLAGS683SESSIONISPVE"

	//#Data	Type	Comment
	//#Header	byte	Always equal to 'I' (0x49)
		$oput.raw = $payload
		
		$oput.ALLOWDOWNLOADCHARS = (($paytxt | select-string "ALLOWDOWNLOADCHARS" ) -split ": " -split ",")[1]
		$oput.ALLOWDOWNLOADITEMS = (($paytxt | select-string "ALLOWDOWNLOADITEMS" ) -split ": " -split ",")[1]
		[string]$oput.ClusterId = (($paytxt | select-string "ClusterId" ) -split ": " -split ",")[1]
		$oput.CUSTOMSERVERNAME = (($paytxt | select-string "CUSTOMSERVERNAME" ) -split ": " -split ",")[1]
		$oput.DayTime = (($paytxt | select-string "DayTime" ) -split ": " -split ",")[1]
		$oput.GameMode = (($paytxt | select-string "GameMode" ) -split ": " -split ",")[1]
		$oput.GameMode2 = (($paytxt | select-string "GameMode2" ) -split ": " -split ",")[1]
		$oput.GameMode3 = (($paytxt | select-string "GameMode3" ) -split ": " -split ",")[1]
		$oput.Vaults = (($paytxt | select-string "Vaults" ) -split ": " -split ",")[1]
		$oput.MATCHTIMEOUT = (($paytxt | select-string "MATCHTIMEOUT" ) -split ": " -split ",")[1]
		$oput.ModId = (($paytxt | select-string "ModId" ) -split ": " -split ",")[1]
		$oput.Mod0 = (($paytxt | select-string "Mod0" ) -split ": " -split ",")[1]
		$oput.Mod1 = (($paytxt | select-string "Mod1" ) -split ": " -split ",")[1]
		$oput.Mod2 = (($paytxt | select-string "Mod2" ) -split ": " -split ",")[1]
		$oput.Mod3 = (($paytxt | select-string "Mod3" ) -split ": " -split ",")[1]
		$oput.Mod4 = (($paytxt | select-string "Mod4" ) -split ": " -split ",")[1]
		$oput.Mod5 = (($paytxt | select-string "Mod5" ) -split ": " -split ",")[1]
		$oput.Mod6 = (($paytxt | select-string "Mod6" ) -split ": " -split ",")[1]
		$oput.Mod7 = (($paytxt | select-string "Mod7" ) -split ": " -split ",")[1]
		$oput.Mod8 = (($paytxt | select-string "Mod8" ) -split ": " -split ",")[1]
		$oput.Mod9 = (($paytxt | select-string "Mod9" ) -split ": " -split ",")[1]
		$oput.Networking = (($paytxt | select-string "Networking" ) -split ": " -split ",")[1]
		$oput.NUMOPENPUBCONN = (($paytxt | select-string "NUMOPENPUBCONN" ) -split ": " -split ",")[1]
		$oput.OFFICIALSERVER = (($paytxt | select-string "OFFICIALSERVER" ) -split ": " -split ",")[1]
		$oput.OWNINGID = (($paytxt | select-string "OWNINGID" ) -split ": " -split ",")[1]
		$oput.OWNINGNAME = (($paytxt | select-string "OWNINGNAME" ) -split ": " -split ",")[1]
		$oput.P2PADDR = (($paytxt | select-string "P2PADDR" ) -split ": " -split ",")[1]
		$oput.P2PPORT = (($paytxt | select-string "P2PPORT" ) -split ": " -split ",")[1]
		$oput.SEARCHKEYWORDS = (($paytxt | select-string "SEARCHKEYWORDS" ) -split ": " -split ",")[1]
		$oput.CustomServerPassword = (($paytxt | select-string "CustomServerPassword" ) -split ": " -split ",")[1]
		$oput.SERVERUSESBATTLEYE = (($paytxt | select-string "SERVERUSESBATTLEYE" ) -split ": " -split ",")[1]
		$oput.SESSIONFLAGS683SESSIONISPVE = (($paytxt | select-string "SESSIONFLAGS683SESSIONISPVE" ) -split ": " -split ",")[1]
		
		$oput
	
} else {
Write-warning "No payload received."
} //#if payload

} //#if context

//#Close the UDP client
$udpclient.Close()
} //#end Get-SteamServerRules
*/
		 
function ConvertSteamServerFields($input) {
		$input = $input.replace("ALLOWDOWNLOADCHARS_i",", ALLOWDOWNLOADCHARS: ")
		$input = $input.replace("ALLOWDOWNLOADITEMS_i",", ALLOWDOWNLOADITEMS: ")
		$input = $input.replace("ClusterId_s",", ClusterId: ")
		$input = $input.replace("CUSTOMSERVERNAME_s",", CUSTOMSERVERNAME: ")
		$input = $input.replace("PVPCUSTOMSERVERNAME_s",", PVPCUSTOMSERVERNAME: ")
		$input = $input.replace("DayTime_s",", DayTime: ")
		$input = $input.replace("GameMode_s",", GameMode: ")
		$input = $input.replace("GameMode_T",", GameMode2: ")
		$input = $input.replace("GameMode_C",", GameMode3: ")
		$input = $input.replace("Vaults_C",", Vaults: ")
		$input = $input.replace("MATCHTIMEOUT_f",", MATCHTIMEOUT: ")
		$input = $input.replace("ModId_l",", ModId: ")
		$input = $input.replace("MOD1_s",", Mod1: ")
		$input = $input.replace("MOD2_s",", Mod2: ")
		$input = $input.replace("MOD3_s",", Mod3: ")
		$input = $input.replace("MOD4_s",", Mod4: ")
		$input = $input.replace("MOD5_s",", Mod5: ")
		$input = $input.replace("MOD6_s",", Mod6: ")
		$input = $input.replace("MOD7_s",", Mod7: ")
		$input = $input.replace("MOD8_s",", Mod8: ")
		$input = $input.replace("MOD9_s",", Mod9: ")
		$input = $input.replace("MOD0_s",", Mod0: ")
		$input = $input.replace("Networking_i",", Networking: ")
		$input = $input.replace("NUMOPENPUBCONN",", NUMOPENPUBCONN: ")
		$input = $input.replace("OFFICIALSERVER_i",", OFFICIALSERVER: ")
		$input = $input.replace("OWNINGID",", OWNINGID: ")
		$input = $input.replace("OWNINGNAME",", OWNINGNAME: ")
		$input = $input.replace("P2PADDR",", P2PADDR: ")
		$input = $input.replace("P2PPORT",", P2PPORT: ")
		$input = $input.replace("SEARCHKEYWORDS_s",", SEARCHKEYWORDS: ")
		$input = $input.replace("CustomServerPassword_b",", CustomServerPassword: ")
		$input = $input.replace("SERVERUSESBATTLEYE_b",", SERVERUSESBATTLEYE: ")
		$input = $input.replace("SESSIONFLAGS683SESSIONISPVE_i",", SESSIONFLAGS683SESSIONISPVE: ")
		$input = $input.replace(": :",": ")
	return $input
};

//$serverlist = xhrRequest('GET',"http://arkdedicated.com/officialservers.ini")
//$serverlist = request('GET',"http://arkdedicated.com/officialservers.ini")

//{ UDP
server.bind($listenPort);
server.on('error', (err) => {
	console.log(`server error:\n${err.stack}`);
	server.close();
});

buf2 += "00";

for (var i = 0; i < buf2.length; i++) {
	myBuf2.push(buf2[i]);
};

server.on('message', (msg, rinfo) => {
	console.log(`server got: ${msg} from ${rinfo.address}:${rinfo.port}`);
});

server.on('listening', () => {
	const address = server.address();
	console.log(`server listening ${address.address}:${address.port}`);
server.send(msg, 0, msg.length, $port, $host, function(err, bytes) {
    console.log('UDP message ' + msg + 'sent to ' + $host +':'+ $port + ' - ' + bytes);
	console.log(err);
});
});
//}



