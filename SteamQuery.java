import java.io.*;
import java.net.*;
import java.sql.Connection;
import java.sql.DriverManager;
import java.util.Hashtable;
import java.nio.ByteBuffer;
import java.nio.ByteOrder;
import java.io.InputStream;
import java.math.BigInteger;
import java.util.Arrays;

class SteamQuery {
   public static void main(String args[]) throws Exception {
		//InetAddress IPAddress = InetAddress.getByName("PvP.GamingOGs.com");
		InetAddress IPAddress = InetAddress.getByName("pvp1.arkade.online");
		String newline = System.getProperty("line.separator");
		int ipPort = 27015;
		SteamServerPlayers(IPAddress, ipPort);
		convertStringtoInt("USÃ³D");
		convertStringtoInt("Ã§Ã„Ã®E");
		convertStringtoInt(",2=E");

/*
		//SteamServerInfo(IPAddress, ipPort);
		//SteamServerRules(IPAddress, ipPort);
		//SteamServerPlayers(IPAddress, ipPort);
*/
	}

	public static void convertStringtoInt(String str) {
		//Reverse string to byte[]
		byte[] byteArr = str.getBytes();
		//Convert byte[] to int
		System.out.println(convertToShort(byteArr));
	}

	public static short convertToShort(byte[] array) {
		ByteBuffer buffer = ByteBuffer.wrap(array);
		return buffer.getShort();
	}
	
	public static String asciiToString(String str) {
        int num = 0; 
		String output = "";
        for (int i = 0; i < str.length(); i++) { 
            num = num * 10 + (str.charAt(i) - '0'); // Append the current digit 
            if (num >= 32 && num <= 122) { // If num is within the required range 
				output = output + (char)num;
                num = 0; 
            } 
        } 
		return output;
    } 

	public static void DBTest() {
		  Connection c = null;
		  try {
			 Class.forName("org.postgresql.Driver");
			 c = DriverManager
				.getConnection("jdbc:postgresql://localhost:5432/postgres",
				"postgres", "dbpasswd");
		  } catch (Exception e) {
			 e.printStackTrace();
			 System.err.println(e.getClass().getName()+": "+e.getMessage());
			 System.exit(0);
		  }
		  System.out.println("Opened database successfully");
	}

	public static void ArkdataSteamOfficialServers() {
	}

	public static void HashtableTest() {
	   Hashtable<String, Integer> numbers
		 = new Hashtable<String, Integer>();
	   numbers.put("one", 1);
	   numbers.put("two", 2);
	   numbers.put("three", 3);
	   
	   Integer n = numbers.get("two");
	   if (n != null) {
		 System.out.println("two = " + n);
	   }
   }

	public static void ArkdataUnofficialServers() {
	}

	public static void SteamServers() {
	}

	public static String SteamServerFields() {
		return "Fix this later.";
	}
	
	public static void SteamServerInfo(InetAddress IPAddress, int ipPort) throws Exception {
		DatagramSocket clientSocket = new DatagramSocket();
		System.out.println("Requesting from "+IPAddress+" on port:"+ipPort);
		byte[] sendData = new byte[1024];
		byte[] receiveData = new byte[1024];
		
		sendData =  "ÿÿÿÿTSource Engine Query ".getBytes(); 
		sendData[24] &= (byte) 00; 
		
		DatagramPacket sendPacket = new DatagramPacket(sendData, sendData.length, IPAddress, ipPort);
		clientSocket.send(sendPacket);
		DatagramPacket receivePacket = new DatagramPacket(receiveData, receiveData.length);
		clientSocket.receive(receivePacket);
		sendData = receivePacket.getData();
		String outputString = new String(receivePacket.getData());
		String[] outputArray=ConvertFields(outputString).split(",");
		System.out.println("FROM SERVER:" + outputArray[0]);
		clientSocket.close();
	}
	
