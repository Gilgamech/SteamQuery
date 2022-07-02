

function Dedupe-Info {
	param (
		$path = (get-location).path,
		$outfile = ".\info.csv",
		$files = (ls $path | where {$_.name -ne "info.csv"} | where {$_.name -ne "rules.csv"} | where {$_.name -ne "players.csv"}),
		$file = (gc $files[0].fullname |ConvertFrom-Json),
		$fileInfo = $file.info
	)
	$files[0] | %{
		$file = gc $_.fullname |ConvertFrom-Json
		$filename=$_.name -replace ".txt",""
		($file.info |select @{n="Timestamp";e={$filename}},Protocol, HostName, Map, ModDir, ModDesc, AppID, Players, MaxPlayers, Bots, Dedicated, Os, Password, Secure, Version, ExtraDataFlags, GamePort, SteamID, GameTags, GameID |convertto-csv -NoTypeInformation) > $outfile
	}
	$progress=0;
	$files | %{
		$progress++
		$progpercent = [math]::Round(($progress/$files.count)*100,2)
		Write-Progress -Activity "Info: $_" -Status "$progpercent% Complete:" -PercentComplete $progpercent;
		$file = gc $_.fullname |ConvertFrom-Json
		if (diff $fileInfo $file.info) {
			$filename=$_.name -replace ".txt",""
			($file.info |select @{n="Timestamp";e={$filename}},Protocol, HostName, Map, ModDir, ModDesc, AppID, Players, MaxPlayers, Bots, Dedicated, Os, Password, Secure, Version, ExtraDataFlags, GamePort, SteamID, GameTags, GameID |convertto-csv -NoTypeInformation) >> $outfile
		}
	}
}

function Dedupe-Rules {
	param (
		$path = (get-location).path,
		$outfile = ".\rules.csv",
		$files = (ls $path | where {$_.name -ne "info.csv"} | where {$_.name -ne "rules.csv"} | where {$_.name -ne "players.csv"}),
		$file = (gc $files[0].fullname |ConvertFrom-Json),
		$fileRules = $file.rules
	)
	$files[0] | %{
		$file = gc $_.fullname |ConvertFrom-Json
		$filename=$_.name -replace ".txt",""
		($file.rules |select @{n="Timestamp";e={$filename}},ALLOWDOWNLOADCHARS_i, ALLOWDOWNLOADITEMS_i, ClusterId_s, CUSTOMSERVERNAME_s, DayTime_s, GameMode_s, MATCHTIMEOUT_f, MOD0_s, MOD1_s, MOD2_s, MOD3_s, ModId_l, Networking_i, NUMOPENPUBCONN, OFFICIALSERVER_i, OWNINGID, OWNINGNAME, P2PADDR, P2PPORT, SEARCHKEYWORDS_s, ServerPassword_b, SERVERUSESBATTLEYE_b, SESSIONFLAGS, SESSIONISPVE_i |convertto-csv -NoTypeInformation) > $outfile
	}

	$progress=0;
	$files | %{
		$progress++
		$progpercent = [math]::Round(($progress/$files.count)*100,2)
		Write-Progress -Activity "Rules: $_" -Status "$progpercent% Complete:" -PercentComplete $progpercent;
		$file = gc $_.fullname |ConvertFrom-Json
		if (diff $fileRules $file.rules) {
			$filename=$_.name -replace ".txt",""
			($file.rules |select @{n="Timestamp";e={$filename}},ALLOWDOWNLOADCHARS_i, ALLOWDOWNLOADITEMS_i, ClusterId_s, CUSTOMSERVERNAME_s, DayTime_s, GameMode_s, MATCHTIMEOUT_f, MOD0_s, MOD1_s, MOD2_s, MOD3_s, ModId_l, Networking_i, NUMOPENPUBCONN, OFFICIALSERVER_i, OWNINGID, OWNINGNAME, P2PADDR, P2PPORT, SEARCHKEYWORDS_s, ServerPassword_b, SERVERUSESBATTLEYE_b, SESSIONFLAGS, SESSIONISPVE_i |convertto-csv -NoTypeInformation) >> $outfile
		}
	}
}

function Dedupe-Players {
	param (
		$path = (get-location).path,
		$outfile = ".\players.csv",
		$files = (ls $path | where {$_.name -ne "info.csv"} | where {$_.name -ne "rules.csv"} | where {$_.name -ne "players.csv"})
	)
	
	rm -force $outfile

	$progress=0;
	$files | %{
		$progress++
		$progpercent = [math]::Round(($progress/$files.count)*100,2)
		Write-Progress -Activity "Players: $_" -Status "$progpercent% Complete:" -PercentComplete $progpercent;
		$file = gc $_.fullname |ConvertFrom-Json
		$filename=$_.name -replace ".txt",""
		($file.players |select @{n="Timestamp";e={$filename}},Name,Time |convertto-csv -NoTypeinformation) >> $outfile
	}
}