	public static void SteamServerPlayers(InetAddress IPAddress, int ipPort) throws Exception {
		DatagramSocket clientSocket = new DatagramSocket();
		System.out.println("Requesting from "+IPAddress+" on port:"+ipPort);
		byte[] sendData = new byte[1024];
		byte[] receiveData = new byte[1024];

		//Send initial handshake
		sendData =  "ÿÿÿÿUÿÿÿÿ".getBytes(); 
		
		DatagramPacket sendPacket = new DatagramPacket(sendData, sendData.length, IPAddress, ipPort);
		clientSocket.send(sendPacket);
		DatagramPacket receivePacket = new DatagramPacket(receiveData, receiveData.length);
		clientSocket.receive(receivePacket);
		sendData = receivePacket.getData();

		//Modify challenge to be response	
		//if (returnData) {
			sendData[4] = (byte) "U".getBytes()[0];
		// }
		
		sendPacket = new DatagramPacket(sendData, sendData.length, IPAddress, ipPort);
		clientSocket.send(sendPacket);
		receivePacket = new DatagramPacket(receiveData, receiveData.length);
		clientSocket.receive(receivePacket);
		String outputString = new String(receivePacket.getData(), "UTF-8");
		
DataInputStream din = new DataInputStream(new ByteArrayInputStream(receivePacket.getData(), receivePacket.getOffset(), receivePacket.getLength()));
//System.out.println("FROM DIN:" + din.readAllBytes());
//byteBuff(ByteBuffer.wrap(myArray));
		
		outputString = outputString.substring(6);
		String splitter = new String("0".getBytes(), "UTF-8");
		String[] outputArray=ConvertFields(outputString).split(splitter);
		outputString=asciiToString(outputString);
		
		
		
		//System.out.println("FROM SERVER:" + outputArray[0]);
		//String newline = System.getProperty("line.separator");
		for (String player : outputArray) {
			System.out.println("FROM SERVER:" + player);
		}
		
		
		clientSocket.close();
		
		
		
/*
	//If the payload isn't empty, print as Bytes then print as ASCII
	if (payload) {

		playercount = (payload[(5)])
		//Haicut the first 6...
		payload = payload[6..(payload.Length)]

		//If there are players...
		if (payload.length -gt 6) {
			splitpayload = payload -join " " -replace " 0 0 0 0 0 ","`n" -split "`n"
			TextPayload = splitpayload | for{ -join (this.split " " | Flip-BytesToText -Unicode)}; // end foreach _
			if (TextPayload.length -gt 4) {
				PlayerPayload = TextPayload | for{ (this.substring(0,4)),(this.substring(4,(this.length-4)))}
			} //end if TextPayload
			
			// Foreach line in the count of splits, - you'll iterate over each split
			for (i = 2; i -le (PlayerPayload.length - 1); i++) { 
				//if the line number is even, write as property and the next line as value.
				if ((i mod 2)) { 
					// Even line is the player name property, odd is the time value

					//Write the even item to "Player" and the odd to "Time". 
					if (PlayerPayload[i] -eq (Flip-BytesToText 1,1,1,1 -a)) {
						[string]playerproperty = [int]0 
					} else {
						[string]playerproperty = PlayerPayload[ i ]
					}; //end if PlayerPayload
					
					
					bytes = PlayerPayload[(i + 1)] | Flip-TextToBytes -a 
				if (bytes) {
					[int]timevalue = [bitconverter]::ToSingle(bytes,0)
				} //end if TextPayload

					timef = (get-date) - (get-date).AddSeconds(-timevalue)

					//Add a line to the array, create columns for Name, Value, Type
					obj += "" | select ID, Player, Score, Time, TimeF; 
					//Math out the index of the new line
					arrayspot = ( obj.length -1 )
					//Populate Name
					obj[ arrayspot ].ID = 0 //ID is always 0.
					obj[ arrayspot ].Player = playerproperty 
					obj[ arrayspot ].Score = 0 //Score is always 0.
					obj[ arrayspot ].Time = timevalue 
					obj[ arrayspot ].TimeF = timef 

			} //end if i

			} //end for conlen
		} else { //If payload.length -le 6, there were no players found.
			[string]property = ("No players found.")
			[string]value = (True)

			//Add a line to the array, create columns for Name, Value, Type
			obj += "" | select ID, Player, Score, Time, TimeF; 
			//Math out the index of the new line
			arrayspot = ( obj.length -1 )
			//Populate Name
			obj[ arrayspot ].Player = property 
			obj[ arrayspot ].Time = value 
		}; //end if payload

		//"Raw: Payload"
		"Server player count: playercount"
		"Output player count: (obj.Player.count)"
		obj | where {this.player -ne "" } | sort player -descending

		} else {
			Write-warning "No payload received."
		} //end if payload
*/

   }

	public static void SteamServerRules(InetAddress IPAddress, int ipPort) throws Exception {
		DatagramSocket clientSocket = new DatagramSocket();
		System.out.println("Requesting from "+IPAddress+" on port:"+ipPort);
		byte[] sendData = new byte[1024];
		byte[] receiveData = new byte[1024];
		
		//Send initial handshake
		sendData =  "ÿÿÿÿVÿÿÿÿ".getBytes(); 
		
		DatagramPacket sendPacket = new DatagramPacket(sendData, sendData.length, IPAddress, ipPort);
		clientSocket.send(sendPacket);
		DatagramPacket receivePacket = new DatagramPacket(receiveData, receiveData.length);
		clientSocket.receive(receivePacket);
		sendData = receivePacket.getData();
		
		//Modify challenge to be response	
		//if (returnData) {
			sendData[4] = (byte) "V".getBytes()[0];
		// }
		
		sendPacket = new DatagramPacket(sendData, sendData.length, IPAddress, ipPort);
		clientSocket.send(sendPacket);
		receivePacket = new DatagramPacket(receiveData, receiveData.length);
		clientSocket.receive(receivePacket);
		String outputString = new String(receivePacket.getData());
		System.out.println("FROM SERVER:" + ConvertFields(outputString));
		clientSocket.close();
   }

	public static String ConvertFields(String toConvert) throws Exception {
		toConvert = toConvert.replace("ALLOWDOWNLOADCHARS_i",", ALLOWDOWNLOADCHARS: ");
		toConvert = toConvert.replace("ALLOWDOWNLOADITEMS_i",", ALLOWDOWNLOADITEMS: ");
		toConvert = toConvert.replace("ClusterId_s",", ClusterId: ");
		toConvert = toConvert.replace("CUSTOMSERVERNAME_s",", CUSTOMSERVERNAME: ");
		toConvert = toConvert.replace("PVPCUSTOMSERVERNAME_s",", PVPCUSTOMSERVERNAME: ");
		toConvert = toConvert.replace("DayTime_s",", DayTime: ");
		toConvert = toConvert.replace("GameMode_s",", GameMode: ");
		toConvert = toConvert.replace("GameMode_T",", GameMode2: ");
		toConvert = toConvert.replace("GameMode_C",", GameMode3: ");
		toConvert = toConvert.replace("Vaults_C",", Vaults: ");
		toConvert = toConvert.replace("MATCHTIMEOUT_f",", MATCHTIMEOUT: ");
		toConvert = toConvert.replace("ModId_l",", ModId: ");
		toConvert = toConvert.replace("MOD1_s",", Mod1: ");
		toConvert = toConvert.replace("MOD2_s",", Mod2: ");
		toConvert = toConvert.replace("MOD3_s",", Mod3: ");
		toConvert = toConvert.replace("MOD4_s",", Mod4: ");
		toConvert = toConvert.replace("MOD5_s",", Mod5: ");
		toConvert = toConvert.replace("MOD6_s",", Mod6: ");
		toConvert = toConvert.replace("MOD7_s",", Mod7: ");
		toConvert = toConvert.replace("MOD8_s",", Mod8: ");
		toConvert = toConvert.replace("MOD9_s",", Mod9: ");
		toConvert = toConvert.replace("MOD0_s",", Mod0: ");
		toConvert = toConvert.replace("Networking_i",", Networking: ");
		toConvert = toConvert.replace("NUMOPENPUBCONN",", NUMOPENPUBCONN: ");
		toConvert = toConvert.replace("OFFICIALSERVER_i",", OFFICIALSERVER: ");
		toConvert = toConvert.replace("OWNINGID",", OWNINGID: ");
		toConvert = toConvert.replace("OWNINGNAME",", OWNINGNAME: ");
		toConvert = toConvert.replace("P2PADDR",", P2PADDR: ");
		toConvert = toConvert.replace("P2PPORT",", P2PPORT: ");
		toConvert = toConvert.replace("SEARCHKEYWORDS_s",", SEARCHKEYWORDS: ");
		toConvert = toConvert.replace("CustomServerPassword_b",", CustomServerPassword: ");
		toConvert = toConvert.replace("SERVERUSESBATTLEYE_b",", SERVERUSESBATTLEYE: ");
		toConvert = toConvert.replace("SESSIONFLAGS683SESSIONISPVE_i",", SESSIONFLAGS683SESSIONISPVE: ");
		toConvert = toConvert.replace(": :",": ");
		toConvert = toConvert.replace(",,",",");
		//toConvert = toConvert.replace("    ",",");
		//toConvert = toConvert.replace(" 0 0 0 0 0 ",",");
		return toConvert;
   }
	
}



